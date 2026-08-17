import {
  cleanText,
  inferDescription,
  inferPrerequisites,
  inferStageDiscipline,
  inferStageLevel,
  isUpcoming,
  slugify,
  withStageDefaults,
  type Stage,
  type StageAvailability,
} from "../stage-data";
import type { StageLanguage } from "../stage-language";
import type { StageSourceDefinition } from "../stage-source-registry";

export function isEligibleStageTitle(title: string) {
  const value = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (
    /\b(competition|championnat|championship|open\s+20\d{2}|cup|race|meisterschaft|wettkampf|campeonato|competicion|gara|campionato)\b/.test(
      value,
    )
  ) {
    return false;
  }
  if (/\b(sortie libre|free flying|club outing|vol libre sans encadrement)\b/.test(value)) {
    return false;
  }
  if (
    /\b(tandem|biplace|biposto)\b/.test(value) &&
    !/\b(stage|formation|qualification|course|training|kurs|ausbildung|curso|corso)\b/.test(
      value,
    )
  ) {
    return false;
  }

  return /stage|formation|cours|initiation|progression|perfectionnement|thermi|cross|siv|siku|pilotage|securit|hike|marche|coaching|voyage|qualification|course|clinic|training|ground.?handling|xc\b|safety|kurs|ausbildung|grundkurs|hohenflug|streckenflug|sicherheit|thermik|flugreise|curso|iniciaci|perfeccionamiento|seguridad|termic|corso|avanzato|sicurezza|volo/.test(
    value,
  );
}

export function detectExplicitLanguage(text: string): StageLanguage | null {
  const value = cleanText(text).toLowerCase();
  if (/\((en|english)\)|\b(in english|language\s*:\s*english|anglais|englisch)\b/.test(value)) {
    return "en";
  }
  if (/\((de|deutsch)\)|\b(unterrichtssprache\s*:\s*deutsch|in deutscher sprache|allemand)\b/.test(value)) {
    return "de";
  }
  if (/\((fr|francais|français)\)|\b(en francais|en français|langue\s*:\s*francais)\b/.test(value)) {
    return "fr";
  }
  if (/\((es|espanol|español)\)|\b(en espanol|en español|idioma\s*:\s*espanol)\b/.test(value)) {
    return "es";
  }
  if (/\((it|italiano)\)|\b(in italiano|lingua\s*:\s*italiano)\b/.test(value)) {
    return "it";
  }
  return null;
}

export function stageLanguageFromValue(value: unknown): StageLanguage | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (/^(fr|fra|fre|french|francais|français)$/.test(normalized)) return "fr";
  if (/^(en|eng|english|anglais)$/.test(normalized)) return "en";
  if (/^(es|spa|spanish|espanol|español)$/.test(normalized)) return "es";
  if (/^(it|ita|italian|italiano)$/.test(normalized)) return "it";
  if (/^(de|deu|ger|german|deutsch)$/.test(normalized)) return "de";
  return null;
}

export function parseEuropeanDate(value: string): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const european = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(
    value.trim(),
  );
  if (!european) return null;
  return `${european[3]}-${european[2].padStart(2, "0")}-${european[1].padStart(2, "0")}`;
}

function countryFromLocation(location: string, fallback: string) {
  const value = location
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const countries: Array<[RegExp, string]> = [
    [/ager|organya|castejon|pedro bernardo|algodonales|piedrahita/, "Espagne"],
    [/bassano|dolomit|val di fassa|gardasee|malcesine|idrosee|sizilien/, "Italie"],
    [/oludeniz|babadag/, "Turquie"],
    [/kobarid|tolmin/, "Slovénie"],
    [/krusevo/, "Macédoine du Nord"],
    [/marokko|agadir|tiznit/, "Maroc"],
    [/teneriffa|tenerife|kanaren/, "Espagne"],
    [/portugal|nazare/, "Portugal"],
    [/korsika|westalpen|normandie|pyrenae|laragne|annecy/, "France"],
    [/patagonien/, "Argentine"],
    [/namibia/, "Namibie"],
    [/kanada|vancouver|calgary/, "Canada"],
    [/griechenland|athen|patras/, "Grèce"],
    [/danemark/, "Danemark"],
  ];
  return countries.find(([pattern]) => pattern.test(value))?.[1] ?? fallback;
}

