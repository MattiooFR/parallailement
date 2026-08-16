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
