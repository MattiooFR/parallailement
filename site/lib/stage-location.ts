export type StageLocationPrecision = "exact" | "city" | "region" | "country";

export type StageCoordinates = {
  latitude: number;
  longitude: number;
  precision: StageLocationPrecision;
};

type KnownPlace = StageCoordinates & {
  aliases: string[];
  country: string;
};

const knownPlaces: KnownPlace[] = [
  {
    aliases: ["bassano del grappa", "bassano"],
    country: "italie",
    latitude: 45.766,
    longitude: 11.727,
    precision: "city",
  },
  {
    aliases: ["ager", "ager catalogne"],
    country: "espagne",
    latitude: 42.001,
    longitude: 0.762,
    precision: "city",
  },
  { aliases: ["annecy", "talloires", "lac d annecy"], country: "france", latitude: 45.899, longitude: 6.129, precision: "city" },
  { aliases: ["millau"], country: "france", latitude: 44.1, longitude: 3.078, precision: "city" },
  { aliases: ["vallouise"], country: "france", latitude: 44.846, longitude: 6.488, precision: "city" },
  { aliases: ["vallee du louron", "loudenvielle"], country: "france", latitude: 42.797, longitude: 0.41, precision: "city" },
  { aliases: ["moulis"], country: "france", latitude: 42.962, longitude: 1.091, precision: "city" },
  { aliases: ["mevouillon"], country: "france", latitude: 44.233, longitude: 5.465, precision: "city" },
  { aliases: ["saint lary soulan"], country: "france", latitude: 42.817, longitude: 0.321, precision: "city" },
  { aliases: ["chambery"], country: "france", latitude: 45.565, longitude: 5.917, precision: "city" },
  { aliases: ["chamonix"], country: "france", latitude: 45.923, longitude: 6.869, precision: "city" },
  { aliases: ["samoens"], country: "france", latitude: 46.083, longitude: 6.726, precision: "city" },
  { aliases: ["allevard"], country: "france", latitude: 45.394, longitude: 6.075, precision: "city" },
  { aliases: ["ceret"], country: "france", latitude: 42.485, longitude: 2.748, precision: "city" },
  { aliases: ["lescheraines"], country: "france", latitude: 45.708, longitude: 6.106, precision: "city" },
  { aliases: ["gex", "gex monts jura"], country: "france", latitude: 46.333, longitude: 6.058, precision: "city" },
  { aliases: ["bourg saint maurice"], country: "france", latitude: 45.618, longitude: 6.769, precision: "city" },
  { aliases: ["saint hilaire du touvet"], country: "france", latitude: 45.31, longitude: 5.887, precision: "city" },
  { aliases: ["banon"], country: "france", latitude: 44.039, longitude: 5.629, precision: "city" },
  { aliases: ["saint pierre d albigny"], country: "france", latitude: 45.569, longitude: 6.155, precision: "city" },
  { aliases: ["bagneres de luchon"], country: "france", latitude: 42.79, longitude: 0.593, precision: "city" },
  { aliases: ["montvalent"], country: "france", latitude: 44.88, longitude: 1.619, precision: "city" },
  { aliases: ["vosges"], country: "france", latitude: 47.98, longitude: 6.95, precision: "region" },
  { aliases: ["organya"], country: "espagne", latitude: 42.212, longitude: 1.328, precision: "city" },
  { aliases: ["oludeniz"], country: "turquie", latitude: 36.548, longitude: 29.117, precision: "city" },
  { aliases: ["capolago"], country: "suisse", latitude: 45.903, longitude: 8.98, precision: "city" },
  { aliases: ["lake ohrid", "lac d ohrid"], country: "macedoine du nord", latitude: 41.113, longitude: 20.8, precision: "region" },
  { aliases: ["lake garda", "lac de garde", "gardasee"], country: "italie", latitude: 45.64, longitude: 10.67, precision: "region" },
  { aliases: ["lac d idro", "idrosee"], country: "italie", latitude: 45.78, longitude: 10.49, precision: "region" },
  { aliases: ["monte grappa", "borso del grappa"], country: "italie", latitude: 45.82, longitude: 11.79, precision: "region" },
  { aliases: ["poggio bustone"], country: "italie", latitude: 42.5, longitude: 12.89, precision: "city" },
  { aliases: ["bezau"], country: "autriche", latitude: 47.385, longitude: 9.902, precision: "city" },
  { aliases: ["kirchbach"], country: "autriche", latitude: 46.64, longitude: 13.18, precision: "city" },
  { aliases: ["hallstattersee"], country: "autriche", latitude: 47.56, longitude: 13.65, precision: "region" },
  { aliases: ["allgau"], country: "allemagne", latitude: 47.55, longitude: 10.22, precision: "region" },
];

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function locationFingerprint(location: string, country: string) {
  return `${normalizeLocation(location)}|${normalizeLocation(country)}`;
}

export function coordinatesForKnownPlace(
  location: string,
  country: string,
): StageCoordinates | undefined {
  const normalizedLocation = normalizeLocation(location);
  const normalizedCountry = normalizeLocation(country);
  const match = knownPlaces.find(
    (place) =>
      place.country === normalizedCountry &&
      place.aliases.some(
        (alias) =>
          normalizedLocation === alias || normalizedLocation.startsWith(`${alias} `),
      ),
  );

  if (!match) return undefined;

  return {
    latitude: match.latitude,
    longitude: match.longitude,
    precision: match.precision,
  };
}
