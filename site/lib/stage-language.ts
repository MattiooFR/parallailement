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
    "gleitschirm sicherheitstraining": "Stage de sécurité en parapente",
    "gleitschirm grundkurs": "Stage débutant en parapente",
  },
  es: {
    "curso de iniciacion": "Stage d’initiation",
    "curso siv": "Stage SIV",
  },
  it: {
    "corso siv avanzato": "Stage SIV avancé",
    "corso pro aero 2026": "Stage PRO AERO 2026",
  },
  en: {
    "cross country coaching": "Coaching cross",
    "club coach course": "Formation d’entraîneur de club",
  },
};

const phraseTranslations: Record<Exclude<StageLanguage, "fr">, Array<[RegExp, string]>> = {
  en: [
    [/\bSIV\s*\/\s*ACRO\b/gi, "Stage SIV / acro"],
    [/\bSIV course\b/gi, "Stage SIV"],
    [/\bintensive course\b/gi, "Stage intensif"],
    [/\btraining course\b/gi, "stage d’entraînement"],
    [/\bcross[- ]country coaching\b/gi, "coaching cross"],
    [/\bfully booked\b/gi, "complet"],
  ],
  de: [
    [/\bGleitschirm Sicherheitstraining\b/gi, "Stage de sécurité en parapente"],
    [/\bSicherheitstraining\b/gi, "Stage de sécurité"],
    [/\bGleitschirm Grundkurs\b/gi, "Stage débutant en parapente"],
    [/\bGrundkurs\b/gi, "Stage débutant"],
    [/\bHöhenkurs\b/gi, "Stage grands vols"],
    [/\bStreckenflug XC Seminar\b/gi, "Stage cross XC"],
    [/\bThermik\b/gi, "Thermique"],
    [/\bAuffrischungskurs\b/gi, "Stage de remise à niveau"],
  ],
  es: [
    [/\bCurso SIV\b/gi, "Stage SIV"],
    [/\bCurso de iniciaci[oó]n\b/gi, "Stage d’initiation"],
    [/\bCurso de progresi[oó]n\b/gi, "Stage de progression"],
    [/\bCurso de perfeccionamiento\b/gi, "Stage de perfectionnement"],
    [/\bCurso t[eé]rmica\b/gi, "Stage thermique"],
  ],
  it: [
    [/\bCorso SIV\b/gi, "Stage SIV"],
    [/\bCorso parapendio\b/gi, "Stage parapente"],
    [/\bCorso principianti\b/gi, "Stage débutant"],
    [/\bautunno\b/gi, "automne"],
    [/\bavanzato\b/gi, "avancé"],
  ],
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

  const exact = exactTranslations[language][normalizedLookup(cleanTitle)];
  if (exact) return exact;

  return phraseTranslations[language].reduce(
    (translated, [pattern, replacement]) =>
      translated.replace(pattern, replacement),
    cleanTitle,
  );
}
