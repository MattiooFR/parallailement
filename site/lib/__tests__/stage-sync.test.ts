import { describe, expect, it } from "vitest";
import { summarizeStageSync, verifyCronAuthorization } from "../stage-sync";
import type { StageSourceResult } from "../stage-data";

const results: StageSourceResult[] = [
  {
    stages: [],
    source: {
      id: "ok-empty",
      name: "OK empty",
      url: "https://example.com/ok-empty",
      kind: "Calendrier",
      state: "ok",
      stageCount: 0,
      checkedAt: "2026-08-17T08:00:00.000Z",
    },
  },
  {
    stages: [
      {
        id: "one",
        title: "Stage SIV",
        startDate: "2026-09-01",
        endDate: "2026-09-03",
        location: "Annecy",
        department: "Haute-Savoie · 74",
        region: "Auvergne-Rhône-Alpes",
        country: "France",
        organizer: "Club",
        level: "Autonome",
        discipline: "SIV / Pilotage",
        price: null,
        availability: "unknown",
        prerequisites: "Autonomie",
        description: "Pilotage",
        sourceUrl: "https://example.com/one",
        sourceLabel: "Source",
        sourceKind: "Calendrier",
        verifiedAt: "2026-08-17T08:00:00.000Z",
      },
    ],
    source: {
      id: "ok-one",
      name: "OK one",
      url: "https://example.com/ok-one",
      kind: "Calendrier",
      state: "ok",
      stageCount: 1,
      checkedAt: "2026-08-17T08:00:00.000Z",
    },
  },
  {
    stages: [],
    source: {
      id: "failed",
      name: "Failed",
      url: "https://example.com/failed",
      kind: "Calendrier",
      state: "unavailable",
      stageCount: 0,
      checkedAt: "2026-08-17T08:00:00.000Z",
    },
  },
];

describe("verifyCronAuthorization", () => {
  it("requires an exact bearer secret", () => {
    expect(verifyCronAuthorization("Bearer secret", "secret")).toBe(true);
    expect(verifyCronAuthorization("Bearer wrong", "secret")).toBe(false);
    expect(verifyCronAuthorization(null, "secret")).toBe(false);
    expect(verifyCronAuthorization("Bearer secret", undefined)).toBe(false);
  });
});

describe("summarizeStageSync", () => {
  it("reports partial runs without treating empty valid sources as failures", () => {
    expect(summarizeStageSync(results)).toEqual({
      state: "partial",
      sourceCount: 3,
      successfulSources: 2,
      failedSources: 1,
      stageCount: 1,
    });
  });
});
