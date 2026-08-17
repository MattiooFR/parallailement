import { cleanText } from "../stage-data";
import type { StageSourceDefinition } from "../stage-source-registry";
import {
  buildStage,
  parseEuropeanDate,
  stageLanguageFromValue,
} from "./shared";

type JsonRecord = Record<string, unknown>;

function recordsFromPayload(payload: unknown): JsonRecord[] {
  if (Array.isArray(payload)) return payload.flatMap(recordsFromPayload);
  if (!payload || typeof payload !== "object") return [];
  const record = payload as JsonRecord;
  const graph = recordsFromPayload(record["@graph"]);
  return [record, ...graph];
}

function recordType(record: JsonRecord) {
  const value = record["@type"];
  return Array.isArray(value) ? value.map(String) : [String(value ?? "")];
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

export function parseJsonLdStages(
  html: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  const records = Array.from(
    html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ).flatMap((match) => {
    try {
      return recordsFromPayload(JSON.parse(match[1]));
    } catch {
      return [];
    }
  });

  return records.flatMap((record, index) => {
    if (
      !recordType(record).some((type) =>
        /^(EducationEvent|Event|CourseInstance)$/i.test(type),
      )
    ) {
      return [];
    }
    const title = cleanText(String(record.name ?? ""));
    const startDate = parseEuropeanDate(String(record.startDate ?? ""));
    const endDate =
      parseEuropeanDate(String(record.endDate ?? "")) ?? startDate;
    if (!title || !startDate || !endDate) return [];
    const location = asRecord(record.location);
    const address = asRecord(location.address);
    const offersValue = Array.isArray(record.offers)
      ? record.offers[0]
      : record.offers;
    const offers = asRecord(offersValue);
    const price = Number.parseFloat(String(offers.price ?? ""));
    const availabilityValue = String(offers.availability ?? "").toLowerCase();
    const availability = /soldout/.test(availabilityValue)
      ? "full"
      : /instock|limitedavailability/.test(availabilityValue)
        ? "available"
        : "unknown";
    const derivedSource: StageSourceDefinition = {
      ...source,
      defaults: {
        location: cleanText(String(location.name ?? source.defaults.location)),
        department: cleanText(
          String(address.addressLocality ?? source.defaults.department),
        ),
        region: cleanText(String(address.addressRegion ?? source.defaults.region)),
        country: cleanText(
          String(address.addressCountry ?? source.defaults.country ?? source.organizerCountry),
        ),
      },
    };
    const stage = buildStage({
      source: derivedSource,
      externalId: String(record["@id"] ?? record.url ?? `${index}`),
      title,
      startDate,
      endDate,
      location: derivedSource.defaults.location,
      checkedAt,
      today,
      language: stageLanguageFromValue(record.inLanguage) ?? source.language,
      price: Number.isFinite(price) ? price : null,
      currency: offers.priceCurrency ? String(offers.priceCurrency) : null,
      availability,
      sourceUrl: String(offers.url ?? record.url ?? source.url),
      description: cleanText(String(record.description ?? "")),
    });
    return stage ? [stage] : [];
  });
}
