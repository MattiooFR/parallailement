import { describe, expect, it } from "vitest";
import { getStageMapPopupItems, stagesToGeoJson } from "../stage-map";
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

describe("getStageMapPopupItems", () => {
  const collection = stagesToGeoJson(
    Array.from({ length: 20 }, (_, index) => ({
      ...base,
      id: `stage-${index}`,
      startDate: `2026-09-${String(20 - index).padStart(2, "0")}`,
      endDate: `2026-09-${String(20 - index).padStart(2, "0")}`,
    })),
  );

  it("shows six dates first and reports how many dates can still be opened", () => {
    const result = getStageMapPopupItems(collection.features, false);

    expect(result.visibleItems).toHaveLength(6);
    expect(result.hiddenCount).toBe(14);
    expect(result.visibleItems.map((item) => item.properties.startDate)).toEqual([
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-05",
      "2026-09-06",
    ]);
  });

  it("returns every date when the place list is expanded", () => {
    const result = getStageMapPopupItems(collection.features, true);

    expect(result.visibleItems).toHaveLength(20);
    expect(result.hiddenCount).toBe(0);
  });
});