export function buildStage({
  source,
  externalId,
  title,
  startDate,
  endDate,
  location,
  checkedAt,
  today,
  language,
  price = null,
  currency = null,
  availability = "unknown",
  sourceUrl,
  description,
  eligibilityText,
}: {
  source: StageSourceDefinition;
  externalId: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  checkedAt: string;
  today: string;
  language?: StageLanguage | null;
  price?: number | null;
  currency?: string | null;
  availability?: StageAvailability;
  sourceUrl?: string;
  description?: string;
  eligibilityText?: string;
}): Stage | null {
  const cleanTitle = cleanText(title);
  if (
    !cleanTitle ||
    !isEligibleStageTitle(`${cleanTitle} ${eligibilityText ?? ""}`)
  ) {
    return null;
  }
  const discipline = inferStageDiscipline(cleanTitle);
  const level = inferStageLevel(cleanTitle, discipline);
  const cleanLocation = cleanText(location || source.defaults.location);
  const stage = withStageDefaults({
    id: `${source.id}-${slugify(externalId || `${cleanTitle}-${startDate}`)}`,
    title: cleanTitle,
    startDate,
    endDate,
    location: cleanLocation,
    department: source.defaults.department,
    region: source.defaults.region,
    country: countryFromLocation(
      cleanLocation,
      source.defaults.country ?? source.organizerCountry,
    ),
    organizer: source.name,
    organizerCountry: source.organizerCountry,
    organizerType: source.organizerType,
    language:
      language === undefined
        ? detectExplicitLanguage(`${cleanTitle} ${description ?? ""}`) ??
          source.language
        : language,
    level,
    discipline,
    price,
    currency,
    availability,
    prerequisites: inferPrerequisites(level),
    description: cleanText(description ?? "") || inferDescription(discipline),
    sourceUrl: sourceUrl ?? source.url,
    sourceLabel: `Source officielle · ${source.name}`,
    sourceKind: "Calendrier",
    verifiedAt: checkedAt,
  });

  return isUpcoming(stage, today) ? stage : null;
}

export function parseLooseStageHtml(
  html: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
): Stage[] {
  const articleMatches = Array.from(
    html.matchAll(/<(article|li|div)\b[^>]*(?:class="[^"]*(?:course|kurs|event|stage|training)[^"]*")?[^>]*>([\s\S]*?)<\/\1>/gi),
  );
  const blocks = articleMatches.length > 0 ? articleMatches.map((match) => match[2]) : [html];
  return blocks.flatMap((block, index) => {
    const title = cleanText(
      /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i.exec(block)?.[1] ?? "",
    );
    const dateMatch = /(\d{1,2}[./-]\d{1,2}[./-]\d{4})\s*(?:-|–|bis|au|to)\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i.exec(
      cleanText(block),
    );
    if (!title || !dateMatch) return [];
    const startDate = parseEuropeanDate(dateMatch[1]);
    const endDate = parseEuropeanDate(dateMatch[2]);
    if (!startDate || !endDate) return [];
    const location = cleanText(
      new RegExp(`${dateMatch[2].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^<]*<\\/p>\\s*<p[^>]*>([\\s\\S]*?)<\\/p>`, "i").exec(
        block,
      )?.[1] ?? source.defaults.location,
    );
    const link = /<a[^>]+href="([^"]+)"/i.exec(block)?.[1];
    const priceMatch = /([\d.'\s]+(?:[,.]\d{1,2})?)\s*(€|EUR|CHF|Fr\.|£|GBP)/i.exec(
      cleanText(block),
    );
    const price = priceMatch
      ? Number.parseFloat(
          priceMatch[1].replace(/[.'\s]/g, "").replace(",", "."),
        )
      : null;
    const currency = priceMatch
      ? /£|GBP/i.test(priceMatch[2])
        ? "GBP"
        : /CHF|Fr\./i.test(priceMatch[2])
          ? "CHF"
          : "EUR"
      : null;
    const stage = buildStage({
      source,
      externalId: link ?? `${index}`,
      title,
      startDate,
      endDate,
      location,
      checkedAt,
      today,
      price: Number.isFinite(price) ? price : null,
      currency,
      sourceUrl: link ? new URL(link, source.url).toString() : source.url,
      description: cleanText(block),
    });
    return stage ? [stage] : [];
  });
}
