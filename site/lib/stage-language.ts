export type StageLanguage = "fr" | "en" | "es" | "it" | "de";

const languageLabels: Record<StageLanguage, string> = {
  fr: "Français",
  en: "Anglais",
  es: "Espagnol",
  it: "Italien",
  de: "Allemand",
};

const exactTranslations: Record<
  Exclude<StageLanguage, "fr">,
  Record<string, string>
> = {
  de: {
    "sicherheitstraining thermik": "Stage de sécurité thermique",
  },
  es: {
    "curso de iniciacion": "Stage d’initiation",
  },
  it: {
    "corso siv avanzato": "Stage SIV avancé",
  },
  en: {
    "cross country coaching": "Coaching cross",
  },
};

function normalizedLookup(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function languageLabel(language: StageLanguage | null): string {
  return language === null ? "À confirmer" : languageLabels[language];
}

export function translateStageTitle(
  title: string,
  language: StageLanguage | null,
): string {
  const cleanTitle = title.replace(/\s+/g, " ").trim();

  if (language === null || language === "fr") return cleanTitle;

  return exactTranslations[language][normalizedLookup(cleanTitle)] ?? cleanTitle;
}
