import Link from "next/link";
import { club, site, nextEvent, highlights, weatherLinks } from "@/lib/content";

export default function DesignB() {
  return (
    <main className="relative overflow-hidden bg-[#fff8ec] text-slate-900">
      {/* Sky background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[780px] bg-gradient-to-b from-sky-200 via-sky-100 to-transparent"
      />

      {/* Floating shapes */}
      <Blob className="top-40 -left-20 h-64 w-64 bg-amber-300/60" />
      <Blob className="top-[420px] right-[-60px] h-48 w-48 bg-rose-300/60" />
      <Blob className="top-[920px] left-1/4 h-56 w-56 bg-emerald-300/50" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <Link
          href="/"
          className="font-display text-2xl font-bold tracking-tight"
        >
          <span className="text-sky-600">Para</span>
          <span className="relative">
            llail
            <svg
              aria-hidden
              viewBox="0 0 40 16"
              className="absolute -top-2 left-1/2 h-4 w-10 -translate-x-1/2 text-amber-400"
              fill="currentColor"
            >
              <path d="M2 13 C 10 2, 30 2, 38 13 Z" />
            </svg>
          </span>
          <span className="text-slate-900">ement</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <a href="#" className="hover:text-sky-600">Le club</a>
          <a href="#" className="hover:text-sky-600">Voler</a>
          <a href="#" className="hover:text-sky-600">Agenda</a>
          <a
            href="#adhesion"
            className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
          >
            Rejoins la bande
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-32 sm:px-10 sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-1.5 text-xs backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Club tout frais · vallée d&apos;Aure (65)
        </span>
        <h1 className="mt-6 max-w-4xl font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-8xl">
          On vole{" "}
          <span className="relative inline-block">
            <span className="relative z-10">ensemble</span>
            <svg
              aria-hidden
              viewBox="0 0 420 40"
              className="absolute -bottom-2 left-0 h-6 w-full text-amber-300"
              fill="currentColor"
            >
              <path d="M0 30 Q 110 0 210 20 T 420 20 L 420 40 L 0 40 Z" />
            </svg>
          </span>
          , <br />
          et ça se sent.
        </h1>
        <p className="mt-8 max-w-xl text-lg text-slate-700">
          {club.shortDescription}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#adhesion"
            className="rounded-full bg-sky-500 px-6 py-3 text-white shadow-[0_10px_0_-4px_#0284c7] transition hover:-translate-y-0.5 hover:bg-sky-600"
          >
            Adhérer au club →
          </a>
          <a
            href="#site"
            className="rounded-full border-2 border-slate-900 px-6 py-3 transition hover:bg-slate-900 hover:text-white"
          >
            On décolle où ?
          </a>
        </div>

        {/* Sticker row */}
        <div className="mt-16 flex flex-wrap items-center gap-3 text-sm">
          <Sticker color="bg-amber-200">FFVL n°{club.ffvl}</Sticker>
          <Sticker color="bg-rose-200">Ilhet, Pyrénées</Sticker>
          <Sticker color="bg-emerald-200">1 déco, 1 vallée</Sticker>
          <Sticker color="bg-sky-200">HelloAsso ↗</Sticker>
        </div>
      </section>

      {/* What we do — cards */}
      <section className="mx-auto max-w-6xl px-6 pb-24 sm:px-10">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-sky-700">
          Au programme
        </p>
        <h2 className="mt-2 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Trois bonnes raisons de nous rejoindre.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {highlights.map((h, i) => (
            <article
              key={h.title}
              className={`rounded-3xl p-7 ${
                ["bg-sky-100", "bg-amber-100", "bg-rose-100"][i]
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl">
                {["🪂", "🧭", "🏆"][i]}
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold">{h.title}</h3>
              <p className="mt-3 text-slate-700">{h.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Site de vol */}
      <section id="site" className="bg-slate-900 py-24 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:px-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.2em] text-amber-300">
              Le site
            </p>
            <h2 className="mt-2 font-display text-5xl font-bold">
              Décollage &amp; vallée,
              <br />
              juste à côté.
            </h2>
            <p className="mt-6 max-w-lg text-slate-300">
              Un déco local dans les Pyrénées, un atterro en cours de
              conventionnement — on en dit plus aux adhérents sur le groupe.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <Fact label="Altitude" value={site.altitudeDeco} />
              <Fact label="Orientations" value={site.orientations} />
              <Fact label="GPS" value={`${club.gps.lat.toFixed(3)}°N`} />
              <Fact label="Atterro" value="en cours" pulse />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-display text-sm uppercase tracking-[0.2em] text-amber-300">
              La météo, vite
            </p>
            <ul className="grid grid-cols-2 gap-3">
              {weatherLinks.map((w) => (
                <li key={w.label}>
                  <a
                    href={w.href}
                    className="flex items-center justify-between rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
                  >
                    <span>
                      {w.label}
                      {w.note && (
                        <span className="ml-2 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-900">
                          {w.note}
                        </span>
                      )}
                    </span>
                    <span>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Event */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-amber-300 p-10 sm:p-14">
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-rose-300 mix-blend-multiply" />
          <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-sky-300 mix-blend-multiply" />
          <div className="relative">
            <p className="font-display text-sm uppercase tracking-[0.2em]">
              Save the date
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-5xl font-bold leading-tight sm:text-6xl">
              {nextEvent.title}
            </h2>
            <p className="mt-5 max-w-xl text-slate-800">{nextEvent.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <span className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
                {nextEvent.date}
              </span>
              <span className="rounded-full border-2 border-slate-900 px-4 py-2 text-sm">
                {nextEvent.place}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="adhesion"
        className="bg-slate-900 py-16 text-slate-300"
      >
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-10">
          <div>
            <p className="font-display text-2xl font-bold text-white">
              {club.name}
            </p>
            <p className="mt-3 text-sm">{club.address}</p>
            <p className="text-sm">{club.phone}</p>
            <p className="mt-4 text-xs text-slate-400">
              Club affilié FFVL · n°{club.ffvl}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Rejoindre
            </p>
            <a
              href="#"
              className="mt-3 inline-block rounded-full bg-sky-500 px-5 py-2 text-white transition hover:bg-sky-400"
            >
              HelloAsso ↗
            </a>
          </div>
          <div className="text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Autres designs
            </p>
            <ul className="mt-3 space-y-1">
              <li>
                <Link href="/" className="underline">
                  ← comparateur
                </Link>
              </li>
              <li>
                <Link href="/design-a" className="underline">
                  Design A
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

function Blob({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -z-10 rounded-full blur-3xl ${className}`}
    />
  );
}

function Sticker({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <span
      className={`rounded-full ${color} px-3 py-1.5 font-medium text-slate-900 shadow-sm`}
    >
      {children}
    </span>
  );
}

function Fact({
  label,
  value,
  pulse,
}: {
  label: string;
  value: string;
  pulse?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-display text-xl">
        {value}
        {pulse && (
          <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-amber-300" />
        )}
      </p>
    </div>
  );
}
