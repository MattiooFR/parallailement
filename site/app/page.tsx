import { club, site, nextEvent, highlights } from "@/lib/content";

const editorial = {
  accent: "text-[#e5551f]",
  accentBg: "bg-[#e5551f]",
  paper: "bg-[#f5f2ec]",
};

export default function Home() {
  return (
    <main className={`min-h-screen ${editorial.paper} text-neutral-950`}>
      {/* Masthead */}
      <header className="border-b border-neutral-950/20">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-10">
          <span
            className="font-serif text-xl tracking-tight"
            style={{ fontStyle: "italic" }}
          >
            Parallailement
          </span>
          <div className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.25em] sm:flex">
            <span>Vol libre</span>
            <span>·</span>
            <span>Ilhet&nbsp;·&nbsp;65</span>
            <span>·</span>
            <span>FFVL n°{club.ffvl}</span>
          </div>
          <a
            href="#contact"
            className="text-[11px] uppercase tracking-[0.25em] hover:underline"
          >
            Adhérer →
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-neutral-950/20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          <div className="grid gap-10 py-16 md:grid-cols-12 md:gap-6 md:py-24">
            <div className="md:col-span-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-600">
                № 001 — Le club
              </p>
              <h1 className="mt-6 font-serif text-[15vw] font-black leading-[0.82] tracking-[-0.03em] md:text-[8.5vw]">
                <span className="block">On vole</span>
                <span className="block italic font-light">ensemble,</span>
                <span className={`block ${editorial.accent}`}>
                  et&nbsp;ça&nbsp;se&nbsp;sent.
                </span>
              </h1>
            </div>
            <aside className="md:col-span-4 md:border-l md:border-neutral-950/20 md:pl-6">
              <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-600">
                L&apos;édito
              </p>
              <p className="mt-4 font-serif text-xl leading-snug">
                Un club de vol libre niché au pied des Pyrénées, à&nbsp;Ilhet.
                Petit, engagé, ouvert à toutes et&nbsp;tous.
              </p>
              <p className="mt-4 text-sm text-neutral-700">
                {club.shortDescription}
              </p>
              <dl className="mt-8 space-y-3 border-t border-neutral-950/20 pt-6 text-sm">
                <EditorialRow k="Affiliation" v={`FFVL n°${club.ffvl}`} />
                <EditorialRow k="Siège" v={club.address} />
                <EditorialRow
                  k="Coordonnées"
                  v={`${club.gps.lat.toFixed(4)}°N · ${club.gps.lng.toFixed(4)}°E`}
                />
                <EditorialRow
                  k="Bureau"
                  v={club.bureau.map((b) => b.name).join(" · ")}
                />
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Vidéo + Site de vol ── */}
      <section className="border-b border-neutral-950/20">
        <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10">
          <div className="grid gap-6 md:grid-cols-12">
            <figure className="md:col-span-8">
              <div className="overflow-hidden rounded-sm bg-neutral-900">
                <div
                  className="relative w-full"
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
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between text-xs text-neutral-600">
                <span className="italic">Fig. 01</span>
                <span>Voler à Ilhet, vallée d&apos;Aure — Hautes-Pyrénées</span>
              </figcaption>
            </figure>
            <div className="md:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-600">
                № 002 — Le site
              </p>
              <h2 className="mt-4 font-serif text-5xl font-black leading-[0.9]">
                De 620
                <br />
                <span className="italic font-light">à 1&thinsp;780&nbsp;m</span>.
              </h2>
              <p className="mt-6 text-neutral-700">
                Décollage accessible en véhicule jusqu&apos;à la cabane de
                Collantigue, ou en rando jusqu&apos;au sommet du Pic de Montaut.
                Atterrissage en vallée à Ilhet.
              </p>
              <dl className="mt-6 space-y-3 border-t border-neutral-950/20 pt-4 text-sm">
                <EditorialRow
                  k="Déco véhicule"
                  v={`${site.decoVehicule.altitude} m — ${site.decoVehicule.label}`}
                />
                <EditorialRow
                  k="Déco rando"
                  v={`${site.decoRando.altitude} m — ${site.decoRando.label}`}
                />
                <EditorialRow
                  k="Atterrissage"
                  v={`${site.atterrissage.altitude} m — ${site.atterrissage.label}`}
                />
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

      {/* ── Activités ── */}
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

      {/* ── Événement ── */}
      <section className="border-b border-neutral-950/20">
        <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-10">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-600">
                № 004 — Prochain rendez-vous
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

      {/* ── Footer / Contact ── */}
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
              Contact
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              <li>{club.phone}</li>
              <li>{club.address}</li>
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
