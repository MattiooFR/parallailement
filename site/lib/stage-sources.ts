import {
  STAGES_REVALIDATE_SECONDS,
  availabilityFromPlaces,
  cleanText,
  decodeHtml,
  derivePlace,
  inferDescription,
  inferPrerequisites,
  inferStageDiscipline,
  inferStageLevel,
  isUpcoming,
  parseFrenchDate,
  slugify,
  type PlaceDefaults,
  type Stage,
  type StageAvailability,
  type StageSourceResult,
} from "@/lib/stage-data";
import { fetchInternationalStageSources } from "@/lib/international-stage-sources";

type BookAndGlideSource = PlaceDefaults & {
  slug: string;
  name: string;
};

const bookAndGlideSources: BookAndGlideSource[] = [
  {
    slug: "acrobi-parapente",
    name: "Acrobi Parapente",
    location: "Millau",
    department: "Aveyron · 12",
    region: "Occitanie",
  },
  {
    slug: "pollenparapente",
    name: "Pollen Parapente",
    location: "Vallouise",
    department: "Hautes-Alpes · 05",
    region: "Provence-Alpes-Côte d’Azur",
  },
  {
    slug: "epvl",
    name: "École de Parapente de la Vallée du Louron",
    location: "Vallée du Louron",
    department: "Hautes-Pyrénées · 65",
    region: "Occitanie",
  },
  {
    slug: "parapentefamily",
    name: "Parapente Family",
    location: "Moulis",
    department: "Ariège · 09",
    region: "Occitanie",
  },
  {
    slug: "ecole-parapente-baronnies",
    name: "École de Parapente des Baronnies",
    location: "Mévouillon",
    department: "Drôme · 26",
    region: "Auvergne-Rhône-Alpes",
  },
  {
    slug: "existenciel",
    name: "Existenciel",
    location: "Saint-Lary-Soulan",
    department: "Hautes-Pyrénées · 65",
    region: "Occitanie",
  },
  {
    slug: "chamberyparapente",
    name: "EPiC · École de Parapente de Chambéry",
    location: "Chambéry",
    department: "Savoie · 73",
    region: "Auvergne-Rhône-Alpes",
  },
  {
    slug: "mcfly-parapente",
    name: "Mc Fly Parapente",
    location: "Chamonix",
    department: "Haute-Savoie · 74",
    region: "Auvergne-Rhône-Alpes",
  },
  {
    slug: "leshirondailes",
    name: "Les Hirond’ailes",
    location: "Samoëns",
    department: "Haute-Savoie · 74",
    region: "Auvergne-Rhône-Alpes",
  },
  {
    slug: "pegase-particule",
    name: "Pégase & Particule",
    location: "Allevard",
    department: "Isère · 38",
    region: "Auvergne-Rhône-Alpes",
  },
  {
    slug: "parapente66",
    name: "Parapente 66",
    location: "Céret",
    department: "Pyrénées-Orientales · 66",
    region: "Occitanie",
  },
  {
    slug: "bauges-parapente",
    name: "Bauges Parapente",
    location: "Lescheraines",
    department: "Savoie · 73",
    region: "Auvergne-Rhône-Alpes",
  },
  {
    slug: "sur-un-nuage",
    name: "Sur Un Nuage",
    location: "Gex · Monts Jura",
    department: "Ain · 01",
    region: "Auvergne-Rhône-Alpes",
  },
  {
    slug: "darentasia",
    name: "Darentasia",
    location: "Bourg-Saint-Maurice",
    department: "Savoie · 73",
    region: "Auvergne-Rhône-Alpes",
  },
  {
    slug: "air-alpin",
    name: "Air Alpin",
    location: "Saint-Hilaire-du-Touvet",
    department: "Isère · 38",
    region: "Auvergne-Rhône-Alpes",
  },
  {
    slug: "grandsespaces",
    name: "Les Grands Espaces",
    location: "Talloires · Lac d’Annecy",
    department: "Haute-Savoie · 74",
    region: "Auvergne-Rhône-Alpes",
  },
  {
    slug: "jokair-parapente",
    name: "JokAir Parapente",
    location: "Banon",
    department: "Alpes-de-Haute-Provence · 04",
    region: "Provence-Alpes-Côte d’Azur",
  },
  {
    slug: "montlambairparapente",
    name: "Montlamb’air Parapente",
    location: "Saint-Pierre-d’Albigny",
    department: "Savoie · 73",
    region: "Auvergne-Rhône-Alpes",
  },
];

const REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/json",
  "User-Agent":
    "Mozilla/5.0 (compatible; ParallailementStages/1.0; +https://parallailement.fr/stages)",
};

async function fetchText(url: string, tag: string): Promise<string> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    next: {
      revalidate: STAGES_REVALIDATE_SECONDS,
      tags: ["stages", `stages-${tag}`],
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.text();
}

