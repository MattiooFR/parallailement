import Link from "next/link";
import { club, site, calendar, highlights } from "@/lib/content";

const heroPhoto =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80";
const sitePhoto =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80";

export default function Home() {
  return (
    <main className="bg-stone-50 text-stone-900">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-stone-50 sm:px-10">
          <Link href="/" className="font-serif text-xl tracking-tight">
            {club.name}
          </Link>
          <ul className="hidden gap-8 text-sm sm:flex">
            {["Le club", "Voler", "Calendrier", "Contact"].map((l) => (
              <li key={l} className="opacity-80 hover:opacity-100">
                <a href="#">{l}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative h-[95vh] min-h-[640px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroPhoto})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-stone-950/20 to-stone-950/80" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 sm:px-10">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-200/80">
            Ilhet · Hautes-Pyrénées · FFVL n°{club.ffvl}
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-6xl leading-[0.95] text-stone-50 sm:text-8xl">
            Voler&nbsp;là où les Pyrénées
            <br />
            <span className="italic">respirent.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-stone-200/90">
            {club.shortDescription}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#site"
              className="rounded-full bg-stone-50 px-6 py-3 text-stone-900 transition hover:bg-stone-200"
            >
              Le site de vol
            </a>
          </div>
        </div>
      </section>

      {/* Intro / Chiffres */}
      <section className="border-b border-stone-200 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 md:grid-cols-[1fr_1.2fr]">
          <p className="font-serif text-3xl leading-tight text-stone-700 sm:text-4xl">
            Un club de vol libre jeune, basé en vallée d&apos;Aure. On cherche
            d&apos;abord à voler ensemble, simplement.
          </p>
          <dl className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {[
              { k: "FFVL", v: `n°${club.ffvl}` },
              { k: "Site principal", v: "1 décollage" },
              { k: "Discipline", v: "Parapente" },
              { k: "Altitude déco", v: site.altitudeDeco },
              { k: "Fondé", v: club.founded },
              { k: "Membres du bureau", v: `${club.bureau.length}` },
            ].map((s) => (
              <div key={s.k} className="border-t border-stone-300 pt-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  {s.k}
                </dt>
                <dd className="mt-2 font-serif text-2xl">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Site de vol */}
      <section id="site" className="py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:px-10 md:grid-cols-2 md:gap-16">
          <div
            className="aspect-[4/5] rounded-2xl bg-cover bg-center shadow-xl"
            style={{ backgroundImage: `url(${sitePhoto})` }}
            aria-hidden
          />
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
              Le site
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-tight">
              Un décollage,
              <br />
              une vallée à explorer.
            </h2>
            <p className="mt-6 text-stone-600">
              Situé près d&apos;Ilhet, notre décollage local offre une
              aérologie de vallée pyrénéenne. Le décollage n&apos;est pas encore
              conventionné — nous partageons les infos à jour avec les membres.
            </p>
            <div className="mt-8 space-y-3 text-sm text-stone-700">
              <Row label="Altitude déco" value={site.altitudeDeco} />
              <Row label="Orientations" value={site.orientations} />
              <Row label="Déco" value={site.status} tag />
              <Row
                label="Coordonnées"
                value={`${club.gps.lat.toFixed(4)}°N / ${club.gps.lng.toFixed(4)}°E`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vidéo */}
      <section className="border-t border-stone-200 bg-stone-100 py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="font-serif text-4xl sm:text-5xl">En vol.</h2>
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
              Vallée d&apos;Aure
            </p>
          </div>
          <figure className="mt-10">
            <div
              className="relative w-full overflow-hidden rounded-2xl bg-stone-900 shadow-xl"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/ViVVVsYfMeI?rel=0&modestbranding=1"
                title="Parallailement — vol libre à Ilhet"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between text-xs text-stone-500">
              <span className="italic">Fig. 01</span>
              <span>Voler à Ilhet — Hautes-Pyrénées</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-stone-200 bg-stone-100 py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <h2 className="font-serif text-4xl sm:text-5xl">En préparation.</h2>
          <p className="mt-6 max-w-3xl text-stone-600">
            Plein de belles choses se préparent pour la saison. Voici quelques
            pistes qu&apos;on explore avec les membres.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {highlights.map((h) => (
              <article
                key={h.title}
                className="border-t border-stone-300 pt-6"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                  En préparation
                </p>
                <h3 className="mt-2 font-serif text-2xl">{h.title}</h3>
                <p className="mt-3 text-stone-600">{h.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Calendrier */}
      <section id="calendrier" className="py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="flex items-baseline justify-between gap-6">
            <h2 className="font-serif text-4xl sm:text-5xl">Calendrier.</h2>
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
              Saison 2026
            </p>
          </div>
          <ol className="mt-12 divide-y divide-stone-200 border-t border-stone-200">
            {calendar.map((event) => (
              <li
                key={event.date}
                className="grid gap-4 py-8 md:grid-cols-[200px_1fr_auto] md:items-baseline md:gap-10"
              >
                <time
                  dateTime={event.date}
                  className="font-serif text-xl text-stone-900"
                >
                  {event.label}
                </time>
                <div>
                  <h3 className="font-serif text-2xl leading-tight">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-stone-600">{event.description}</p>
                </div>
                <p className="text-sm text-stone-500 md:text-right">
                  {event.place}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:grid-cols-2 sm:px-10">
          <div>
            <p className="font-serif text-2xl">{club.name}</p>
            <p className="mt-3 text-sm text-stone-600">{club.address}</p>
            <p className="text-sm text-stone-600">{club.phone}</p>
          </div>
          <div className="text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
              Contact
            </p>
            <ul className="mt-3 space-y-1 text-stone-600">
              <li>{club.phone}</li>
              <li>{club.address}</li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Row({
  label,
  value,
  tag,
}: {
  label: string;
  value: string;
  tag?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-stone-200 py-2">
      <span className="text-stone-500">{label}</span>
      <span className="text-right">
        {value}
        {tag && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            à venir
          </span>
        )}
      </span>
    </div>
  );
}
