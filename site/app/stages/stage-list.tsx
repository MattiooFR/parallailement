"use client";

import { Fragment, useDeferredValue, useMemo, useState } from "react";
import { languageLabel, type StageLanguage } from "@/lib/stage-language";
import type {
  Stage,
  StageAvailability,
  StageDiscipline,
  StageLevel,
} from "@/lib/stages";
import { StageCalendarView } from "./stage-calendar-view";
import { StageMapView } from "./stage-map-view";

const frenchDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const frenchFullDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const shortMonth = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  timeZone: "UTC",
});

const monthHeading = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const verifiedDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

const levelOrder: StageLevel[] = [
  "Débutant",
  "Progression",
  "Autonome",
  "Confirmé",
  "Qualification",
  "Tous niveaux",
];

const disciplineOrder: StageDiscipline[] = [
  "Initiation",
  "Progression",
  "Thermique",
  "Cross",
  "SIV / Pilotage",
  "Marche & vol",
  "Qualification",
  "Voyage",
  "Autre",
];

type AvailabilityFilter = "all" | "bookable" | "full" | "unknown";
type StageView = "list" | "calendar" | "map";
const PAGE_SIZE = 40;

function toDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function dateRange(startDate: string, endDate: string) {
  const start = toDate(startDate);
  const end = toDate(endDate);
  if (startDate === endDate) return frenchFullDate.format(start);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  return sameMonth
    ? `Du ${start.getUTCDate()} au ${frenchFullDate.format(end)}`
    : `Du ${frenchDate.format(start)} au ${frenchFullDate.format(end)}`;
}

function formatPrice(stage: Stage) {
  if (stage.price === null) return "Tarif à vérifier";
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: stage.currency || "EUR",
      maximumFractionDigits: 0,
    }).format(stage.price);
  } catch {
    return `${stage.price.toLocaleString("fr-FR")} ${stage.currency || "EUR"}`;
  }
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function statusLabel(stage: Stage): string {
  switch (stage.availability) {
    case "available":
      return stage.remainingPlaces !== undefined
        ? `${stage.remainingPlaces} places restantes`
        : "Places disponibles";
    case "few":
      return stage.remainingPlaces === 1
        ? "Dernière place"
        : `${stage.remainingPlaces ?? "Peu de"} places restantes`;
    case "full":
      return "Complet";
    case "waitlist":
      return "Liste d’attente";
    case "restricted":
      return "Réservé à un groupe";
    default:
      return "Places à confirmer";
  }
}

function statusClass(availability: StageAvailability): string {
  switch (availability) {
    case "available":
      return "bg-emerald-900 text-emerald-50";
    case "few":
      return "bg-amber-300 text-stone-950";
    case "full":
      return "bg-stone-900 text-stone-50";
    case "waitlist":
      return "bg-amber-100 text-amber-950 ring-1 ring-inset ring-amber-300";
    case "restricted":
      return "bg-stone-200 text-stone-700";
    default:
      return "bg-transparent text-stone-600 ring-1 ring-inset ring-stone-300";
  }
}

function sourceAction(stage: Stage): string {
  switch (stage.availability) {
    case "available":
    case "few":
      return "Voir et s’inscrire";
    case "unknown":
      return "Vérifier les places";
    case "restricted":
      return "Voir les conditions";
    default:
      return "Voir la fiche";
  }
}

function IconArrow() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M4 10h11m-4-4 4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5">
      <circle
        cx="8.5"
        cy="8.5"
        r="5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m13 13 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[0.68rem] uppercase tracking-[0.17em] text-stone-500">
        {label}
      </span>
      <span className="relative mt-1 block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full appearance-none border-b border-stone-400 bg-transparent py-2 pr-8 text-sm font-medium outline-none transition focus:border-emerald-800"
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-stone-500">
          ↓
        </span>
      </span>
    </label>
  );
}

function StageDate({ stage }: { stage: Stage }) {
  const start = toDate(stage.startDate);
  const end = toDate(stage.endDate);
  const sameDay = stage.startDate === stage.endDate;
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();

  return (
    <div className="w-[4.8rem] shrink-0 border-t-2 border-emerald-950 pt-3 text-emerald-950 md:w-auto">
      <p className="font-serif text-[2.35rem] leading-none tracking-tight">
        {sameDay
          ? start.getUTCDate()
          : sameMonth
            ? `${start.getUTCDate()}–${end.getUTCDate()}`
            : start.getUTCDate()}
      </p>
      <p className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.17em]">
        {shortMonth.format(start).replace(".", "")}
        {!sameDay && !sameMonth
          ? ` → ${end.getUTCDate()} ${shortMonth.format(end).replace(".", "")}`
          : ""}
      </p>
    </div>
  );
}

