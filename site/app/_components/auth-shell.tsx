import Link from "next/link";
import type { ReactNode } from "react";
import { club } from "@/lib/content";

export function AuthShell({
  eyebrow,
  title,
  accent,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-emerald-950 text-emerald-50">
      <div
        className="pointer-events-none absolute -right-40 -top-36 h-[34rem] w-[34rem] rounded-full border border-emerald-100/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-56 -left-48 h-[38rem] w-[38rem] rounded-full border border-emerald-100/10"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-10">
        <Link href="/" className="font-serif text-xl tracking-tight transition hover:text-amber-200">
          {club.name}
        </Link>
        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
          <section>
            <p className="text-xs uppercase tracking-[0.24em] text-amber-200">{eyebrow}</p>
            <h1 className="mt-5 max-w-2xl font-serif text-[clamp(3rem,8vw,6.2rem)] leading-[0.88] tracking-[-0.045em]">
              {title} <span className="italic text-amber-200">{accent}</span>
            </h1>
            <div className="mt-8 max-w-lg text-lg leading-relaxed text-emerald-100/70">{intro}</div>
          </section>
          <section className="rounded-2xl bg-[#f7f4ed] p-6 text-stone-900 shadow-2xl shadow-black/20 sm:p-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
