import { describe, expect, it } from "vitest";
import {
  coordinatesForKnownPlace,
  locationFingerprint,
} from "../stage-location";

describe("locationFingerprint", () => {
  it("builds the same key regardless of accents and case", () => {
    expect(locationFingerprint("Àger", "Espagne")).toBe("ager|espagne");
    expect(locationFingerprint("  ÀGER  ", "ESPAGNE")).toBe("ager|espagne");
  });
});

describe("coordinatesForKnownPlace", () => {
  it("returns cached coordinates for a known international flying area", () => {
    expect(coordinatesForKnownPlace("Bassano del Grappa", "Italie")).toEqual({
      latitude: 45.766,
      longitude: 11.727,
      precision: "city",
    });
  });

  it("recognizes a location even when the source adds a region", () => {
    expect(
      coordinatesForKnownPlace("Àger · Catalogne", "Espagne"),
    ).toMatchObject({
      latitude: 42.001,
      longitude: 0.762,
      precision: "city",
    });
  });

  it("does not invent coordinates for an unknown place", () => {
    expect(coordinatesForKnownPlace("Lieu volant inconnu", "France")).toBe(
      undefined,
    );
  });
});