function extractAttribute(attributes: string, name: string): string {
  const match = new RegExp(`${name}="([^"]*)"`, "i").exec(attributes);
  return decodeHtml(match?.[1] ?? "");
}

function isStageProduct(title: string): boolean {
  const value = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  if (/^(seance decouverte|cours theorique|examen theorique|briefing)/.test(value)) {
    return false;
  }
  return /stage|initiation|progression|autonomie|perfectionnement|thermique|cross|siv|pilotage|vol.?rando|biplace|brevet|itineran|paralpinisme|voyage/.test(
    value,
  );
}

function parseBookAndGlide(
  html: string,
  source: BookAndGlideSource,
  checkedAt: string,
  today: string,
): Stage[] {
  const url = `https://${source.slug}.bookandglide.com/stages`;
  const starts = Array.from(
    html.matchAll(/<div class="product-info-cust prt_name"([^>]*)>/gi),
  );

  return starts.flatMap((match, index): Stage[] => {
    const attributes = match[1];
    const bodyStart = (match.index ?? 0) + match[0].length;
    const bodyEnd = starts[index + 1]?.index ?? html.length;
    const body = html.slice(bodyStart, bodyEnd);
    const title = cleanText(extractAttribute(attributes, "data-name"));
    const startDate = parseFrenchDate(
      extractAttribute(attributes, "data-start-date"),
    );
    const endDate = parseFrenchDate(
      extractAttribute(attributes, "data-end-date"),
    );
    const productId = extractAttribute(attributes, "data-product");

    if (!title || !startDate || !endDate || !productId || !isStageProduct(title)) {
      return [];
    }

    const placesText = cleanText(
      /<div class="places">([\s\S]*?)<\/div>/i.exec(body)?.[1] ?? "",
    );
    const remainingMatch = /(\d+)\s+places?\s+restantes?/i.exec(placesText);
    const remainingPlaces = remainingMatch
      ? Number.parseInt(remainingMatch[1], 10)
      : undefined;
    const priceValue = Number.parseFloat(
      extractAttribute(attributes, "data-price"),
    );
    const restricted =
      Boolean(extractAttribute(attributes, "data-password")) ||
      /r[eé]serv[eé]|club\b/i.test(title);
    const discipline = inferStageDiscipline(title);
    const level = inferStageLevel(title, discipline);
    const place = derivePlace(title, source);
    const extra = cleanText(
      /<div class="additional-info">([\s\S]*?)<\/div>/i.exec(body)?.[1] ?? "",
    );

    const stage: Stage = {
      id: `bookandglide-${source.slug}-${productId}`,
      title,
      startDate,
      endDate,
      location: place.location,
      department: place.department,
      region: place.region,
      country: place.country ?? "France",
      organizer: source.name,
      level,
      discipline,
      price: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : null,
      availability: availabilityFromPlaces(remainingPlaces, restricted),
      ...(remainingPlaces !== undefined ? { remainingPlaces } : {}),
      prerequisites: inferPrerequisites(level),
      description: extra || inferDescription(discipline),
      sourceUrl: `${url}?id=${encodeURIComponent(productId)}`,
      sourceLabel: "Réservation BookAndGlide",
      sourceKind: "Réservation",
      verifiedAt: checkedAt,
    };

    return isUpcoming(stage, today) ? [stage] : [];
  });
}

async function fetchBookAndGlideSource(
  source: BookAndGlideSource,
  checkedAt: string,
  today: string,
): Promise<StageSourceResult> {
  const url = `https://${source.slug}.bookandglide.com/stages`;
  try {
    const html = await fetchText(url, `bookandglide-${source.slug}`);
    const stages = parseBookAndGlide(html, source, checkedAt, today);
    return {
      stages,
      source: {
        id: `bookandglide-${source.slug}`,
        name: source.name,
        url,
        kind: "Réservation",
        state: "ok",
        stageCount: stages.length,
        checkedAt,
      },
    };
  } catch {
    return {
      stages: [],
      source: {
        id: `bookandglide-${source.slug}`,
        name: source.name,
        url,
        kind: "Réservation",
        state: "unavailable",
        stageCount: 0,
        checkedAt,
      },
    };
  }
}

type VirevolteEvent = {
  trainingId: number;
  shortTitle: string;
  start: string;
  trueEnd: string;
  places?: number;
  remainingPlaces?: number;
  price?: string;
  available?: boolean;
  url?: string;
};

