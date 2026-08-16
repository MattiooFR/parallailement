import { describe, expect, it } from "vitest";
import { withStageDefaults, type Stage } from "../stage-data";

const baseStage: Stage = {
  id: "example",
  title: "Stage progression",
  startDate: "2026-09-01",
  endDate: "2026-09-05",
  location: "Annecy",
  department: "Haute-Savoie",
  region: "Auvergne-Rhône-Alpes",
  country: "France",
  organizer: "École exemple",
  level: "Progression",
  discipline: "Progression",
  price: 500,
  availability: "available",
  prerequisites: "Premiers vols",
  description: "Progression encadrée",
  sourceUrl: "https://example.com/stage",
  sourceLabel: "Site officiel",
  sourceKind: "Calendrier",
  verifiedAt: "2026-08-15T10:00:00.000Z",
};

describe("withStageDefaults", () => {
  it("enriches an existing French stage without changing its source data", () => {
    expect(withStageDefaults(baseStage)).toMatchObject({
      title: "Stage progression",
      originalTitle: "Stage progression",
      translatedTitle: "Stage progression",
      language: "fr",
      organizerCountry: "France",
      organizerType: "school",
      currency: "EUR",
    });
  });

  it("keeps explicit international metadata and adds known coordinates", () => {
    expect(
      withStageDefaults({
        ...baseStage,
        title: "Sicherheitstraining Thermik",
        location: "Bassano del Grappa",
        country: "Italie",
        language: "de",
        organizerCountry: "Allemagne",
        organizerType: "club",
        currency: "CHF",
      }),
    ).toMatchObject({
      originalTitle: "Sicherheitstraining Thermik",
      translatedTitle: "Stage de sécurité thermique",
      language: "de",
      organizerCountry: "Allemagne",
      organizerType: "club",
      currency: "CHF",
      latitude: 45.766,
      longitude: 11.727,
      locationPrecision: "city",
    });
  });

  it("does not invent a currency when no price is published", () => {
    expect(withStageDefaults({ ...baseStage, price: null }).currency).toBeNull();
  });
});
