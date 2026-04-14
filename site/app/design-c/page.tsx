import Link from "next/link";
import { club, site, nextEvent, highlights } from "@/lib/content";

const editorial = {
  accent: "text-[#e5551f]",
  accentBg: "bg-[#e5551f]",
  paper: "bg-[#f5f2ec]",
};

const heroPhoto =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=80";

export default function DesignC() {
  return (
    <main className={`min-h-screen ${editorial.paper} text-neutral-950`}>
      {/* Masthead */}
      <header className="border-b border-neutral-950/20">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-10">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight"
            style={{ fontStyle: "italic" }}
          >
            Parallailement
          </Link>
          <div className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.25em] sm:flex">
            <span>Vol. 01</span>
            <span>·</span>
            <span>Printemps 2026</span>
            <span>·</span>
            <span>Ilhet&nbsp;·&nbsp;65</span>
          </div>
          <a
            href="#contact"
            className="text-[11px] uppercase tracking-[0.25em] hover:underline"
          >
            Adhérer →
          </a>
        </div>
      </header>

      {/* Giant typographic hero */}
      <section className="border-b border-neutral-950/20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="grid gap-10 py-16 md:grid-cols-12 md:gap-6 md:py-24">
            <div className="md:col-span-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-600">
                № 001 — Le club
              </p>
              <h1 className="mt-6 font-serif text-[17vw] font-black leading-[0.82] tracking-[-0.03em] md:text-[10vw]">
                <span className="block">Voler,</span>
                <span className="block italic font-light">parallèlement</span>
                <span className={`block ${editorial.accent}`}>
                  à tout le reste.
                </span>
              </h1>
            </div>
            <aside className="md:col-span-4 md:border-l md:border-neutral-950/20 md:pl-6">
              <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-600">
                L&apos;édito
              </p>
              <p className="mt-4 font-serif text-xl leading-snug">
                Un petit club en vallée d&apos;Aure, une discipline — le
                parapente — et l&apos;envie toute simple de voler ensemble.
              </p>
              <p className="mt-4 text-sm text-neutral-700">
                {club.shortDescription}
              </p>
              <dl className="mt-8 space-y-3 border-t border-neutral-950/20 pt-6 text-sm">
                <EditorialRow k="Affiliation" v={`FFVL n°${club.ffvl}`} />
                <EditorialRow k="Siège" v={club.address} />
                <EditorialRow k="Coordonnées" v={`${club.gps.lat.toFixed(4)}°N · ${club.gps.lng.toFixed(4)}°E`} />
                <EditorialRow k="Bureau" v={club.bureau.map((b) => b.name).join(" · ")} />
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* Photo feature */}
      <section className="border-b border-neutral-950/20">
        <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
          <div className="grid gap-6 md:grid-cols-12">
            <figure className="md:col-span-8">
              <div
                className="aspect-[16/10] bg-cover bg-center"
                style={{ backgroundImage: `url(${heroPhoto})` }}
                aria-hidden
              />
              <figcaption className="mt-3 flex items-baseline justify-between text-xs text-neutral-600">
                <span className="italic">Fig. 01</span>
                <span>Vallée d&apos;Aure, au petit matin.</span>
              </figcaption>
            </figure>
            <div className="md:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-600">
                № 002 — Le site
              </p>
              <h2 className="mt-4 font-serif text-5xl font-black leading-[0.9]">
                Un déco,
                <br />
                <span className="italic font-light">une vallée</span>.
              </h2>
              <p className="mt-6 text-neutral-700">
                Notre décollage local ouvre sur la vallée d&apos;Aure.
                L&apos;atterrissage est en cours de conventionnement —
                nous diffusons les informations à jour auprès des adhérents.
              </p>
              <dl className="mt-6 space-y-3 border-t border-neutral-950/20 pt-4 text-sm">
                <EditorialRow k="Altitude" v={site.altitudeDeco} />
                <EditorialRow k="Orientations" v={site.orientations} />
                <EditorialRow k="Atterro" v={`${site.status}*`} />
              </dl>
              <p className="mt-3 text-[11px] text-neutral-500">
                * réservé aux adhérents pour le moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights — numbered */}
      <section className="border-b border-neutral-950/20">
        <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-10">
          <div className="mb-10 flex items-baseline justify-between">
            <h2 className="font-serif text-5xl font-black leading-none">
              Au&nbsp;sommaire.
            </h2>
            <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-600">
              № 003 — Activités
            </span>
          </div>
          <div className="grid gap-10 md:grid-cols-3 md:gap-0">
            {highlights.map((h, i) => (
              <article
                key={h.title}
                className="md:border-l md:border-neutral-950/20 md:px-6 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
              >
                <p className="font-serif text-4xl italic text-neutral-400">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-serif text-2xl font-black">
                  {h.title}
                </h3>
                <p className="mt-4 text-neutral-700">{h.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Big event */}
      <section className="border-b border-neutral-950/20">
        <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-10">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-600">
                № 004 — Prochain numéro
              </p>
              <p className="mt-4 font-serif text-lg">
                La fête annuelle, c&apos;est l&apos;endroit où tout se passe —
                vols, biplaces, assiettes partagées, lampions.
              </p>
            </div>
            <div className="md:col-span-8">
              <h2 className="font-serif text-[14vw] font-black leading-[0.82] tracking-[-0.03em] md:text-[8vw]">
                {nextEvent.title}
                <span className={`${editorial.accent} italic font-light`}>
                  .
                </span>
              </h2>
              <p className="mt-6 max-w-2xl text-neutral-700">
                {nextEvent.description}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
                <span>{nextEvent.date}</span>
                <span className="h-4 w-px bg-neutral-950/30" />
                <span>{nextEvent.place}</span>
                <span className="h-4 w-px bg-neutral-950/30" />
                <a
                  href="#"
                  className={`${editorial.accent} underline underline-offset-4 hover:no-underline`}
                >
                  S&apos;inscrire
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colophon / Footer */}
      <footer id="contact" className={`${editorial.accentBg} text-white`}>
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-16 sm:px-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="font-serif text-6xl font-black leading-[0.9]">
              Rejoindre
              <br />
              <span className="italic font-light">le club.</span>
            </h2>
            <p className="mt-4 max-w-sm text-white/80">
              Cotisation via HelloAsso, licence via la FFVL. On te guide si tu
              ne sais pas par où commencer.
            </p>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-2 border-b border-white pb-1 text-sm uppercase tracking-[0.25em] hover:border-white/0"
            >
              Adhérer via HelloAsso →
            </a>
          </div>
          <div className="md:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">
              Colophon
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              <li>{club.name}</li>
              <li>{club.address}</li>
              <li>{club.phone}</li>
              <li>FFVL n°{club.ffvl}</li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">
              Voir aussi
            </p>
            <ul className="mt-4 space-y-1 text-sm">
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
                <Link href="/design-b" className="underline">
                  Design B
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}

function EditorialRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-neutral-950/10 pb-2">
      <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-600">
        {k}
      </span>
      <span className="text-right">{v}</span>
    </div>
  );
}