async function fetchVirevolte(
  checkedAt: string,
  today: string,
): Promise<StageSourceResult> {
  const url = "https://virevolte.net/planning-stages-parapentes/";
  try {
    const html = await fetchText(url, "virevolte");
    const json = /BG\.bookAndGlideEvents\s*=\s*(\[[\s\S]*?\]);/i.exec(html)?.[1];
    if (!json) throw new Error("Virevolte events not found");
    const events = JSON.parse(json) as VirevolteEvent[];
    const stages = events.flatMap((event): Stage[] => {
      if (!event.shortTitle || !event.start || !event.trueEnd) return [];
      const title = cleanText(event.shortTitle);
      if (!isStageProduct(title)) return [];
      const discipline = inferStageDiscipline(title);
      const level = inferStageLevel(title, discipline);
      const place = derivePlace(title, {
        location: "Loudenvielle · Vallée du Louron",
        department: "Hautes-Pyrénées · 65",
        region: "Occitanie",
      });
      const remainingPlaces = event.remainingPlaces;
      const price = Number.parseFloat(event.price ?? "");
      const stage: Stage = {
        id: `virevolte-${event.trainingId}`,
        title,
        startDate: event.start,
        endDate: event.trueEnd,
        location: place.location,
        department: place.department,
        region: place.region,
        country: place.country ?? "France",
        organizer: "Virevolte",
        level,
        discipline,
        price: Number.isFinite(price) && price > 0 ? price : null,
        availability: availabilityFromPlaces(remainingPlaces),
        ...(event.places !== undefined ? { capacity: event.places } : {}),
        ...(remainingPlaces !== undefined ? { remainingPlaces } : {}),
        prerequisites: inferPrerequisites(level),
        description: inferDescription(discipline),
        sourceUrl: event.url ? decodeHtml(event.url) : url,
        sourceLabel: "Planning Virevolte",
        sourceKind: "Calendrier",
        verifiedAt: checkedAt,
      };
      return isUpcoming(stage, today) ? [stage] : [];
    });
    return {
      stages,
      source: {
        id: "virevolte",
        name: "Virevolte",
        url,
        kind: "Calendrier",
        state: "ok",
        stageCount: stages.length,
        checkedAt,
      },
    };
  } catch {
    return {
      stages: [],
      source: {
        id: "virevolte",
        name: "Virevolte",
        url,
        kind: "Calendrier",
        state: "unavailable",
        stageCount: 0,
        checkedAt,
      },
    };
  }
}

function inferSoaringPrice(title: string): number | null {
  const value = title.toLowerCase();
  if (value.includes("siv")) return 890;
  return null;
}

async function fetchSoaring(
  checkedAt: string,
  today: string,
): Promise<StageSourceResult> {
  const url = "https://www.soaring.fr/planning-inscription/";
  try {
    const html = await fetchText(url, "soaring");
    const tables = Array.from(
      html.matchAll(/<table class="cellule-event">([\s\S]*?)<\/table>/gi),
    );
    const stages = tables.flatMap((match, index): Stage[] => {
      const table = match[1];
      const title = cleanText(
        /<span class="titre-stage">([\s\S]*?)<\/span>/i.exec(table)?.[1] ?? "",
      );
      const link = decodeHtml(
        /<a href="([^"]+)" class="table-event"/i.exec(table)?.[1] ?? url,
      );
      const dateMatch = /Du\s+(\d{2}\/\d{2}\/\d{4})\s+au\s+(\d{2}\/\d{2}\/\d{4})/i.exec(
        cleanText(table),
      );
      const startDate = dateMatch ? parseFrenchDate(dateMatch[1]) : null;
      const endDate = dateMatch ? parseFrenchDate(dateMatch[2]) : null;
      if (!title || !startDate || !endDate) return [];

      const placeMatch = /(\d+)\s+place\(s\)\s+dispos?\s+sur\s+(\d+)/i.exec(
        cleanText(table),
      );
      const remainingPlaces = placeMatch
        ? Number.parseInt(placeMatch[1], 10)
        : undefined;
      const capacity = placeMatch ? Number.parseInt(placeMatch[2], 10) : undefined;
      let availability: StageAvailability = availabilityFromPlaces(remainingPlaces);
      if (/class="complet"/i.test(table)) availability = "full";
      const discipline = inferStageDiscipline(title);
      const level = inferStageLevel(title, discipline);
      const place = derivePlace(title, {
        location: "Bagnères-de-Luchon · Pyrénées",
        department: "Haute-Garonne · 31",
        region: "Occitanie",
      });
      const stage: Stage = {
        id: `soaring-${slugify(link || title)}-${index}`,
        title,
        startDate,
        endDate,
        location: place.location,
        department: place.department,
        region: place.region,
        country: place.country ?? "France",
        organizer: "Soaring Académie",
        level,
        discipline,
        price: inferSoaringPrice(title),
        availability,
        ...(capacity !== undefined ? { capacity } : {}),
        ...(remainingPlaces !== undefined ? { remainingPlaces } : {}),
        prerequisites: inferPrerequisites(level),
        description: inferDescription(discipline),
        sourceUrl: link,
        sourceLabel: "Planning Soaring",
        sourceKind: "Calendrier",
        verifiedAt: checkedAt,
      };
      return isUpcoming(stage, today) ? [stage] : [];
    });
    return {
      stages,
      source: {
        id: "soaring",
        name: "Soaring Académie",
        url,
        kind: "Calendrier",
        state: "ok",
        stageCount: stages.length,
        checkedAt,
      },
    };
  } catch {
    return {
      stages: [],
      source: {
        id: "soaring",
        name: "Soaring Académie",
        url,
        kind: "Calendrier",
        state: "unavailable",
        stageCount: 0,
        checkedAt,
      },
    };
  }
}

