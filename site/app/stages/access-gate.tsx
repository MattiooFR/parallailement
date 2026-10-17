import Link from "next/link";
import { club } from "@/lib/content";

function LockMark() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="h-12 w-12 text-amber-300"
    >
      <path
        d="M15 21v-5a9 9 0 0 1 18 0v5M12 21h24v20H12z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M24 29v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function StagesAccessGate() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-emerald-950 px-6 py-16 text-emerald-50 sm:px-10">
      <div
        className="pointer-events-none absolute -right-40 -top-36 h-[34rem] w-[34rem] rounded-full border border-emerald-100/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-56 -left-48 h-[38rem] w-[38rem] rounded-full border border-emerald-100/10"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,0.72fr)] lg:items-end">
        <section>
          <p className="text-xs uppercase tracking-[0.24em] text-amber-200">
            {club.name} · espace membres
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-[clamp(3.8rem,9vw,7.4rem)] leading-[0.84] tracking-[-0.055em]">
            Accès
            <br />
            <span className="italic text-amber-200">réservé.</span>
          </h1>
          <p className="mt-9 max-w-xl text-lg leading-relaxed text-emerald-100/70">
            L’annuaire des stages est ouvert aux membres à qui le bureau a donné l’accès. Demande-le à un admin du
            club.
          </p>
        </section>

        <section className="border-t border-emerald-100/20 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <LockMark />
          <Link
            href="/espace"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-amber-300 px-7 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
          >
            Retour à mon espace
          </Link>
        </section>
      </div>
    </main>
  );
}
