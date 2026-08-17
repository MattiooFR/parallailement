import type { StageLanguage } from "./stage-language";
import { translateStageTitle } from "./stage-language";
import {
  coordinatesForKnownPlace,
  type StageLocationPrecision,
} from "./stage-location";

export const STAGES_REVALIDATE_SECONDS = 60 * 60;

export type StageLevel =
  | "Débutant"
  | "Progression"
  | "Autonome"
  | "Confirmé"
  | "Qualification"
  | "Tous niveaux";

export type StageDiscipline =
  | "Initiation"
  | "Progression"
  | "Thermique"
  | "Cross"
  | "SIV / Pilotage"
  | "Marche & vol"
  | "Qualification"
  | "Voyage"
  | "Autre";

export type StageAvailability =
  | "available"
  | "few"
  | "full"
  | "waitlist"
  | "restricted"
  | "unknown";

export type Stage = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  department: string;
  region: string;
  country: string;
  organizer: string;
  level: StageLevel;
  discipline: StageDiscipline;
  price: number | null;
  priceNote?: string;
  availability: StageAvailability;
  capacity?: number;
  remainingPlaces?: number;
  prerequisites: string;
  description: string;
  sourceUrl: string;
  sourceLabel: string;
  sourceKind: "Calendrier" | "Réservation" | "Fiche club" | "Billetterie";
  verifiedAt: string;
  originalTitle?: string;
  translatedTitle?: string;
  language?: StageLanguage | null;
  organizerCountry?: string;
  organizerType?: "club" | "school" | "federation";
  currency?: string | null;
  latitude?: number;
  longitude?: number;
  locationPrecision?: StageLocationPrecision;
  isStale?: boolean;
};

export type NormalizedStage = Stage & {
  originalTitle: string;
  translatedTitle: string;
  language: StageLanguage | null;
  organizerCountry: string;
  organizerType: "club" | "school" | "federation";
  currency: string | null;
};

export function withStageDefaults(stage: Stage): NormalizedStage {
  const language = stage.language === undefined ? "fr" : stage.language;
  const originalTitle = stage.originalTitle ?? stage.title;
  const coordinates =
    stage.latitude !== undefined && stage.longitude !== undefined
      ? {
          latitude: stage.latitude,
          longitude: stage.longitude,
          precision: stage.locationPrecision ?? ("exact" as const),
        }
      : coordinatesForKnownPlace(stage.location, stage.country);

  return {
    ...stage,
    originalTitle,
    translatedTitle:
      stage.translatedTitle ?? translateStageTitle(originalTitle, language),
    language,
    organizerCountry: stage.organizerCountry ?? "France",
    organizerType: stage.organizerType ?? "school",
    currency:
      stage.currency !== undefined
        ? stage.currency
        : stage.price === null
          ? null
          : "EUR",
    ...(coordinates
      ? {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          locationPrecision: coordinates.precision,
        }
      : {}),
  };
}

export type StageSourceStatus = {
  id: string;
  name: string;
  url: string;
  kind: Stage["sourceKind"];
  state: "ok" | "unavailable";
  stageCount: number;
  checkedAt: string;
};

export type StageSourceResult = {
  stages: Stage[];
  source: StageSourceStatus;
};

export type StageFeed = {
  stages: Stage[];
  sources: StageSourceStatus[];
  updatedAt: string;
};

export type PlaceDefaults = {
  location: string;
  department: string;
  region: string;
  country?: string;
};

const namedEntities: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  laquo: "«",
  lt: "<",
  nbsp: " ",
  ndash: "–",
  quot: '"',
  raquo: "»",
};

export function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (entity, name: string) =>
      namedEntities[name.toLowerCase()] ?? entity,
    );
}