type TribeEvent = {
  id: number;
  title: string;
  url: string;
  start_date: string;
  end_date: string;
  description?: string;
  excerpt?: string;
  cost?: string;
  venue?: {
    venue?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
};

function regionFromZip(zip = ""): string {
  if (/^(46|19|24)/.test(zip)) return "Occitanie";
  return "France";
}

async function fetchParapenteValley(
  checkedAt: string,
  today: string,
): Promise<StageSourceResult> {
  const pageUrl = "https://www.parapentevalley.com/events/";
  const apiUrl = `https://www.parapentevalley.com/wp-json/tribe/events/v1/events?start_date=${today}&per_page=100`;
  try {
    const response = await fetch(apiUrl, {
      headers: { ...REQUEST_HEADERS, Accept: "application/json" },
      next: {
        revalidate: STAGES_REVALIDATE_SECONDS,
        tags: ["stages", "stages-parapente-valley"],
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Parapente Valley returned ${response.status}`);
    const payload = (await response.json()) as { events?: TribeEvent[] };
    const stages = (payload.events ?? []).flatMap((event): Stage[] => {
      const title = cleanText(event.title);
      if (!isStageProduct(title)) return [];
      const startDate = event.start_date?.slice(0, 10);
      const endDate = event.end_date?.slice(0, 10);
      if (!startDate || !endDate) return [];
      const discipline = inferStageDiscipline(title);
      const level = inferStageLevel(title, discipline);
      const venue = event.venue;
      const city = cleanText(venue?.city ?? "Montvalent");
      const zip = cleanText(venue?.zip ?? "46600");
      const text = cleanText(`${event.description ?? ""} ${event.excerpt ?? ""}`);
      // The Tribe payload sometimes embeds a complete season calendar in an
      // event description. It cannot safely determine this event's remaining
      // places, so the agenda deliberately keeps the status unknown.
      const availability: StageAvailability = "unknown";
      const priceMatch = /([\d\s]+(?:[,.]\d{1,2})?)\s*€/.exec(event.cost ?? "");
      const price = priceMatch
        ? Number.parseFloat(priceMatch[1].replace(/\s/g, "").replace(",", "."))
        : null;
      const stage: Stage = {
        id: `parapente-valley-${event.id}`,
        title,
        startDate,
        endDate,
        location: city || "Montvalent",
        department: zip.startsWith("46") ? "Lot · 46" : zip || "Lot · 46",
        region: regionFromZip(zip),
        country: venue?.country || "France",
        organizer: "Parapente Valley",
        level,
        discipline,
        price: Number.isFinite(price) && (price ?? 0) > 0 ? price : null,
        availability,
        prerequisites: inferPrerequisites(level),
        description: text.slice(0, 240) || inferDescription(discipline),
        sourceUrl: event.url || pageUrl,
        sourceLabel: "Agenda Parapente Valley",
        sourceKind: "Calendrier",
        verifiedAt: checkedAt,
      };
      return isUpcoming(stage, today) ? [stage] : [];
    });
    return {
      stages,
      source: {
        id: "parapente-valley",
        name: "Parapente Valley",
        url: pageUrl,
        kind: "Calendrier",
        state: "ok",
        stageCount: stages.length,
        checkedAt,
      },
    };
  } catch {
    return {
      stages: [],
      source: {
        id: "parapente-valley",
        name: "Parapente Valley",
        url: pageUrl,
        kind: "Calendrier",
        state: "unavailable",
        stageCount: 0,
        checkedAt,
      },
    };
  }
}

export async function fetchStageSources(
  checkedAt: string,
  today: string,
): Promise<StageSourceResult[]> {
  const [domestic, international] = await Promise.all([
    Promise.all([
      fetchVirevolte(checkedAt, today),
      fetchSoaring(checkedAt, today),
      fetchParapenteValley(checkedAt, today),
      ...bookAndGlideSources.map((source) =>
        fetchBookAndGlideSource(source, checkedAt, today),
      ),
    ]),
    fetchInternationalStageSources(checkedAt, today),
  ]);
  return [...domestic, ...international];
}
