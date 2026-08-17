import { describe, expect, it, vi } from "vitest";
import { fetchInternationalStageSources } from "../international-stage-sources";
import type { StageSourceDefinition } from "../stage-source-registry";

const sources: StageSourceDefinition[] = [
  {
    id: "working",
    name: "Working school",
    organizerCountry: "Espagne",
    organizerType: "school",
    url: "https://example.com/working",
    parser: "jsonld",
    language: "es",
    active: true,
    defaults: {
      location: "Àger",
      department: "Lleida",
      region: "Catalogne",
      country: "Espagne",
    },
  },
  {
    id: "broken",
    name: "Broken school",
    organizerCountry: "Italie",
    organizerType: "school",
    url: "https://example.com/broken",
    parser: "loose",
    language: "it",
    active: true,
    defaults: {
      location: "Bassano del Grappa",
      department: "Vénétie",
      region: "Vénétie",
      country: "Italie",
    },
  },
];

describe("fetchInternationalStageSources", () => {
  it("isolates source failures and preserves the successful catalogue", async () => {
    const fetcher = vi.fn(async (source: StageSourceDefinition) => {
      if (source.id === "broken") throw new Error("offline");
      return `<script type="application/ld+json">${JSON.stringify({
        "@type": "EducationEvent",
        name: "Curso SIV avanzado",
        startDate: "2026-09-03",
        endDate: "2026-09-06",
        location: { "@type": "Place", name: "Àger" },
      })}</script>`;
    });

    const results = await fetchInternationalStageSources(
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
      { sources, fetcher },
    );

    expect(results).toHaveLength(2);
    expect(results[0].source).toMatchObject({ state: "ok", stageCount: 1 });
    expect(results[0].stages[0].title).toBe("Curso SIV avanzado");
    expect(results[1]).toMatchObject({
      stages: [],
      source: { state: "unavailable", stageCount: 0 },
    });
  });

  it("does not call inactive registry entries", async () => {
    const fetcher = vi.fn(async () => "");
    await fetchInternationalStageSources(
      "2026-08-17T08:00:00.000Z",
      "2026-08-17",
      {
        sources: [{ ...sources[0], active: false }],
        fetcher,
      },
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
});
