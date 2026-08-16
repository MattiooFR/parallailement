import { describe, expect, it } from "vitest";
import {
  languageLabel,
  translateStageTitle,
} from "../stage-language";

describe("languageLabel", () => {
  it("shows an explicit label for each supported teaching language", () => {
    expect(languageLabel("fr")).toBe("Français");
    expect(languageLabel("en")).toBe("Anglais");
    expect(languageLabel("es")).toBe("Espagnol");
    expect(languageLabel("it")).toBe("Italien");
    expect(languageLabel("de")).toBe("Allemand");
  });

  it("does not infer an unpublished language", () => {
    expect(languageLabel(null)).toBe("À confirmer");
  });
});

describe("translateStageTitle", () => {
  it("keeps French titles unchanged", () => {
    expect(translateStageTitle("Stage thermique à Annecy", "fr")).toBe(
      "Stage thermique à Annecy",
    );
  });

  it("keeps titles unchanged when the teaching language is unknown", () => {
    expect(translateStageTitle("Thermikkurs", null)).toBe("Thermikkurs");
  });

  it("translates common German paragliding vocabulary", () => {
    expect(translateStageTitle("Sicherheitstraining Thermik", "de")).toBe(
      "Stage de sécurité thermique",
    );
  });

  it("translates common Spanish paragliding vocabulary", () => {
    expect(translateStageTitle("Curso de iniciación", "es")).toBe(
      "Stage d’initiation",
    );
  });

  it("translates common Italian paragliding vocabulary", () => {
    expect(translateStageTitle("Corso SIV avanzato", "it")).toBe(
      "Stage SIV avancé",
    );
  });

  it("translates common English paragliding vocabulary", () => {
    expect(translateStageTitle("Cross country coaching", "en")).toBe(
      "Coaching cross",
    );
  });
});