export function cleanText(value: string): string {
  return decodeHtml(
    value
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

export function normalizeText(value: string): string {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

export function parseFrenchDate(value: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function inferStageDiscipline(title: string): StageDiscipline {
  const value = normalizeText(title);
  if (/\b(siv|siku|pilotage|securite pilotage|zero turbulence)\b/.test(value)) {
    return "SIV / Pilotage";
  }
  if (/\b(cross|distance|bpc)\b/.test(value)) return "Cross";
  if (/\b(marche|rando|hike|paralpinisme|bivouac|itineran)/.test(value)) {
    return "Marche & vol";
  }
  if (/\b(thermiques?|ascendances?|restitution)\b/.test(value)) {
    return "Thermique";
  }
  if (
    /\b(biplace|qbi|accompagnateur|moniteur|qualification|bp\/?bpc|club coach|coach course)\b/.test(
      value,
    )
  ) {
    return "Qualification";
  }
  if (/\b(initiation|debutant|decouverte|premiers vols?)\b/.test(value)) {
    return "Initiation";
  }
  if (/\b(progression|perfectionnement|autonomie|remise en l.air|brevet)\b/.test(value)) {
    return "Progression";
  }
  if (/\b(voyage|andalousie|colombie|bresil|inde|dolomites|reunion)\b/.test(value)) {
    return "Voyage";
  }
  return "Autre";
}

export function inferStageLevel(
  title: string,
  discipline = inferStageDiscipline(title),
): StageLevel {
  const value = normalizeText(title);
  if (discipline === "Qualification") return "Qualification";
  if (discipline === "Initiation") return "Débutant";
  if (/\b(cross|distance|bpc|confirme|niveau 3)\b/.test(value)) return "Confirmé";
  if (discipline === "SIV / Pilotage" || discipline === "Thermique") {
    return "Autonome";
  }
  if (/\b(perfectionnement|autonomie|niveau 2|brevet de pilote)\b/.test(value)) {
    return "Autonome";
  }
  if (/\b(progression|reprise|niveau 1|brevet initial)\b/.test(value)) {
    return "Progression";
  }
  if (discipline === "Marche & vol") return "Autonome";
  return "Tous niveaux";
}

export function inferPrerequisites(level: StageLevel): string {
  switch (level) {
    case "Débutant":
      return "Aucun prérequis technique annoncé";
    case "Progression":
      return "Avoir déjà effectué un stage d’initiation ou quelques grands vols";
    case "Autonome":
      return "Autonomie au décollage et à l’atterrissage à confirmer avec l’école";
    case "Confirmé":
      return "Brevet de pilote ou expérience équivalente généralement demandé";
    case "Qualification":
      return "Prérequis fédéraux à vérifier auprès de l’organisateur";
    default:
      return "Niveau exact à confirmer auprès de l’organisateur";
  }
}

export function inferDescription(discipline: StageDiscipline): string {
  switch (discipline) {
    case "Initiation":
      return "Découverte du pilotage au sol et progression vers les premiers grands vols selon la météo.";
    case "Progression":
      return "Formation pour consolider les gestes, gagner en autonomie et découvrir de nouvelles conditions de vol.";
    case "Thermique":
      return "Travail des ascendances, de l’analyse de la masse d’air et du placement en thermique.";
    case "Cross":
      return "Perfectionnement au vol de distance, au choix de l’itinéraire et à la prise de décision.";
    case "SIV / Pilotage":
      return "Stage de pilotage et de sécurité pour mieux comprendre l’aile et gérer les incidents de vol.";
    case "Marche & vol":
      return "Itinérance et découverte de sites variés, avec une part de marche adaptée au programme.";
    case "Qualification":
      return "Formation fédérale ou qualification encadrée selon le cursus annoncé par l’organisateur.";
    case "Voyage":
      return "Séjour de progression sur plusieurs sites, avec encadrement et logistique selon la formule.";
    default:
      return "Programme et objectifs détaillés directement par l’organisateur.";
  }
}

export function derivePlace(title: string, fallback: PlaceDefaults): PlaceDefaults {
  const value = normalizeText(title);
  if (/\b(ager|catalogne|aragon|espagne)\b/.test(value)) {
    return {
      location: /ager/.test(value) ? "Àger · Catalogne" : "Catalogne · Espagne",
      department: "Espagne",
      region: "International",
      country: "Espagne",
    };
  }
  if (/andalousie/.test(value)) {
    return {
      location: "Andalousie",
      department: "Espagne",
      region: "International",
      country: "Espagne",
    };
  }
  if (/dolomites/.test(value)) {
    return {
      location: "Dolomites",
      department: "Italie",
      region: "International",
      country: "Italie",
    };
  }
  if (/colombie/.test(value)) {
    return {
      location: "Colombie",
      department: "Colombie",
      region: "International",
      country: "Colombie",
    };
  }
  if (/bresil/.test(value)) {
    return {
      location: "Brésil",
      department: "Brésil",
      region: "International",
      country: "Brésil",
    };
  }
  if (/\binde\b/.test(value)) {
    return {
      location: "Inde",
      department: "Inde",
      region: "International",
      country: "Inde",
    };
  }
  if (/reunion/.test(value)) {
    return {
      location: "La Réunion",
      department: "La Réunion · 974",
      region: "La Réunion",
      country: "France",
    };
  }
  if (/\b(pilat|pyla)\b/.test(value)) {
    return {
      location: "Dune du Pilat",
      department: "Gironde · 33",
      region: "Nouvelle-Aquitaine",
      country: "France",
    };
  }
  if (/annecy/.test(value)) {
    return {
      location: "Lac d’Annecy",
      department: "Haute-Savoie · 74",
      region: "Auvergne-Rhône-Alpes",
      country: "France",
    };
  }
  if (/ecrins|haute montagne/.test(value)) {
    return {
      location: "Massif des Écrins",
      department: "Hautes-Alpes · 05",
      region: "Provence-Alpes-Côte d’Azur",
      country: "France",
    };
  }
  return { ...fallback, country: fallback.country ?? "France" };
}

export function availabilityFromPlaces(
  remainingPlaces?: number,
  restricted = false,
): StageAvailability {
  if (restricted) return "restricted";
  if (remainingPlaces === undefined) return "unknown";
  if (remainingPlaces <= 0) return "full";
  if (remainingPlaces <= 2) return "few";
  return "available";
}

export function isUpcoming(stage: Pick<Stage, "endDate">, today: string): boolean {
  return stage.endDate >= today;
}

export const curatedStages: Stage[] = [
  {
    id: "caf-idf-vol-rando-vallouise-septembre-2026",
    title: "Vol-rando itinérant",
    startDate: "2026-09-07",
    endDate: "2026-09-11",
    location: "Vallouise · Cerces ou Queyras",
    department: "Hautes-Alpes · 05",
    region: "Provence-Alpes-Côte d’Azur",
    country: "France",
    organizer: "Club Alpin Français Île-de-France",
    level: "Confirmé",
    discipline: "Marche & vol",
    price: 905,
    priceNote: "Refuges non compris",
    availability: "unknown",
    capacity: 6,
    prerequisites:
      "Brevet de pilote, autonomie en conditions variées et très bonne condition physique",
    description:
      "Cinq jours d’itinérance encadrée, environ 1 000 m de dénivelé par jour et des nuits en refuges gardés.",
    sourceUrl: "https://www.clubalpin-idf.com/programmes/2026/26-PAR08.pdf",
    sourceLabel: "Fiche du club",
    sourceKind: "Fiche club",
    verifiedAt: "2026-08-12T08:00:00.000Z",
  },
  {
    id: "lnavl-parakite-pilat-septembre-2026",
    title: "Formation parakite",
    startDate: "2026-09-12",
    endDate: "2026-09-13",
    location: "Dune du Pilat",
    department: "Gironde · 33",
    region: "Nouvelle-Aquitaine",
    country: "France",
    organizer: "Ligue Nouvelle-Aquitaine de Vol Libre",
    level: "Autonome",
    discipline: "SIV / Pilotage",
    price: 60,
    availability: "full",
    capacity: 4,
    remainingPlaces: 0,
    prerequisites: "Niveau exact à confirmer auprès de l’organisateur",
    description:
      "Deux jours de formation au pilotage du parakite, accueillis par Waggas School et organisés par la ligue régionale.",
    sourceUrl: "https://www.lnavl.com/formation-parapente/",
    sourceLabel: "Calendrier de la ligue",
    sourceKind: "Calendrier",
    verifiedAt: "2026-08-12T08:00:00.000Z",
  },
  {
    id: "lauravl-biplace-octobre-2026",
    title: "Formation biplace",
    startDate: "2026-10-11",
    endDate: "2026-10-16",
    location: "Saint-Hilaire-du-Touvet",
    department: "Isère · 38",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    organizer: "Ligue Auvergne–Rhône-Alpes de Vol Libre",
    level: "Qualification",
    discipline: "Qualification",
    price: 630,
    availability: "available",
    capacity: 7,
    remainingPlaces: 5,
    prerequisites: "Prérequis fédéraux à valider auprès de la ligue",
    description:
      "Formation technique et théorique de six jours pour accéder au statut d’aspirant biplaceur, sous réserve de validation.",
    sourceUrl:
      "https://www.helloasso.com/associations/ligue-auvergne-rhone-alpes-de-vol-libre-lauravl/evenements/formation-biplace-du-11-au-16-octobre-st-hilaire-du-touvet-38",
    sourceLabel: "Ligue · HelloAsso",
    sourceKind: "Billetterie",
    verifiedAt: "2026-08-12T08:00:00.000Z",
  },
  {
    id: "cdvl-vienne-initiation-octobre-2026",
    title: "Stage initiation · niveau jaune",
    startDate: "2026-10-12",
    endDate: "2026-10-16",
    location: "Massognes",
    department: "Vienne · 86",
    region: "Nouvelle-Aquitaine",
    country: "France",
    organizer: "Comité Départemental de Vol Libre de la Vienne",
    level: "Débutant",
    discipline: "Initiation",
    price: 525,
    priceNote: "Acompte de 100 €",
    availability: "available",
    prerequisites: "Aucun prérequis technique",
    description:
      "Maîtrise de l’aile au sol, apports théoriques, biplace pédagogique puis premiers grands vols guidés à la radio.",
    sourceUrl:
      "https://www.helloasso.com/associations/comite-departemental-de-vol-libre-de-la-vienne/evenements/stage-initiation-s42-12-ou-16-octobre",
    sourceLabel: "CDVL · HelloAsso",
    sourceKind: "Billetterie",
    verifiedAt: "2026-08-12T08:00:00.000Z",
  },
];
