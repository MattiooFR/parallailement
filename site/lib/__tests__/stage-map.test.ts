import { describe, expect, it } from "vitest";
import { stagesToGeoJson } from "../stage-map";
import type { Stage } from "../stage-data";

const base = {
  id: "mapped",
  title: "Stage SIV",
  translatedTitle: "Stage SIV",
  startDate: "2026-09-03",
  endDate: "2026-09-06",
  organizer: "École",
  location: "Annecy",
  country: "France",
  availability: "available",
  sourceUrl: "https://example.com/stage",
  latitude: 45.8992,
  longitude: 6.1294,
} as Stage;

describe("stagesToGeoJson", () => {
  it("keeps mapped stages and uses longitude-latitude order", () => {
    const collection = stagesToGeoJson([
      base,
      { ...base, id: "missing", latitude: undefined, longitude: undefined },
    ]);
    expect(collection.features).toHaveLength(1);
    expect(collection.features[0]).toMatchObject({
      geometry: { coordinates: [6.1294, 45.8992] },
      properties: {
        id: "mapped",
        startDate: "2026-09-03",
        endDate: "2026-09-06",
      },
    });
  });
});
