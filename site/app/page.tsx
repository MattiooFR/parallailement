import Link from "next/link";

type Design = {
  slug: string;
  letter: string;
  subtitle: string;
  tagline: string;
  description: string;
  theme: string;
};

const designs: Design[] = [
  {
    slug: "design-a",
    letter: "A",
    subtitle: "Montagne, photo-first",
    tagline: "Classique, crédible, intemporel.",
    description:
      "Hero photographique plein écran, palette pierre/terre, typographie sobre. Inspiré des beaux sites de massifs.",
    theme: "from-stone-900 via-stone-800 to-stone-700 text-stone-50",
  },
  {
    slug: "design-b",
    letter: "B",
    subtitle: "Ludique, identité forte",
    tagline: "Mémorable, communautaire.",
    description:
      "Jeu visuel sur « Parallailement », couleurs vives, stickers, ton familier. Ambiance Z'éléphs en mieux.",
    theme: "from-sky-400 via-sky-500 to-amber-400 text-slate-900",
  },
  {
    slug: "design-c",
    letter: "C",
    subtitle: "Magazine éditorial",
    tagline: "Distinctif, affirmé.",
    description:
      "Typographie massive, grilles magazine, noir/blanc + un accent orange. Très peu d'effets, focus composition.",
    theme: "from-[#f5f2ec] via-[#f5f2ec] to-[#e5551f] text-neutral-950",
  },
  {
    slug: "design-d",
    letter: "D",
    subtitle: "Vol 3D immersif",
    tagline: "Wow, technique.",
    description:
      "Three.js : caméra qui vole à travers un paysage low-poly des Pyrénées, parapente animé. Sections en overlay.",
    theme: "from-[#0b1220] via-amber-700/80 to-amber-500 text-white",
  },
  {
    slug: "design-e",
    letter: "E",
    subtitle: "Vent particules vivant",
    tagline: "Scientifique, beau.",
    description:
      "Canvas particules en flow field qui suivent la souris. Prêt à se brancher sur la balise Pioupiou.",
    theme: "from-[#f7faff] via-cyan-100 to-cyan-600 text-slate-900",
  },
  {
    slug: "design-f",
    letter: "F",
    subtitle: "Carte topographique",
    tagline: "Unique dans le parapente.",
    description:
      "Le site est une carte SVG de la vallée. Pins (déco, atterro, météo, event) qui s'activent au scroll.",
    theme: "from-[#f2ede3] via-[#d7e3c6] to-[#5b7242] text-slate-900",
  },
  {
    slug: "design-h",
    letter: "H",
    subtitle: "Trace GPS générative",
    tagline: "Métaphore du vol.",
    description:
      "Un tracklog SVG se dessine au scroll. Chaque section est un waypoint, glider head mobile, compteur.",
    theme: "from-[#fbfaf6] via-neutral-200 to-red-600 text-slate-900",
  },
  {
    slug: "design-i",
    letter: "I",
    subtitle: "Ciel shader GLSL",
    tagline: "Cinéma, sensoriel.",
    description:
      "Shader fragment fullscreen : fbm clouds animés, soleil qui suit la souris. Typo serif en overlay.",
    theme: "from-[#3b5c8a] via-amber-300 to-orange-500 text-white",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="mx-auto max-w-6xl px-6 pt-14 pb-10 sm:px-10 sm:pt-20">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
          Parallailement · Comparateur de design · Ilhet · FFVL n°28194
        </p>
        <h1 className="mt-6 font-serif text-5xl leading-[1.05] sm:text-7xl">
          Huit directions visuelles,
          <br />
          <span className="italic text-neutral-500">à départager.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-neutral-600">
          Même contenu, huit grammaires différentes. Fais glisser
          horizontalement pour parcourir, clique pour ouvrir la version
          complète. Dis-moi ce qui te parle.
        </p>

        <div className="mt-8 flex items-center gap-3 text-xs text-neutral-500">
          <span className="hidden sm:inline">Défile →</span>
          <kbd className="rounded border border-neutral-300 bg-white px-2 py-0.5 font-mono text-[10px]">
            Shift + Scroll
          </kbd>
          <span>ou glisse le trackpad.</span>
        </div>
      </header>

      {/* Horizontal rail */}
      <section
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-6 pb-6 sm:px-10"
        style={{ scrollbarWidth: "thin" }}
      >
        {designs.map((d, i) => (
          <Link
            key={d.slug}
            href={`/${d.slug}`}
            className={`group relative flex h-[72vh] min-h-[520px] w-[min(78vw,520px)] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-7 shadow-xl transition hover:scale-[1.02] ${d.theme}`}
          >
            <DesignPreview slug={d.slug} />

            <div className="relative z-10 flex items-start justify-between">
              <span className="rounded-full bg-black/30 px-3 py-1 font-mono text-[11px] uppercase tracking-wider backdrop-blur-sm">
                {String(i + 1).padStart(2, "0")} / Design {d.letter}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg backdrop-blur transition group-hover:translate-x-1 group-hover:bg-white/40">
                →
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.25em] opacity-80">
                {d.tagline}
              </p>
              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                {d.subtitle}
              </h2>
              <p className="mt-4 max-w-xs text-sm opacity-90">{d.description}</p>
            </div>
          </Link>
        ))}

        {/* End spacer */}
        <div className="w-6 shrink-0" aria-hidden />
      </section>

      {/* Legend / footer */}
      <footer className="mx-auto max-w-6xl px-6 pb-20 pt-12 sm:px-10">
        <div className="grid gap-6 border-t border-neutral-200 pt-8 text-sm text-neutral-600 sm:grid-cols-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">
              Vraies données
            </p>
            <p className="mt-2">Club Parallailement · FFVL n°28194 · Ilhet (65).</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">
              Contenu temporaire
            </p>
            <p className="mt-2">
              Atterro en cours de conventionnement, balise Pioupiou à venir —
              les placeholders sont marqués dans le code.
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-400">
              Stack
            </p>
            <p className="mt-2">
              Next.js 16 · React 19 · Tailwind 4 · Three.js · framer-motion.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* Lightweight visual previews per design (no runtime cost of the full page). */
function DesignPreview({ slug }: { slug: string }) {
  switch (slug) {
    case "design-a":
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=70)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(20%) brightness(0.85)",
          }}
        />
      );
    case "design-b":
      return (
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="pointer-events-none absolute inset-0 opacity-90"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="80" cy="90" r="60" fill="#f59e0b" />
          <circle cx="320" cy="120" r="50" fill="#f43f5e" opacity="0.8" />
          <circle cx="340" cy="320" r="100" fill="#10b981" opacity="0.7" />
          <circle cx="120" cy="340" r="70" fill="#ffffff" opacity="0.5" />
          <path d="M 0 260 Q 100 200 200 250 T 400 240" stroke="#fff" strokeWidth="3" fill="none" />
        </svg>
      );
    case "design-c":
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span className="font-serif text-[18rem] font-black leading-none tracking-[-0.04em] text-black/10">
            Pa
          </span>
        </div>
      );
    case "design-d":
      return (
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="pointer-events-none absolute inset-0 opacity-80"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="pdsky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect width="400" height="400" fill="url(#pdsky)" />
          <polygon points="-20,300 80,180 140,260 220,140 300,240 420,160 420,400 -20,400" fill="#111827" opacity="0.9" />
          <polygon points="-20,320 60,240 180,300 280,220 420,280 420,400 -20,400" fill="#0b1220" />
          <circle cx="240" cy="180" r="4" fill="#f59e0b" />
          <rect x="228" y="176" width="24" height="2" fill="#f59e0b" />
        </svg>
      );
    case "design-e":
      return (
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="pointer-events-none absolute inset-0 opacity-70"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 40 }).map((_, i) => {
            const y = 40 + (i * 9) % 340;
            const w = 80 + (i * 13) % 200;
            const x = (i * 37) % 300;
            return (
              <path
                key={i}
                d={`M ${x} ${y} q ${w / 2} -40 ${w} 0`}
                stroke="#0e7490"
                strokeWidth="1.5"
                fill="none"
                opacity={0.5 + (i % 5) * 0.08}
              />
            );
          })}
        </svg>
      );
    case "design-f":
      return (
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="pointer-events-none absolute inset-0 opacity-80"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const r = 160 - i * 12;
            return (
              <ellipse
                key={i}
                cx="200"
                cy="200"
                rx={r}
                ry={r * 0.65}
                fill="none"
                stroke="#5b7242"
                strokeWidth="1"
                opacity={0.25 + i * 0.05}
              />
            );
          })}
          <circle cx="160" cy="150" r="8" fill="#dc2626" stroke="white" strokeWidth="2" />
          <circle cx="260" cy="240" r="8" fill="#0ea5e9" stroke="white" strokeWidth="2" />
          <circle cx="300" cy="170" r="8" fill="#ea580c" stroke="white" strokeWidth="2" />
        </svg>
      );
    case "design-h":
      return (
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="pointer-events-none absolute inset-0"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="phtrace" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            <pattern id="phgrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="400" fill="url(#phgrid)" />
          <path
            d="M 40 60 C 120 40 160 160 100 220 S 200 320 260 280 S 380 360 340 400"
            stroke="url(#phtrace)"
            strokeWidth="3"
            fill="none"
          />
          <circle cx="40" cy="60" r="6" fill="#fff" stroke="#0f172a" strokeWidth="2" />
          <circle cx="100" cy="220" r="6" fill="#fff" stroke="#0f172a" strokeWidth="2" />
          <circle cx="260" cy="280" r="6" fill="#fff" stroke="#0f172a" strokeWidth="2" />
        </svg>
      );
    case "design-i":
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 35% 55%, rgba(255,230,180,1) 0%, rgba(245,140,90,0.9) 30%, rgba(120,80,140,0.7) 60%, rgba(30,60,130,0.9) 100%)",
          }}
        />
      );
  }
}
