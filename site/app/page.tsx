import Link from "next/link";

const designs = [
  {
    slug: "design-a",
    name: "Design A",
    subtitle: "Montagne, photo-first",
    description:
      "Hero photographique plein écran, palette pierre/terre, typographie sobre. Crédible, intemporel, inspiré des sites de massifs.",
    accent: "bg-stone-900 text-stone-50",
    hover: "hover:bg-stone-800",
  },
  {
    slug: "design-b",
    name: "Design B",
    subtitle: "Ludique, identité forte",
    description:
      "Jeu visuel sur le nom « Parallailement », couleurs vives, illustrations, ton familier. Mémorable, communautaire.",
    accent: "bg-sky-500 text-white",
    hover: "hover:bg-sky-600",
  },
  {
    slug: "design-c",
    name: "Design C",
    subtitle: "Magazine éditorial",
    description:
      "Typographie massive, grilles magazine, noir/blanc + un accent. Très peu d'effets, focus composition. Distinctif.",
    accent: "bg-white text-black border border-black",
    hover: "hover:bg-neutral-100",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Parallailement · Comparateur de design
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.05] text-neutral-900 sm:text-7xl">
            Trois directions visuelles
            <br />
            <span className="italic text-neutral-500">à départager.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-neutral-600">
            Chaque page reprend le même contenu et les mêmes sections — seule
            la grammaire visuelle change. Ouvre-les dans trois onglets,
            compare, et dis-moi celle qui te parle.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-3">
          {designs.map((d) => (
            <Link
              key={d.slug}
              href={`/${d.slug}`}
              className={`group rounded-2xl p-6 transition ${d.accent} ${d.hover}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {d.name}
                </span>
                <span className="text-2xl transition group-hover:translate-x-1">
                  →
                </span>
              </div>
              <h2 className="mt-10 font-serif text-3xl leading-tight">
                {d.subtitle}
              </h2>
              <p className="mt-4 text-sm opacity-80">{d.description}</p>
            </Link>
          ))}
        </div>

        <footer className="mt-20 text-xs text-neutral-400">
          <p>
            Contenu temporaire — données club :{" "}
            <span className="font-mono">FFVL n°28194</span> · Ilhet (65).
          </p>
        </footer>
      </div>
    </main>
  );
}
