import { cleanText } from "../stage-data";
import type { StageSourceDefinition } from "../stage-source-registry";
import {
  buildStage,
  parseEuropeanDate,
  stageLanguageFromValue,
} from "./shared";

function parseIcsDate(value: string) {
  const raw = value.trim();
  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }
  return parseEuropeanDate(raw);
}

function previousUtcDay(date: string) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

export function parseIcsStages(
  ics: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  const unfolded = ics.replace(/\r?\n[ \t]/g, "");
  const events = Array.from(
    unfolded.matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)\r?\nEND:VEVENT/g),
  );

  return events.flatMap((match, index) => {
    const lines = match[1].split(/\r?\n/);
    const findLine = (name: string) =>
      lines.find((line) => line.toUpperCase().startsWith(name));
    const valueOf = (line: string | undefined) =>
      line?.slice(line.indexOf(":") + 1).replace(/\\,/g, ",").trim() ?? "";
    const summaryLine = findLine("SUMMARY");
    const startLine = findLine("DTSTART");
    const endLine = findLine("DTEND");
    const title = cleanText(valueOf(summaryLine));
    const startDate = parseIcsDate(valueOf(startLine));
    let endDate = parseIcsDate(valueOf(endLine)) ?? startDate;
    if (!title || !startDate || !endDate) return [];
    if (/VALUE=DATE/i.test(endLine ?? "")) endDate = previousUtcDay(endDate);
    const rawLocation = cleanText(valueOf(findLine("LOCATION")));
    const locationParts = rawLocation.split(",").map((part) => part.trim());
    const location = locationParts[0] || source.defaults.location;
    const destinationCountry =
      locationParts.length > 1
        ? locationParts[locationParts.length - 1]
        : source.defaults.country;
    const languageMatch = /LANGUAGE=([^;:]+)/i.exec(summaryLine ?? "");
    const derivedSource: StageSourceDefinition = {
      ...source,
      defaults: {
        ...source.defaults,
        country: destinationCountry || source.defaults.country,
      },
    };
    const stage = buildStage({
      source: derivedSource,
      externalId: valueOf(findLine("UID")) || `${index}`,
      title,
      startDate,
      endDate,
      location,
      checkedAt,
      today,
      language:
        stageLanguageFromValue(languageMatch?.[1]) ?? source.language,
      sourceUrl: valueOf(findLine("URL")) || source.url,
      description: valueOf(findLine("DESCRIPTION")),
    });
    return stage ? [stage] : [];
  });
}
