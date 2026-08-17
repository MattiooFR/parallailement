import { cleanText, decodeHtml } from "../stage-data";
import type { StageSourceDefinition } from "../stage-source-registry";
import { buildStage, detectExplicitLanguage, parseEuropeanDate } from "./shared";

type ShvOffer = {
  title?: string;
  offerStartDate?: string;
  offerEndDate?: string;
  location?: string;
  countriesShort?: string;
  price?: string;
  uri?: string;
  weblink?: string;
  description?: string;
  latitude?: string | number;
  longitude?: string | number;
  flight?: boolean;
  categories?: Array<{ title?: string }>;
  user?: {
    firstName?: string;
    lastName?: string;
  };
};

const shvCountryNames: Record<string, string> = {
  switzerland: "Suisse",
  schweiz: "Suisse",
  france: "France",
  frankreich: "France",
  italy: "Italie",
  italien: "Italie",
  spain: "Espagne",
  spanien: "Espagne",
  germany: "Allemagne",
  deutschland: "Allemagne",
  austria: "Autriche",
  österreich: "Autriche",
  turkey: "Turquie",
  türkei: "Turquie",
  slovenia: "Slovénie",
  slowenien: "Slovénie",
  morocco: "Maroc",
  marokko: "Maroc",
  portugal: "Portugal",
  greece: "Grèce",
  griechenland: "Grèce",
};

function normalizeShvCountry(value: string | undefined, fallback: string) {
  return shvCountryNames[cleanText(value ?? "").toLowerCase()] ?? fallback;
}

export function parseShvOfferPayload(
  payload: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  let offers: ShvOffer[];
  try {
    const parsed: unknown = JSON.parse(payload);
    offers = Array.isArray(parsed) ? (parsed as ShvOffer[]) : [];
  } catch {
    return [];
  }

  return offers.flatMap((offer, index) => {
    const title = cleanText(offer.title ?? "");
    const startDate = parseEuropeanDate(offer.offerStartDate ?? "");
    const endDate = parseEuropeanDate(offer.offerEndDate ?? "") ?? startDate;
    if (!title || !startDate || !endDate) return [];
    const categories = (offer.categories ?? [])
      .map((category) => cleanText(category.title ?? ""))
      .filter(Boolean)
      .join(" · ");
    const description = cleanText(offer.description ?? "");
    const country = normalizeShvCountry(
      offer.countriesShort,
      source.defaults.country ?? source.organizerCountry,
    );
    const organizer = cleanText(
      [offer.user?.firstName, offer.user?.lastName].filter(Boolean).join(" "),
    );
    const derivedSource: StageSourceDefinition = {
      ...source,
      ...(organizer
        ? { name: organizer, organizerType: "school" as const }
        : {}),
      defaults: { ...source.defaults, country },
    };
    const priceText = cleanText(offer.price ?? "");
    const numericPrice = /([0-9][\d'.,]*)/.exec(priceText)?.[1];
    const price = numericPrice
      ? Number.parseFloat(
          numericPrice
            .replace(/'/g, "")
            .replace(/,(?=\d{2}$)/, ".")
            .replace(/,(?=\d{3}(?:\D|$))/g, ""),
        )
      : null;
    const stage = buildStage({
      source: derivedSource,
      externalId: offer.uri ?? `${startDate}-${index}`,
      title,
      startDate,
      endDate,
      location: cleanText(offer.location ?? source.defaults.location),
      checkedAt,
      today,
      language:
        detectExplicitLanguage(`${title} ${description}`) ?? source.language,
      price: Number.isFinite(price) ? price : null,
      currency: Number.isFinite(price) ? "CHF" : null,
      sourceUrl: offer.uri
        ? new URL(offer.uri, source.url).toString()
        : offer.weblink || source.url,
      description: description || categories,
      eligibilityText: offer.flight ? `voyage ${categories}` : categories,
    });
    if (!stage) return [];
    const latitude = Number.parseFloat(String(offer.latitude ?? ""));
    const longitude = Number.parseFloat(String(offer.longitude ?? ""));
    return [
      {
        ...stage,
        ...(Number.isFinite(latitude) && Number.isFinite(longitude)
          ? {
              latitude,
              longitude,
              locationPrecision: "exact" as const,
            }
          : {}),
      },
    ];
  });
}

export function parseShvTrainingHtml(
  html: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  const cards = Array.from(
    html.matchAll(
      /<a\b[^>]*class="[^"]*\bmap-item\b[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    ),
  );

  return cards.flatMap((match) => {
    const href = decodeHtml(match[1]);
    const body = match[2];
    const title = cleanText(/<h2[^>]*>([\s\S]*?)<\/h2>/i.exec(body)?.[1] ?? "");
    const details = /<p[^>]*>\s*(\d{2}\.\d{2}\.\d{4})\s*-\s*(\d{2}\.\d{2}\.\d{4})\s*<br\s*\/?>([\s\S]*?)<br\s*\/?>/i.exec(
      body,
    );
    const startDate = details ? parseEuropeanDate(details[1]) : null;
    const endDate = details ? parseEuropeanDate(details[2]) : null;
    if (!title || !startDate || !endDate) return [];
    const location = cleanText(details?.[3] ?? source.defaults.location);
    const priceMatch = /<strong>\s*Fr\.\s*([\d'&#;\.]+)<\/strong>/i.exec(body);
    const price = priceMatch
      ? Number.parseFloat(
          decodeHtml(priceMatch[1]).replace(/['\s]/g, ""),
        )
      : null;
    const stage = buildStage({
      source,
      externalId: href,
      title,
      startDate,
      endDate,
      location,
      checkedAt,
      today,
      language: detectExplicitLanguage(`${title} ${body}`) ?? source.language,
      price: Number.isFinite(price) ? price : null,
      currency: price !== null ? "CHF" : null,
      sourceUrl: new URL(href, source.url).toString(),
      description: cleanText(body),
    });
    return stage ? [stage] : [];
  });
}