function StageRow({ stage }: { stage: Stage }) {
  return (
    <article className="group grid gap-6 py-9 md:grid-cols-[6.5rem_minmax(0,1fr)_minmax(13rem,0.38fr)] md:gap-9 lg:py-11">
      <StageDate stage={stage} />

      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-900">
            {stage.level}
          </span>
          <span className="h-1 w-1 rounded-full bg-stone-400" aria-hidden="true" />
          <span className="text-xs uppercase tracking-[0.14em] text-stone-500">
            {stage.discipline}
          </span>
          <span className="h-1 w-1 rounded-full bg-stone-400" aria-hidden="true" />
          <span className="text-xs uppercase tracking-[0.14em] text-stone-500">
            {languageLabel(stage.language ?? null)}
          </span>
        </div>
        <h3 className="mt-3 max-w-3xl font-serif text-3xl leading-[1.03] tracking-tight sm:text-4xl">
          {stage.translatedTitle || stage.title}
        </h3>
        {stage.originalTitle && stage.originalTitle !== stage.translatedTitle && (
          <p className="mt-2 max-w-3xl text-sm italic text-stone-500">
            Titre original&nbsp;: {stage.originalTitle}
          </p>
        )}
        <p className="mt-3 text-base font-medium text-stone-700">
          {stage.organizer}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          {stage.location} · {stage.department}
        </p>

        <details className="mt-5 max-w-2xl text-sm text-stone-600">
          <summary className="cursor-pointer list-none border-b border-stone-400 pb-0.5 text-xs font-medium uppercase tracking-[0.12em] text-stone-500 marker:content-none">
            Détails & prérequis <span aria-hidden="true">+</span>
          </summary>
          <div className="mt-4 space-y-3 leading-relaxed">
            <p>{stage.description}</p>
            <p>
              <span className="font-medium text-stone-900">Prérequis&nbsp;:</span>{" "}
              {stage.prerequisites}
            </p>
          </div>
        </details>
      </div>

      <div className="flex flex-col justify-between border-t border-stone-300 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
        <div>
          <span
            className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-medium ${statusClass(stage.availability)}`}
          >
            {statusLabel(stage)}
          </span>
          <p className="mt-5 font-serif text-3xl leading-none">{formatPrice(stage)}</p>
          {stage.priceNote && (
            <p className="mt-2 text-xs text-stone-500">{stage.priceNote}</p>
          )}
          <p className="mt-3 text-sm text-stone-600">
            {dateRange(stage.startDate, stage.endDate)}
          </p>
        </div>

        <div className="mt-8">
          <a
            href={stage.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-3 border-b border-stone-900 py-2 text-sm font-medium transition group-hover:border-emerald-800 group-hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
          >
            {sourceAction(stage)}
            <IconArrow />
          </a>
          <p className="mt-3 text-xs leading-relaxed text-stone-500">
            {stage.sourceLabel}
            <br />
            vérifié le {verifiedDate.format(new Date(stage.verifiedAt))}
            {stage.isStale ? " · source en retard" : ""}
          </p>
        </div>
      </div>
    </article>
  );
}

export function StageList({ stages }: { stages: Stage[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [level, setLevel] = useState("all");
  const [discipline, setDiscipline] = useState("all");
  const [region, setRegion] = useState("all");
  const [country, setCountry] = useState("all");
  const [language, setLanguage] = useState("all");
  const [availability, setAvailability] =
    useState<AvailabilityFilter>("all");
  const [view, setView] = useState<StageView>("list");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const levels = levelOrder.filter((item) =>
    stages.some((stage) => stage.level === item),
  );
  const disciplines = disciplineOrder.filter((item) =>
    stages.some((stage) => stage.discipline === item),
  );
  const regions = Array.from(new Set(stages.map((stage) => stage.region))).sort(
    (a, b) => a.localeCompare(b, "fr"),
  );
  const countries = Array.from(new Set(stages.map((stage) => stage.country))).sort(
    (a, b) => a.localeCompare(b, "fr"),
  );
  const languages: Array<StageLanguage | null> = [
    "fr",
    "en",
    "es",
    "it",
    "de",
    null,
  ];

  const filteredStages = useMemo(() => {
    const needle = normalize(deferredQuery.trim());
    return stages.filter((stage) => {
      const haystack = normalize(
        [
          stage.title,
          stage.translatedTitle ?? "",
          stage.originalTitle ?? "",
          stage.organizer,
          stage.location,
          stage.department,
          stage.region,
          stage.discipline,
          stage.level,
          stage.country,
          languageLabel(stage.language ?? null),
        ].join(" "),
      );
      const availabilityMatches =
        availability === "all" ||
        (availability === "bookable" &&
          (stage.availability === "available" || stage.availability === "few")) ||
        (availability === "full" &&
          (stage.availability === "full" || stage.availability === "waitlist")) ||
        (availability === "unknown" &&
          (stage.availability === "unknown" ||
            stage.availability === "restricted"));

      return (
        (!needle || haystack.includes(needle)) &&
        (level === "all" || stage.level === level) &&
        (discipline === "all" || stage.discipline === discipline) &&
        (region === "all" || stage.region === region) &&
        (country === "all" || stage.country === country) &&
        (language === "all" || (stage.language ?? "unknown") === language) &&
        availabilityMatches
      );
    });
  }, [availability, country, deferredQuery, discipline, language, level, region, stages]);

  const visibleStages = filteredStages.slice(0, visibleCount);

  const groupedStages = useMemo(() => {
    const groups = new Map<string, Stage[]>();
    for (const stage of visibleStages) {
      const key = stage.startDate.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), stage]);
    }
    return Array.from(groups.entries());
  }, [visibleStages]);

  const hasFilters =
    query !== "" ||
    level !== "all" ||
    discipline !== "all" ||
    region !== "all" ||
    country !== "all" ||
    language !== "all" ||
    availability !== "all";

  function resetFilters() {
    setQuery("");
    setLevel("all");
    setDiscipline("all");
    setRegion("all");
    setCountry("all");
    setLanguage("all");
    setAvailability("all");
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <section id="liste" className="scroll-mt-8 border-t border-stone-300">
      <div className="py-7 sm:py-8">
        <label className="relative block max-w-3xl">
          <span className="sr-only">Rechercher un stage</span>
          <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-stone-500">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="SIV, initiation, Pyrénées, nom d’un club…"
            className="min-h-14 w-full border-b border-stone-500 bg-transparent py-3 pl-8 pr-3 font-serif text-xl outline-none placeholder:text-stone-400 focus:border-emerald-900 sm:text-2xl"
          />
        </label>

        <div className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SelectField label="Niveau" value={level} onChange={setLevel}>
            <option value="all">Tous les niveaux</option>
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Type de stage"
            value={discipline}
            onChange={setDiscipline}
          >
            <option value="all">Toutes les pratiques</option>
            {disciplines.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>

          <SelectField label="Région" value={region} onChange={setRegion}>
            <option value="all">Toutes les régions</option>
            {regions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>

          <SelectField label="Pays du stage" value={country} onChange={setCountry}>
            <option value="all">Tous les pays</option>
            {countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>

          <SelectField label="Langue" value={language} onChange={setLanguage}>
            <option value="all">Toutes les langues</option>
            {languages.map((item) => (
              <option key={item ?? "unknown"} value={item ?? "unknown"}>
                {languageLabel(item)}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Disponibilité"
            value={availability}
            onChange={(value) => setAvailability(value as AvailabilityFilter)}
          >
            <option value="all">Tous les statuts</option>
            <option value="bookable">Avec des places</option>
            <option value="full">Complets & listes d’attente</option>
            <option value="unknown">À confirmer & réservés</option>
          </SelectField>
        </div>

        <div className="mt-7 flex min-h-8 flex-wrap items-center justify-between gap-4 text-sm">
          <p aria-live="polite" className="text-stone-600">
            <span className="font-medium text-stone-900">{filteredStages.length}</span>{" "}
            stage{filteredStages.length > 1 ? "s" : ""} trouvé
            {filteredStages.length > 1 ? "s" : ""}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-10 border-b border-stone-700 text-xs font-medium uppercase tracking-[0.12em] transition hover:border-emerald-900 hover:text-emerald-900"
            >
              Effacer les filtres
            </button>
          )}
        </div>

        <div
          className="mt-7 inline-flex rounded-full border border-stone-400 p-1"
          role="tablist"
          aria-label="Choisir une vue"
        >
          {([
            ["list", "Liste"],
            ["calendar", "Calendrier"],
            ["map", "Carte"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={view === value}
              onClick={() => setView(value)}
              className={`min-h-10 rounded-full px-4 text-sm font-medium transition ${view === value ? "bg-emerald-950 text-emerald-50" : "text-stone-600 hover:text-emerald-900"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredStages.length === 0 ? (
        <div className="border-t border-stone-300 py-20">
          <p className="max-w-xl font-serif text-3xl leading-tight">
            Aucun stage ne correspond à cette recherche pour le moment.
          </p>
          <p className="mt-4 max-w-xl leading-relaxed text-stone-600">
            Essaie une région plus large ou affiche aussi les stages complets&nbsp;:
            leurs listes d’attente peuvent encore bouger.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 min-h-11 border-b border-stone-900 text-sm font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : view === "calendar" ? (
        <StageCalendarView stages={filteredStages} />
      ) : view === "map" ? (
        <StageMapView stages={filteredStages} />
      ) : (
        <div className="border-t border-stone-300">
          {groupedStages.map(([month, monthStages]) => (
            <Fragment key={month}>
              <div className="grid border-b border-stone-300 py-5 md:grid-cols-[6.5rem_minmax(0,1fr)] md:gap-9">
                <span className="hidden text-xs uppercase tracking-[0.16em] text-stone-400 md:block">
                  Saison
                </span>
                <h2 className="font-serif text-2xl capitalize text-stone-700">
                  {monthHeading.format(toDate(`${month}-01`))}
                </h2>
              </div>
              <div className="divide-y divide-stone-300">
                {monthStages.map((stage) => (
                  <StageRow key={stage.id} stage={stage} />
                ))}
              </div>
            </Fragment>
          ))}
          {visibleCount < filteredStages.length && (
            <div className="flex flex-col items-start gap-3 border-t border-stone-300 py-10 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-500">
                {visibleStages.length} affichés sur {filteredStages.length}
              </p>
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-emerald-950 px-6 py-3 text-sm font-medium text-emerald-50 transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
              >
                Afficher {Math.min(PAGE_SIZE, filteredStages.length - visibleCount)} stages de plus
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
