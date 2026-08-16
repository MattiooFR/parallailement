import { describe, expect, it } from "vitest";
import type { Stage } from "../stage-data";
import {
  advanceMissingStageRows,
  isStageDatabaseConfigured,
  stageToDatabaseRow,
} from "../stage-repository";

const internationalStage: Stage = {
  id: "shv-42",
  title: "Sicherheitstraining Thermik",
  originalTitle: "Sicherheitstraining Thermik",
  translatedTitle: "Stage de sécurité thermique",
  language: "de",
  startDate: "2026-09-10",
  endDate: "2026-09-12",
  location: "Bassano del Grappa",
  department: "Vénétie",
  region: "Vénétie",
  country: "Italie",
  latitude: 45.766,
  longitude: 11.727,
  locationPrecision: "city",
  organizer: "Club exemple",
  organizerCountry: "Allemagne",
  organizerType: "club",
  level: "Autonome",
  discipline: "SIV / Pilotage",
  price: 650,
  currency: "EUR",
  availability: "full",
  prerequisites: "Brevet",
  description: "Stage encadré",
  sourceUrl: "https://example.com/stage",
  sourceLabel: "Site officiel",
  sourceKind: "Calendrier",
  verifiedAt: "2026-08-15T10:00:00.000Z",
};

describe("isStageDatabaseConfigured", () => {
  it("requires all three server-side Supabase values", () => {
    expect(isStageDatabaseConfigured({})).toBe(false);
    expect(
      isStageDatabaseConfigured({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
        SUPABASE_SERVICE_ROLE_KEY: "service",
      }),
    ).toBe(true);
  });
});

describe("stageToDatabaseRow", () => {
  it("preserves normalized international and map metadata", () => {
    expect(
      stageToDatabaseRow(internationalStage, "shv", "2026-08-15T10:00:00.000Z"),
    ).toMatchObject({
      id: "shv-42",
      source_id: "shv",
      original_title: "Sicherheitstraining Thermik",
      translated_title: "Stage de sécurité thermique",
      language: "de",
      organizer_country: "Allemagne",
      organizer_type: "club",
      destination_country: "Italie",
      latitude: 45.766,
      longitude: 11.727,
      location_precision: "city",
      availability: "full",
      active: true,
      missing_success_count: 0,
    });
  });
});

describe("advanceMissingStageRows", () => {
  const rows = [
    { id: "seen", source_id: "ok", missing_success_count: 1 },
    { id: "first-miss", source_id: "ok", missing_success_count: 0 },
    { id: "second-miss", source_id: "ok", missing_success_count: 1 },
    { id: "source-down", source_id: "down", missing_success_count: 1 },
  ];

  it("waits for two successful misses before hiding a stage", () => {
    expect(
      advanceMissingStageRows(rows, new Set(["seen"]), new Set(["ok"])),
    ).toEqual([
      { id: "seen", missing_success_count: 0, active: true },
      { id: "first-miss", missing_success_count: 1, active: true },
      { id: "second-miss", missing_success_count: 2, active: false },
    ]);
  });

  it("leaves stages untouched while their source is unavailable", () => {
    expect(
      advanceMissingStageRows(rows, new Set(), new Set(["ok"])).find(
        (row) => row.id === "source-down",
      ),
    ).toBe(undefined);
  });
});
