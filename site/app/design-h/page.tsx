"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { club, nextEvent, highlights } from "@/lib/content";

// One SVG path spanning the whole page height. We draw it as scroll advances.
const PATH =
  "M 120 80 C 220 60 300 180 260 260 S 180 480 330 540 S 560 600 600 780 S 520 960 660 1060 S 920 1140 780 1320 S 480 1420 640 1580 S 920 1700 760 1880 S 420 1980 620 2140 S 900 2240 760 2400 S 420 2540 680 2720";

const stats = [
  { label: "Distance", value: "42", unit: "km" },
  { label: "Gain vario max", value: "+3.4", unit: "m/s" },
  { label: "Plafond", value: "2 980", unit: "m" },
  { label: "Temps de vol", value: "3h12", unit: "" },
];

export default function DesignH() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Draw length: 0..1
  const draw = useTransform(scrollYProgress, [0, 0.95], [0, 1]);
  // Varioglyph y-position pulled along the path via pathLength
  const varioY = useTransform(scrollYProgress, [0, 1], [80, 2720]);
  const varioX = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [120, 280, 620, 760, 680]);

  return (
    <main ref={containerRef} className="relative bg-[#fbfaf6] text-slate-900">
      {/* Paper grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(#9ca3af 1px, transparent 1px), linear-gradient(90deg, #9ca3af 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Trace SVG (absolute on top of content) */}
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 1000 2800"
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <linearGradient id="trace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>

        {/* Faded full path */}
        <path
          d={PATH}
          stroke="#cbd5e1"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 6"
        />
        {/* Drawn path */}
        <motion.path
          d={PATH}
          stroke="url(#trace)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          style={{ pathLength: draw }}
        />

        {/* Waypoints — every ~500px */}
        {[80, 540, 1060, 1580, 2140, 2720].map((y, i) => {
          const xs = [120, 330, 660, 760, 620, 760];
          return (
            <g key={i}>
              <circle cx={xs[i]} cy={y} r="6" fill="#fff" stroke="#0f172a" strokeWidth="2" />
              <text
                x={xs[i] + 14}
                y={y + 4}
                fontSize="11"
                fill="#0f172a"
                fontWeight="700"
                fontFamily="ui-monospace, monospace"
              >
                WP{String(i + 1).padStart(2, "0")}
              </text>
            </g>
          );
        })}

        {/* Moving glider head */}
        <motion.g style={{ translateX: varioX, translateY: varioY }}>
          <circle r="10" fill="#dc2626" stroke="#fff" strokeWidth="3" />
          <circle r="22" fill="#dc2626" opacity="0.18" />
        </motion.g>
      </svg>

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-slate-900/10 bg-[#fbfaf6]/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-sm sm:px-10">
          <Link href="/" className="font-display font-bold tracking-tight">
            {club.name}
          </Link>
          <span className="hidden items-center gap-4 font-mono text-[11px] uppercase tracking-[0.15em] text-slate-600 sm:flex">
            <MotionCounter value={scrollYProgress} />
          </span>
          <a
            href="#contact"
            className="rounded-full border border-slate-900/30 px-4 py-1.5 hover:bg-slate-900 hover:text-white"
          >
            Adhérer
          </a>
        </nav>
      </header>

      {/* Content — aligned on the opposite side of the trace */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        {/* Hero — WP01 */}
        <section className="flex min-h-screen items-center">
          <div className="ml-auto max-w-xl text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-red-600">
              WP01 — Takeoff
            </p>
            <h1 className="mt-4 font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
              Un tracklog
              <br />
              <span className="italic">qui s&apos;écrit</span>
              <br />
              en scrollant.
            </h1>
            <p className="mt-8 text-slate-600">
              Chaque section du site est un waypoint — scrolle et tu suis la
              trace d&apos;un vol imaginaire au-dessus de la vallée d&apos;Aure.
            </p>
          </div>
        </section>

        {/* WP02 — stats */}
        <section className="flex min-h-screen items-center">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-red-600">
              WP02 — Thermal hooked
            </p>
            <h2 className="mt-4 font-display text-5xl font-bold">
              Le club en chiffres.
            </h2>
            <dl className="mt-10 grid grid-cols-2 gap-6 font-mono text-sm">
              {stats.map((s) => (
                <div key={s.label} className="border-l-4 border-red-600 pl-4">
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    {s.label}
                  </dt>
                  <dd className="font-display text-3xl font-bold">
                    {s.value}
                    <span className="ml-1 text-base font-normal text-slate-500">
                      {s.unit}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* WP03 — highlights */}
        <section className="flex min-h-screen items-center">
          <div className="ml-auto max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-red-600">
              WP03 — Transition
            </p>
            <h2 className="mt-4 font-display text-5xl font-bold">Au programme.</h2>
            <ul className="mt-10 space-y-5">
              {highlights.map((h, i) => (
                <motion.li
                  key={h.title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="border-b border-slate-300 pb-4"
                >
                  <p className="font-mono text-xs text-slate-500">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-2xl font-bold">{h.title}</h3>
                  <p className="mt-1 text-slate-600">{h.body}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* WP04 — event */}
        <section className="flex min-h-screen items-center">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-red-600">
              WP04 — Event
            </p>
            <h2 className="mt-4 font-display text-6xl font-bold leading-[0.95]">
              {nextEvent.title}
            </h2>
            <p className="mt-6 text-slate-600">{nextEvent.description}</p>
            <p className="mt-4 font-mono text-sm text-slate-500">
              {nextEvent.date} · {nextEvent.place}
            </p>
          </div>
        </section>

        {/* WP05 — CTA */}
        <section className="flex min-h-screen items-center">
          <div className="ml-auto max-w-xl text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-red-600">
              WP05 — Descent
            </p>
            <h2 className="mt-4 font-display text-5xl font-bold">
              On termine
              <br />
              en vol plané.
            </h2>
            <p className="mt-6 text-slate-600">
              Adhésion via HelloAsso, licence via la FFVL n°{club.ffvl}. On te montre
              tout.
            </p>
            <a
              href="#"
              className="mt-8 inline-block rounded-full bg-slate-900 px-6 py-3 text-white transition hover:bg-red-600"
            >
              Rejoindre le club →
            </a>
          </div>
        </section>

        {/* Landing — WP06 */}
        <section className="flex min-h-[80vh] items-end pb-28">
          <div className="mx-auto text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-sky-600">
              WP06 — Landed · {club.address}
            </p>
            <p className="mt-4 font-display text-3xl font-bold">Vol. 01 — terminé.</p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer id="contact" className="relative z-30 border-t border-slate-900/10 bg-slate-900 py-14 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-3 sm:px-10">
          <div>
            <p className="font-display text-xl font-bold text-white">{club.name}</p>
            <p className="mt-3 text-sm">{club.address}</p>
            <p className="text-sm">{club.phone}</p>
          </div>
          <div className="text-sm">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
              Fédération
            </p>
            <p className="mt-3 text-slate-400">FFVL n°{club.ffvl}</p>
          </div>
          <div className="text-sm">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
              Voir aussi
            </p>
            <ul className="mt-3 space-y-1">
              <li>
                <Link href="/" className="underline">
                  ← comparateur
                </Link>
              </li>
              <li>
                <Link href="/design-i" className="underline">
                  Design I
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}

function MotionCounter({
  value,
}: {
  value: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const pct = useTransform(value, (v) => `${Math.round(v * 100)}%`);
  const text = useMotionTemplate`Trace · ${pct}`;
  return <motion.span>{text}</motion.span>;
}
