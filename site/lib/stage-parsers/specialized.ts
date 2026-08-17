import { cleanText, decodeHtml } from "../stage-data";
import type { StageSourceDefinition } from "../stage-source-registry";
import { buildStage, stageLanguageFromValue } from "./shared";

const englishMonths: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const italianMonths: Record<string, number> = {
  gennaio: 1,
  febbraio: 2,
  marzo: 3,
  aprile: 4,
  maggio: 5,
  giugno: 6,
  luglio: 7,
  agosto: 8,
  settembre: 9,
  ottobre: 10,
  novembre: 11,
  dicembre: 12,
};

const spanishMonths: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

function isoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseEnglishDateRange(value: string) {
  const normalized = cleanText(value).replace(/[–—]/g, "-");
  const match = /(\d{1,2})(?:st|nd|rd|th)?\s*(?:([A-Za-z]+)\s*)?-\s*(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(20\d{2})/i.exec(
    normalized,
  );
  if (!match) return null;
  const endMonth = englishMonths[match[4].toLowerCase()];
  const startMonth = match[2]
    ? englishMonths[match[2].toLowerCase()]
    : endMonth;
  if (!startMonth || !endMonth) return null;
  const year = Number(match[5]);
  const startDate = isoDate(year, startMonth, Number(match[1]));
  const endDate = isoDate(year, endMonth, Number(match[3]));
  if (endDate < startDate) return null;
  return { startDate, endDate };
}

export function parseBhpaCourses(
  html: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  const rows = Array.from(
    html.matchAll(/<tr\b[^>]*class=["'][^"']*\btr[12]\b[^"']*["'][^>]*>([\s\S]*?)<\/tr>/gi),
  );
  return rows.flatMap((row, index) => {
    const labels = ["Date", "Course", "Club", "Contact"];
    const cells = Array.from(row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)).map(
      (cell, cellIndex) =>
        cleanText(cell[1]).replace(
          new RegExp(`^${labels[cellIndex] ?? ""}\\s+(?=\\S)`, "i"),
          "",
        ),
    );
    if (cells.length < 3) return [];
    const dates = parseEnglishDateRange(cells[0]);
    if (!dates) return [];
    const stage = buildStage({
      source,
      externalId: `${dates.startDate}-${cells[1]}-${index}`,
      title: cells[1],
      ...dates,
      location: cells[2],
      checkedAt,
      today,
      language: "en",
      sourceUrl: source.url,
      description: "Formation officielle publiée par la BHPA pour pilotes qualifiés.",
    });
    return stage ? [stage] : [];
  });
}

export function parseWooCommerceCourseCards(
  html: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  const cards = Array.from(
    html.matchAll(
      /<h2\b[^>]*class=["'][^"']*woocommerce-loop-product__title[^"']*["'][^>]*>([\s\S]*?)<\/h2>/gi,
    ),
  );
  return cards.flatMap((match, index) => {
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = cards[index + 1]?.index ?? Math.min(html.length, bodyStart + 4_000);
    const body = html.slice(bodyStart, bodyEnd);
    const title = cleanText(match[1]);
    const dates = parseEnglishDateRange(title);
    if (!dates) return [];
    const link = decodeHtml(/<a\b[^>]*href=["']([^"']+)["']/i.exec(match[1])?.[1] ?? "");
    const priceMatch = /(?:£|&pound;)\s*([\d,.]+)/i.exec(body);
    const price = priceMatch
      ? Number.parseFloat(priceMatch[1].replace(/,/g, ""))
      : null;
    const stage = buildStage({
      source,
      externalId: link || `${dates.startDate}-${index}`,
      title,
      ...dates,
      location: source.defaults.location,
      checkedAt,
      today,
      language: source.language,
      price: Number.isFinite(price) ? price : null,
      currency: Number.isFinite(price) ? "GBP" : null,
      sourceUrl: link ? new URL(link, source.url).toString() : source.url,
      description: cleanText(body).slice(0, 500),
    });
    return stage ? [stage] : [];
  });
}

export function parseProAeroCourse(
  html: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  const title = cleanText(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? "");
  const dates = /Date del corso:[\s\S]{0,100}?(\d{1,2})\.\s*-\s*(\d{1,2})\.(\d{1,2})\.(20\d{2})/i.exec(
    html,
  );
  if (!title || !dates) return [];
  const startDate = isoDate(Number(dates[4]), Number(dates[3]), Number(dates[1]));
  const endDate = isoDate(Number(dates[4]), Number(dates[3]), Number(dates[2]));
  const locationText = cleanText(
    /Sede del corso:[\s\S]{0,200}?<br\s*\/?>([\s\S]*?)<\/p>/i.exec(html)?.[1] ?? "",
  );
  const location = /\bCapolago\b/i.test(locationText)
    ? "Capolago"
    : source.defaults.location;
  const languageText = cleanText(
    /Lingua del corso:[\s\S]{0,80}?<br\s*\/?>([\s\S]*?)<\/p>/i.exec(html)?.[1] ?? "",
  );
  const stage = buildStage({
    source,
    externalId: `${title}-${startDate}`,
    title,
    startDate,
    endDate,
    location,
    checkedAt,
    today,
    language: stageLanguageFromValue(languageText) ?? source.language,
    price: null,
    sourceUrl: source.url,
    description: cleanText(html).slice(0, 500),
  });
  return stage ? [stage] : [];
}

export function parseItalianDatedArticle(
  html: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  const title = cleanText(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? "");
  const description = decodeHtml(
    /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i.exec(html)?.[1] ?? "",
  );
  const year = Number(/\b(20\d{2})\b/.exec(`${title} ${description}`)?.[1]);
  const start = /\b(?:inizio|dal)\s+(\d{1,2})\s+([a-zàèéìòù]+)/i.exec(description);
  const month = start ? italianMonths[start[2].toLowerCase()] : null;
  if (!title || !year || !start || !month) return [];
  const startDate = isoDate(year, month, Number(start[1]));
  const stage = buildStage({
    source,
    externalId: `${title}-${startDate}`,
    title,
    startDate,
    endDate: startDate,
    location: source.defaults.location,
    checkedAt,
    today,
    language: source.language,
    sourceUrl: source.url,
    description,
  });
  return stage ? [stage] : [];
}

export function parseSpanishEventTable(
  html: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  const rows = Array.from(
    html.matchAll(
      /<tr\b[^>]*class=["'][^"']*product-type-simple[^"']*["'][^>]*>([\s\S]*?)<\/tr>/gi,
    ),
  );
  return rows.flatMap((row, index) => {
    const body = row[1];
    const titleMatch = /<h3\b[^>]*>[\s\S]*?<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i.exec(
      body,
    );
    const title = cleanText(titleMatch?.[2] ?? "");
    const dateMatches = Array.from(
      cleanText(body).matchAll(
        /(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(20\d{2})/gi,
      ),
    );
    if (!title || dateMatches.length === 0) return [];
    const toDate = (match: RegExpMatchArray) => {
      const month = spanishMonths[match[2].toLowerCase()];
      return month
        ? isoDate(Number(match[3]), month, Number(match[1]))
        : null;
    };
    const startDate = toDate(dateMatches[0]);
    const endDate = toDate(dateMatches[1] ?? dateMatches[0]);
    if (!startDate || !endDate) return [];
    const priceMatch = /<bdi>\s*([\d.,]+)/i.exec(body);
    const price = priceMatch
      ? Number.parseFloat(priceMatch[1].replace(/\./g, "").replace(",", "."))
      : null;
    const stage = buildStage({
      source,
      externalId: titleMatch?.[1] ?? `${startDate}-${index}`,
      title,
      startDate,
      endDate,
      location: source.defaults.location,
      checkedAt,
      today,
      language: source.language,
      price: Number.isFinite(price) ? price : null,
      currency: Number.isFinite(price) ? "EUR" : null,
      availability: /tickets are not available|agotado|sin plazas/i.test(body)
        ? "full"
        : "unknown",
      sourceUrl: titleMatch?.[1]
        ? new URL(decodeHtml(titleMatch[1]), source.url).toString()
        : source.url,
      description: cleanText(body),
    });
    return stage ? [stage] : [];
  });
}

export function parseDatedLinkCalendar(
  html: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  const links = Array.from(
    html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi),
  );
  const seen = new Set<string>();
  return links.flatMap((link, index) => {
    const title = cleanText(link[2]);
    const range = /(\d{1,2}[./-]\d{1,2}[./-]20\d{2})\s*(?:-|–|—|bis|au|to)\s*(\d{1,2}[./-]\d{1,2}[./-]20\d{2})/i.exec(
      title,
    );
    const single = /(\d{1,2}[./-]\d{1,2}[./-]20\d{2})/.exec(title);
    const toIso = (value: string) => {
      const match = /(\d{1,2})[./-](\d{1,2})[./-](20\d{2})/.exec(value);
      return match
        ? isoDate(Number(match[3]), Number(match[2]), Number(match[1]))
        : null;
    };
    const startDate = toIso(range?.[1] ?? single?.[1] ?? "");
    const endDate = toIso(range?.[2] ?? single?.[1] ?? "");
    if (!title || !startDate || !endDate || endDate < startDate) return [];
    const href = decodeHtml(
      /\bhref=["']([^"']+)["']/i.exec(link[1])?.[1] ?? "",
    );
    const key = `${href}|${startDate}|${endDate}`;
    if (seen.has(key)) return [];
    seen.add(key);
    const stage = buildStage({
      source,
      externalId: href || `${startDate}-${index}`,
      title,
      startDate,
      endDate,
      location: source.defaults.location,
      checkedAt,
      today,
      language: source.language,
      sourceUrl: href ? new URL(href, source.url).toString() : source.url,
      description: title,
    });
    return stage ? [stage] : [];
  });
}

export function parseHeadingMonthSchedule(
  html: string,
  source: StageSourceDefinition,
  checkedAt: string,
  today: string,
) {
  const headings = Array.from(
    html.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi),
  );
  let month: number | null = null;
  let year: number | null = null;
  let contextTitle = "SIV training course";
  const stages: NonNullable<ReturnType<typeof buildStage>>[] = [];

  for (const [index, heading] of headings.entries()) {
    const text = cleanText(heading[1]);
    if (/siv|training course|safety training/i.test(text) && !/\d/.test(text)) {
      contextTitle = text;
    }
    const monthHeading = /^([A-Za-z]+)\s+(20\d{2})$/i.exec(text);
    if (monthHeading) {
      month = englishMonths[monthHeading[1].toLowerCase()] ?? null;
      year = Number(monthHeading[2]);
      continue;
    }

    const slashDates = /(\d{1,2})(?:\/(\d{1,2}))(?:\/(\d{1,2}))\s+([A-Za-z]+)\s+(20\d{2})/i.exec(
      text,
    );
    let startDate: string | null = null;
    let endDate: string | null = null;
    if (slashDates) {
      const parsedMonth = englishMonths[slashDates[4].toLowerCase()];
      if (parsedMonth) {
        startDate = isoDate(Number(slashDates[5]), parsedMonth, Number(slashDates[1]));
        endDate = isoDate(Number(slashDates[5]), parsedMonth, Number(slashDates[3]));
      }
    } else if (month && year) {
      const range = /(\d{1,2})(?:st|nd|rd|th)?\s*(?:-|–|—)\s*(\d{1,2})(?:st|nd|rd|th)?/i.exec(
        text,
      );
      if (range) {
        startDate = isoDate(year, month, Number(range[1]));
        endDate = isoDate(year, month, Number(range[2]));
      }
    }
    if (!startDate || !endDate) continue;
    const stage = buildStage({
      source,
      externalId: `${startDate}-${endDate}-${index}`,
      title: `${contextTitle} · ${text}`,
      startDate,
      endDate,
      location: source.defaults.location,
      checkedAt,
      today,
      language: source.language,
      availability: /fully booked|sold out|complet/i.test(text)
        ? "full"
        : "unknown",
      sourceUrl: source.url,
      description: text,
    });
    if (stage) stages.push(stage);
  }

  return stages;
}
