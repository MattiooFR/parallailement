export default function StagesLoading() {
  return (
    <main className="min-h-screen bg-[#f2efe7] text-stone-900">
      <div className="h-20 bg-emerald-950" />
      <section className="bg-emerald-950 px-6 pb-24 pt-20 text-emerald-50 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-200">
            L’agenda collectif du parapente
          </p>
          <h1 className="mt-6 font-serif text-6xl leading-[0.9] sm:text-8xl">
            On consulte les carnets de vol…
          </h1>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10">
        <div className="h-14 max-w-3xl animate-pulse border-b border-stone-400 bg-stone-200/50" />
        <div className="mt-14 space-y-10" aria-hidden="true">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-44 animate-pulse border-t border-stone-300 bg-stone-200/40"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
