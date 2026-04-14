"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { club, nextEvent, highlights } from "@/lib/content";

type Pin = {
  x: number; // 0..1000
  y: number; // 0..600
  label: string;
  kind: "deco" | "atterro" | "club" | "event" | "weather";
};

const pins: Pin[] = [
  { x: 320, y: 180, label: "Décollage", kind: "deco" },
  { x: 520, y: 420, label: "Atterro *", kind: "atterro" },
  { x: 280, y: 460, label: "Local du club", kind: "club" },
  { x: 680, y: 260, label: "Thermiques", kind: "weather" },
  { x: 800, y: 460, label: "Fête du club", kind: "event" },
];

function Topography() {
  // Nested "contour" polygons to suggest a valley from above
  const contours: { d: string; opacity: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const k = i / 14;
    const cx = 500 + Math.sin(k * 6) * 20;
    const cy = 300 + Math.cos(k * 4) * 10;
    const rx = 480 - i * 26 + Math.sin(i) * 18;
    const ry = 260 - i * 14 + Math.cos(i) * 10;
    contours.push({
      d: makeContour(cx, cy, rx, ry, i),
      opacity: 0.14 + k * 0.18,
    });
  }

  return (
    <svg
      viewBox="0 0 1000 600"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="terrain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eef4ea" />
          <stop offset="100%" stopColor="#c2d3b5" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff8e7" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff8e7" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1000" height="600" fill="url(#terrain)" />
      <rect width="1000" height="600" fill="url(#glow)" />

      {/* Rivers */}
      <path
        d="M 0 430 C 180 420 260 500 420 480 S 720 410 1000 430"
        fill="none"
        stroke="#6a9ec0"
        strokeWidth="3"
        opacity="0.6"
      />

      {/* Contours */}
      {contours.map((c, i) => (
        <path
          key={i}
          d={c.d}
          fill="none"
          stroke="#5b7242"
          strokeWidth="0.9"
          opacity={c.opacity}
        />
      ))}

      {/* North */}
      <g transform="translate(60, 60)" opacity="0.7">
        <circle r="22" fill="none" stroke="#334155" strokeWidth="1.2" />
        <path d="M 0 -18 L 6 0 L 0 18 L -6 0 Z" fill="#334155" />
        <text
          y="-30"
          fontSize="11"
          fill="#334155"
          textAnchor="middle"
          fontFamily="system-ui"
          fontWeight="600"
        >
          N
        </text>
      </g>

      {/* Scale bar */}
      <g transform="translate(60, 540)" opacity="0.7">
        <line x1="0" y1="0" x2="100" y2="0" stroke="#334155" strokeWidth="2" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#334155" strokeWidth="2" />
        <line x1="50" y1="-4" x2="50" y2="4" stroke="#334155" strokeWidth="2" />
        <line x1="100" y1="-4" x2="100" y2="4" stroke="#334155" strokeWidth="2" />
        <text
          y="-10"
          fontSize="10"
          fill="#334155"
          fontFamily="system-ui"
        >
          0 — 1km
        </text>
      </g>
    </svg>
  );
}

function makeContour(cx: number, cy: number, rx: number, ry: number, seed: number) {
  const pts: string[] = [];
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const noise =
      Math.sin(a * 3 + seed * 0.7) * 6 +
      Math.cos(a * 5 + seed) * 4 +
      Math.sin(a * 7 + seed * 1.3) * 2;
    const x = cx + Math.cos(a) * (rx + noise);
    const y = cy + Math.sin(a) * (ry + noise);
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  pts.push("Z");
  return pts.join(" ");
}

function PinMarker({ pin, highlight }: { pin: Pin; highlight: boolean }) {
  const colors: Record<Pin["kind"], string> = {
    deco: "#dc2626",
    atterro: "#ca8a04",
    club: "#0ea5e9",
    event: "#ea580c",
    weather: "#16a34a",
  };
  return (
    <motion.g
      style={{
        transform: `translate(${pin.x}px, ${pin.y}px)`,
      }}
      animate={{ scale: highlight ? 1.6 : 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      <circle r="18" fill={colors[pin.kind]} opacity="0.18" />
      <circle r="7" fill={colors[pin.kind]} stroke="white" strokeWidth="2" />
      <text
        x="14"
        y="5"
        fontSize="11"
        fill="#0f172a"
        fontFamily="system-ui"
        fontWeight="600"
      >
        {pin.label}
      </text>
    </motion.g>
  );
}

export default function DesignF() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  // Map pan + zoom driven by scroll
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 1.4, 1.2, 1.6, 1.1]);
  const tx = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, -60, -180, -300, -380]);
  const ty = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, -40, -120, -200, -240]);

  const activeIdx = useTransform(scrollYProgress, (v) => Math.min(pins.length - 1, Math.floor(v * pins.length)));

  return (
    <main ref={containerRef} className="relative bg-[#f2ede3]">
      {/* Map fixed behind */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          style={{
            scale,
            x: tx,
            y: ty,
            transformOrigin: "center center",
          }}
        >
          <Topography />
          <svg
            viewBox="0 0 1000 600"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
          >
            {pins.map((p, i) => (
              <DynamicPin key={p.label} pin={p} idx={i} activeIdx={activeIdx} />
            ))}
          </svg>
        </motion.div>
      </div>

      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-30">
        <nav className="mx-auto flex max-w-6xl items-center justify-between bg-[#f2ede3]/80 px-6 py-4 text-sm backdrop-blur-md sm:px-10">
          <Link href="/" className="font-display font-bold tracking-tight">
            {club.name}
          </Link>
          <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
            Vallée d&apos;Aure · 1:25 000
          </span>
          <a
            href="#contact"
            className="rounded-full border border-slate-900/20 px-4 py-1.5 hover:bg-slate-900 hover:text-white"
          >
            Adhérer
          </a>
        </nav>
      </header>

      {/* Sections — each matched to a pin */}
      <div className="relative z-10">
        <MapSection title="Parallailement" subtitle="Ilhet · Hautes-Pyrénées" first>
          Un club de vol libre en vallée d&apos;Aure. Ce site est une carte —
          scrolle et tu découvres les points d&apos;intérêt.
        </MapSection>

        <MapSection title="Le décollage" subtitle="Point 01 · 1300 m env.">
          Déco local, ouvert aux adhérents. Orientations et fiche technique disponibles
          dans l&apos;espace membres.
        </MapSection>

        <MapSection title="Atterrissage *" subtitle="Point 02 · en cours de conventionnement">
          L&apos;atterro officiel est en cours de conventionnement. On communique les zones
          utilisables en attendant.
        </MapSection>

        <MapSection title="Local du club" subtitle={`Point 03 · ${club.address}`}>
          Siège de l&apos;association, point de rencontre, lieu des assemblées générales.
        </MapSection>

        <MapSection title={nextEvent.title} subtitle={`Point 04 · ${nextEvent.date}`}>
          {nextEvent.description}
        </MapSection>
      </div>

      {/* Legend / footer */}
      <footer id="contact" className="relative z-10 mt-20 bg-slate-900 py-14 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-10">
          <div>
            <p className="font-display text-xl font-bold text-white">{club.name}</p>
            <p className="mt-3 text-sm">{club.address}</p>
            <p className="text-sm">{club.phone}</p>
            <p className="mt-3 text-xs text-slate-500">FFVL n°{club.ffvl}</p>
          </div>
          <div className="text-sm">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Légende</p>
            <ul className="mt-3 space-y-2">
              <LegendItem color="#dc2626" label="Décollage" />
              <LegendItem color="#ca8a04" label="Atterrissage" />
              <LegendItem color="#0ea5e9" label="Local du club" />
              <LegendItem color="#16a34a" label="Météo / balise" />
              <LegendItem color="#ea580c" label="Événement" />
            </ul>
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
              {["a", "b", "c", "d", "e", "h", "i"].map((s) => (
                <li key={s}>
                  <Link href={`/design-${s}`} className="underline">
                    Design {s.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}

function DynamicPin({
  pin,
  idx,
  activeIdx,
}: {
  pin: Pin;
  idx: number;
  activeIdx: MotionValue<number>;
}) {
  const isActive = useTransform(activeIdx, (v) => v === idx);
  return <PinMarker pin={pin} highlight={isActive.get()} />;
}

function MapSection({
  title,
  subtitle,
  children,
  first,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section className={`flex min-h-screen items-center px-6 sm:px-10 ${first ? "pt-40" : ""}`}>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-md rounded-2xl border border-slate-900/10 bg-[#fffefb]/92 p-8 shadow-xl backdrop-blur"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{subtitle}</p>
        <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-4 text-slate-700">{children}</p>
      </motion.div>
    </section>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="inline-block h-3 w-3 rounded-full ring-2 ring-white"
        style={{ backgroundColor: color }}
      />
      {label}
    </li>
  );
}
