"use client";

import { useEffect, useRef } from "react";
import { languageLabel } from "@/lib/stage-language";
import type { Stage, StageAvailability } from "@/lib/stages";

const fullDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const verifiedDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

function toDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function dateRange(startDate: string, endDate: string) {
  if (startDate === endDate) return fullDate.format(toDate(startDate));
  return `${fullDate.format(toDate(startDate))} → ${fullDate.format(toDate(endDate))}`;
}

function formatPrice(stage: Stage) {
  if (stage.price === null) return "Tarif non publié";
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

function availabilityLabel(stage: Stage) {
  switch (stage.availability) {
    case "available":
      return "Places disponibles";
    case "few":
      return "Presque complet";
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

function availabilityClass(availability: StageAvailability) {
  switch (availability) {
    case "available":
      return "bg-emerald-900 text-white";
    case "few":
      return "bg-amber-300 text-stone-950";
    case "full":
      return "bg-stone-900 text-white";
    case "waitlist":
      return "bg-amber-100 text-amber-950 ring-1 ring-inset ring-amber-300";
    default:
      return "bg-stone-200 text-stone-700";
  }
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5">
      <path
        d="m5 5 10 10M15 5 5 15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M7 5h8v8M15 5 6 14M13 15H5V7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function StageMapDetailSheet({
  stage,
  onClose,
}: {
  stage: Stage;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus({ preventScroll: true });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, stage.id]);

  const placeDetails = [
    stage.location,
    stage.department,
    stage.region,
    stage.country,
  ].filter((value, index, values) => value && values.indexOf(value) === index);

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-[80] max-h-[86dvh] overflow-y-auto border-t border-stone-900 bg-[#f7f4ed] shadow-[0_-18px_50px_rgba(28,25,23,0.22)] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[min(31rem,calc(100vw-2rem))] sm:border-l sm:border-t-0 sm:shadow-[-18px_0_50px_rgba(28,25,23,0.2)]"
      aria-label="Fiche détaillée du stage"
      data-stage-detail={stage.id}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-300 bg-[#f7f4ed]/95 px-5 py-3 backdrop-blur sm:px-7">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
          Fiche du stage
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-full text-stone-700 transition hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          aria-label="Fermer la fiche et revenir aux dates du lieu"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="px-5 pb-7 pt-6 sm:px-7 sm:pb-9 sm:pt-8">
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-medium ${availabilityClass(stage.availability)}`}
          >
            {availabilityLabel(stage)}
          </span>
          <span className="inline-flex min-h-7 items-center rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-600">
            {languageLabel(stage.language ?? null)}
          </span>
        </div>

        <h2 className="mt-6 font-serif text-4xl leading-[0.98] tracking-tight text-stone-950 sm:text-5xl">
          {stage.translatedTitle || stage.title}
        </h2>
        {stage.originalTitle && stage.originalTitle !== stage.translatedTitle && (
          <p className="mt-3 text-sm italic leading-relaxed text-stone-500">
            Titre original&nbsp;: {stage.originalTitle}
          </p>
        )}
        <p className="mt-5 text-base font-medium text-emerald-900">
          {stage.organizer}
        </p>

        <dl className="mt-7 divide-y divide-stone-300 border-y border-stone-300">
          <div className="grid gap-1 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4">
            <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Dates</dt>
            <dd className="text-sm font-medium leading-relaxed text-stone-900">
              {dateRange(stage.startDate, stage.endDate)}
            </dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4">
            <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Lieu</dt>
            <dd className="text-sm leading-relaxed text-stone-800">
              {placeDetails.join(" · ")}
            </dd>
          </div>
          <div className="grid gap-1 py-4 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4">
            <dt className="text-xs uppercase tracking-[0.12em] text-stone-500">Niveau</dt>
            <dd className="text-sm leading-relaxed text-stone-800">
              {stage.level} · {stage.discipline}
            </dd>
          </div>
        </dl>

        <div className="mt-7 grid grid-cols-2 gap-px border border-stone-300 bg-stone-300">
          <div className="bg-[#f7f4ed] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-stone-500">Places restantes</p>
            <p className="mt-2 font-serif text-2xl leading-tight text-stone-950">
              {stage.remainingPlaces !== undefined
                ? stage.remainingPlaces
                : "Non publié"}
            </p>
            {stage.capacity !== undefined && (
              <p className="mt-1 text-xs text-stone-500">sur {stage.capacity} places</p>
            )}
          </div>
          <div className="bg-[#f7f4ed] p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-stone-500">Tarif</p>
            <p className="mt-2 font-serif text-2xl leading-tight text-stone-950">
              {formatPrice(stage)}
            </p>
            {stage.priceNote && (
              <p className="mt-1 text-xs leading-relaxed text-stone-500">{stage.priceNote}</p>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-7 text-sm leading-relaxed text-stone-700">
          <section aria-labelledby={`programme-${stage.id}`}>
            <h3
              id={`programme-${stage.id}`}
              className="font-serif text-2xl leading-tight text-stone-950"
            >
              Le programme
            </h3>
            <p className="mt-3">{stage.description}</p>
          </section>
          <section aria-labelledby={`prerequis-${stage.id}`}>
            <h3
              id={`prerequis-${stage.id}`}
              className="font-serif text-2xl leading-tight text-stone-950"
            >
              Prérequis
            </h3>
            <p className="mt-3">{stage.prerequisites}</p>
          </section>
        </div>

        <a
          href={stage.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-9 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-emerald-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
        >
          Aller au stage
          <ExternalIcon />
        </a>
        <p className="mt-4 text-xs leading-relaxed text-stone-500">
          Source&nbsp;: {stage.sourceLabel} · {stage.sourceKind}
          <br />
          Vérifié le {verifiedDate.format(new Date(stage.verifiedAt))}
          {stage.isStale ? " · source en retard" : ""}
        </p>
      </div>
    </aside>
  );
}
