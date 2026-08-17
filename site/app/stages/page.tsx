import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/lib/content";
import { hasStagesAccess } from "@/lib/stages-auth";
import { getStagesFeed } from "@/lib/stages";
import { lockStages } from "./actions";
import { StagesPasswordGate } from "./password-gate";
import { StageList } from "./stage-list";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Accès privé — Parallailement",
  description: "Page en cours de préparation.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

type StagesPageProps = {
  searchParams: Promise<{
    erreur?: string | string[];
  }>;
};

const frenchDateTime = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

function WindMark() {
  return (
    <svg
      viewBox="0 0 180 86"
      aria-hidden="true"
      className="h-auto w-32 text-amber-300 sm:w-40"
    >
      <path
        d="M5 70c34-4 52-20 76-43 16-15 31-20 54-13 16 5 27 17 40 34-18-8-31-9-44-5-16 5-28 18-44 25-25 12-49 9-82 2Z"
        fill="currentColor"
        opacity=".96"
      />
      <path
        d="M28 67c31-6 49-25 67-39M50 69c29-10 46-29 58-45M77 66c24-10 37-26 44-44M104 55c17-8 25-18 29-30"
        fill="none"
        stroke="#1c1917"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export default async function StagesPage({ searchParams }: StagesPageProps) {
  if (!(await hasStagesAccess())) {
    const { erreur } = await searchParams;
    const error = Array.isArray(erreur) ? erreur[0] : erreur;

    return (
      <StagesPasswordGate
        error={
          error === "configuration" || error === "mot-de-passe"
            ? error
            : undefined
        }
      />
    );
  }

  const feed = await getStagesFeed();
  const organizers = new Set(feed.stages.map((stage) => stage.organizer)).size;
  const syncedSources = feed.sources.filter((source) => source.state === "ok").length;
  const unavailableSources = feed.sources.length - syncedSources;
  const fullStages = feed.stages.filter((stage) => stage.availability === "full").length;
  const schema = {
    "@context": "https://schema.org",
    "@graph": feed.stages.slice(0, 100).map((stage) => ({
      "@type": "EducationEvent",
      name: stage.title,
      startDate: stage.startDate,
      endDate: stage.endDate,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: stage.location,
        address: `${stage.department}, ${stage.country}`,
      },
      organizer: {
        "@type": "Organization",
        name: stage.organizer,
        url: stage.sourceUrl,
      },
      url: stage.sourceUrl,
      ...(stage.price !== null
        ? {
            offers: {
              "@type": "Offer",
              price: stage.price,
              priceCurrency: stage.currency || "EUR",
              availability:
                stage.availability === "full"
                  ? "https://schema.org/SoldOut"
                  : "https://schema.org/InStock",
              url: stage.sourceUrl,
            },
          }
        : {}),
    })),
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f2efe7] text-stone-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <header className="relative z-20 border-b border-emerald-100/10 bg-emerald-950 text-emerald-50">
        <nav className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-6 sm:px-10">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight transition hover:text-amber-200"
          >
            {club.name}
          </Link>
          <div className="flex items-center gap-5 text-sm sm:gap-8">
            <Link
              href="/"
              className="hidden text-emerald-100/70 transition hover:text-emerald-50 sm:block"
            >
              Le club
            </Link>
            <span
              aria-current="page"
              className="border-b border-amber-300 py-2 font-medium text-amber-200"
            >
              Stages
            </span>
            <form action={lockStages}>
              <button
                type="submit"
                className="text-emerald-100/60 transition hover:text-emerald-50"
              >
                Verrouiller
              </button>
            </form>
          </div>
        </nav>
      </header>

      <section className="relative bg-emerald-950 text-emerald-50">
        <div
          className="pointer-events-none absolute -right-28 top-12 h-80 w-80 rounded-full border border-emerald-100/10 sm:-right-10 sm:h-[32rem] sm:w-[32rem]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-14 top-28 h-52 w-52 rounded-full border border-emerald-100/10 sm:right-20 sm:h-80 sm:w-80"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-16 sm:px-10 sm:pb-28 sm:pt-24 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-200">
              L’agenda collectif du parapente
            </p>
            <h1 className="mt-6 max-w-4xl font-serif text-[clamp(3.7rem,10vw,8.4rem)] leading-[0.82] tracking-[-0.055em]">
              Trouver son
              <br />
              prochain <span className="italic text-amber-200">stage.</span>
            </h1>
            <p className="mt-10 max-w-2xl text-lg leading-relaxed text-emerald-100/75 sm:text-xl">
              Initiation, progression, SIV, cross ou marche & vol&nbsp;: les
              dates des écoles, clubs et ligues de toute l’Europe sont réunies
              ici, y compris quand le stage est complet.
            </p>
          </div>

          <div className="relative hidden justify-self-end lg:block">
            <WindMark />
            <p className="mt-4 max-w-[16rem] text-xs leading-relaxed text-emerald-100/60">
              Synchronisé toutes les heures. La fiche de l’organisateur reste
              la source de vérité avant toute inscription.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <section
          aria-label="Résumé de l’agenda"
          className="relative z-10 -mt-8 grid bg-amber-300 text-stone-900 sm:grid-cols-3"
        >
          <div className="px-6 py-6 sm:px-8">
            <p className="font-serif text-4xl">{feed.stages.length}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em]">
              Stages à venir
            </p>
          </div>
          <div className="border-t border-stone-900/20 px-6 py-6 sm:border-l sm:border-t-0 sm:px-8">
            <p className="font-serif text-4xl">{organizers}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em]">
              Organisateurs
            </p>
          </div>
          <div className="border-t border-stone-900/20 px-6 py-6 sm:border-l sm:border-t-0 sm:px-8">
            <p className="font-serif text-4xl">{syncedSources}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em]">
              Sources synchronisées
            </p>
          </div>
        </section>

        <div className="pb-24 pt-20 sm:pb-32 sm:pt-28">
          <div className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.62fr)] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                {fullStages > 0
                  ? `${fullStages} stage${fullStages > 1 ? "s" : ""} complet${fullStages > 1 ? "s" : ""} également affiché${fullStages > 1 ? "s" : ""}`
                  : "Disponibilités indiquées à la source"}
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">
                Les prochaines dates
              </h2>
            </div>
            <p className="max-w-xl leading-relaxed text-stone-600 lg:justify-self-end">
              Dernière collecte le {frenchDateTime.format(new Date(feed.updatedAt))}.
              Les places chiffrées viennent directement des outils de réservation&nbsp;;
              “à confirmer” signifie que la source ne publie pas son remplissage.
            </p>
          </div>
          <StageList stages={feed.stages} />
        </div>
      </div>

      <section className="border-y border-stone-300 bg-[#e7e2d7]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1.2fr)]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
              Transparence
            </p>
            <h2 className="mt-4 max-w-lg font-serif text-4xl leading-tight sm:text-5xl">
              D’où viennent les informations&nbsp;?
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-stone-600">
              Nous lisons les calendriers publics, les outils de réservation et
              quelques fiches de clubs ou de ligues. Une panne de source ne
              bloque jamais toute la liste.
            </p>
          </div>

          <div>
            <details className="group border-t border-stone-400">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-medium marker:content-none">
                <span>
                  {feed.sources.length} sources suivies
                  {unavailableSources > 0 && (
                    <span className="ml-2 text-sm font-normal text-stone-500">
                      · {unavailableSources} momentanément indisponible
                      {unavailableSources > 1 ? "s" : ""}
                    </span>
                  )}
                </span>
                <span className="text-xl transition group-open:rotate-45">+</span>
              </summary>
              <ul className="grid border-t border-stone-300 sm:grid-cols-2">
                {feed.sources.map((source) => (
                  <li
                    key={source.id}
                    className="border-b border-stone-300 py-4 sm:odd:pr-6 sm:even:pl-6"
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group/source flex items-start justify-between gap-4 text-sm"
                    >
                      <span>
                        <span className="font-medium group-hover/source:text-emerald-900">
                          {source.name}
                        </span>
                        <span className="mt-1 block text-xs text-stone-500">
                          {source.kind} · {source.stageCount} date
                          {source.stageCount > 1 ? "s" : ""}
                        </span>
                      </span>
                      <span
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          source.state === "ok" ? "bg-emerald-700" : "bg-amber-700"
                        }`}
                        aria-label={
                          source.state === "ok"
                            ? "Source accessible"
                            : "Source momentanément indisponible"
                        }
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
      </section>

      <section className="bg-amber-300 text-stone-900">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em]">La liste grandit</p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
              Ton club organise un stage qui manque ici&nbsp;?
            </h2>
          </div>
          <a
            href="tel:+33650931397"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-950 px-7 py-3 text-sm font-medium text-emerald-50 transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-950"
          >
            Proposer un stage · {club.phone}
          </a>
        </div>
      </section>

      <footer className="bg-emerald-950 text-emerald-100/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <Link href="/" className="font-serif text-xl text-emerald-50">
            {club.name}
          </Link>
          <p>
            Informations indicatives · vérifie toujours les modalités à la
            source avant de t’inscrire.
          </p>
        </div>
      </footer>
    </main>
  );
}
