import Link from "next/link";
import { club, site, nextEvent, highlights } from "@/lib/content";

const heroPhoto =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=80";
const sitePhoto =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80";

export default function DesignA() {
  return (
    <main className="bg-stone-50 text-stone-900">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-stone-50 sm:px-10">
          <Link href="/" className="font-serif text-xl tracking-tight">
            {club.name}
          </Link>
          <ul className="hidden gap-8 text-sm sm:flex">
            {["Le club", "Voler", "Événements", "Contact"].map((l) => (
              <li key={l} className="opacity-80 hover:opacity-100">
                <a href="#">{l}</a>
              </li>
            ))}
          </ul>
          <a
            href="#adhesion"
            className="rounded-full border border-stone-50/40 px-4 py-2 text-sm backdrop-blur hover:bg-stone-50/10"
          >
            Adhérer
          </a>
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
            <a
              href="#adhesion"
              className="rounded-full border border-stone-50/50 px-6 py-3 text-stone-50 transition hover:bg-stone-50/10"
            >
              Rejoindre le club
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
              aérologie de vallée pyrénéenne. L&apos;atterrissage est en cours
              de conventionnement — nous partageons les infos à jour avec les
              membres.
            </p>
            <div className="mt-8 space-y-3 text-sm text-stone-700">
              <Row label="Altitude déco" value={site.altitudeDeco} />
              <Row label="Orientations" value={site.orientations} />
              <Row label="Atterro" value={site.status} tag />
              <Row
                label="Coordonnées"
                value={`${club.gps.lat.toFixed(4)}°N / ${club.gps.lng.toFixed(4)}°E`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-stone-200 bg-stone-100 py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <h2 className="font-serif text-4xl sm:text-5xl">Ce qu&apos;on fait.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {highlights.map((h) => (
              <article
                key={h.title}
                className="border-t border-stone-300 pt-6"
              >
                <h3 className="font-serif text-2xl">{h.title}</h3>
                <p className="mt-3 text-stone-600">{h.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Prochain évènement */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid gap-10 rounded-2xl bg-stone-900 p-10 text-stone-50 md:grid-cols-[1fr_auto] md:items-center md:gap-16 md:p-16">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                Prochain rendez-vous
              </p>
              <h2 className="mt-3 font-serif text-5xl leading-tight">
                {nextEvent.title}
              </h2>
              <p className="mt-5 max-w-xl text-stone-300">
                {nextEvent.description}
              </p>
              <p className="mt-6 text-sm text-stone-400">
                {nextEvent.date} · {nextEvent.place}
              </p>
            </div>
            <a
              href="#"
              className="rounded-full bg-stone-50 px-6 py-3 text-center text-stone-900 transition hover:bg-stone-200"
            >
              Je m&apos;inscris
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="adhesion" className="border-t border-stone-200 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 sm:grid-cols-3 sm:px-10">
          <div>
            <p className="font-serif text-2xl">{club.name}</p>
            <p className="mt-3 text-sm text-stone-600">{club.address}</p>
            <p className="text-sm text-stone-600">{club.phone}</p>
          </div>
          <div className="text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
              Adhésion
            </p>
            <p className="mt-3 text-stone-600">
              Via HelloAsso + licence FFVL n°{club.ffvl}.
            </p>
          </div>
          <div className="text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
              Voir aussi
            </p>
            <ul className="mt-3 space-y-1 text-stone-600">
              <li>
                <Link href="/" className="underline">
                  ← retour comparateur
                </Link>
              </li>
              <li>
                <Link href="/design-b" className="underline">
                  Design B
                </Link>
              </li>
              <li>
                <Link href="/design-c" className="underline">
                  Design C
                </Link>
              </li>
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
            en cours
          </span>
        )}
      </span>
    </div>
  );
}
