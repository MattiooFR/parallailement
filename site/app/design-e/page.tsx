"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { club, nextEvent, highlights } from "@/lib/content";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

function WindCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = [];
    const count = 260;
    for (let i = 0; i < count; i++) {
      particles.push(makeParticle(width, height));
    }

    function makeParticle(w: number, h: number): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 80 + Math.random() * 240,
      };
    }

    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", onResize);

    function field(x: number, y: number, t: number) {
      const nx = x * 0.002;
      const ny = y * 0.002;
      const ang =
        Math.sin(nx * 3 + t * 0.0006) +
        Math.cos(ny * 3 + t * 0.0004) +
        Math.sin((nx + ny) * 2 + t * 0.0002);
      return ang * Math.PI;
    }

    let rafId: number;
    const draw = (t: number) => {
      ctx.fillStyle = "rgba(247, 250, 255, 0.06)";
      ctx.fillRect(0, 0, width, height);

      for (let p of particles) {
        const a = field(p.x, p.y, t);
        p.vx = Math.cos(a) * 1.4;
        p.vy = Math.sin(a) * 1.4;

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < 30000) {
          const f = (30000 - d2) / 30000;
          p.vx += (dx / Math.sqrt(d2 + 1)) * f * 0.8;
          p.vy += (dy / Math.sqrt(d2 + 1)) * f * 0.8;
        }

        const oldX = p.x;
        const oldY = p.y;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        ctx.strokeStyle = `rgba(14, 116, 144, ${0.18 + Math.min(0.5, p.life / p.maxLife)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(oldX, oldY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        if (
          p.life > p.maxLife ||
          p.x < -10 ||
          p.x > width + 10 ||
          p.y < -10 ||
          p.y > height + 10
        ) {
          Object.assign(p, makeParticle(width, height));
        }
      }
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />;
}

export default function DesignE() {
  return (
    <main className="relative min-h-screen bg-[#f7faff] text-slate-900">
      <WindCanvas />

      <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-white/90 to-white/0 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-sm sm:px-10">
          <Link href="/" className="font-display font-bold tracking-tight">
            {club.name}
          </Link>
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Balise · live · Ilhet
          </span>
          <a
            href="#contact"
            className="rounded-full border border-slate-900/20 px-4 py-2 hover:bg-slate-900 hover:text-white"
          >
            Adhérer
          </a>
        </nav>
      </header>

      <div className="relative z-10">
        {/* Hero */}
        <section className="flex min-h-screen items-center px-6 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mx-auto w-full max-w-6xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-cyan-700 shadow-sm ring-1 ring-slate-900/5 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" /> Les
              thermiques travaillent
            </div>
            <h1 className="mt-8 max-w-5xl font-display text-7xl font-bold leading-[0.95] tracking-tight sm:text-[12vw]">
              On lit le <span className="italic text-cyan-700">vent</span>,
              <br />
              puis on vole.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-slate-600">
              Un club de vol libre en vallée d&apos;Aure. On veut connaître la
              météo avant de monter — alors on la montre.
            </p>
          </motion.div>
        </section>

        {/* Live wind panel */}
        <section className="px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-6xl rounded-3xl bg-white/70 p-10 shadow-lg ring-1 ring-slate-900/5 backdrop-blur-lg">
            <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-700">
                  Balise Pioupiou · Ilhet
                </p>
                <p className="mt-2 font-display text-3xl font-bold">Arrive bientôt</p>
                <p className="mt-4 text-slate-600">
                  Notre balise est en cours d&apos;installation au décollage. Le site
                  affichera la donnée en direct dès qu&apos;elle sera allumée — et les
                  particules du fond y réagiront.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Vent moy.", value: "—", unit: "km/h" },
                  { label: "Rafale", value: "—", unit: "km/h" },
                  { label: "Orient.", value: "—", unit: "°" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-900/5"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      {m.label}
                    </p>
                    <p className="mt-2 font-display text-4xl font-bold">{m.value}</p>
                    <p className="text-xs text-slate-500">{m.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Thermique cards — float in */}
        <section className="px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-700">
              Ce qu&apos;on fait
            </p>
            <h2 className="mt-3 font-display text-5xl font-bold leading-tight">
              Trois thermiques à prendre.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {highlights.map((h, i) => (
                <motion.article
                  key={h.title}
                  initial={{ opacity: 0, y: 80 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.4 }}
                  transition={{ duration: 0.9, delay: i * 0.12, ease: "easeOut" }}
                  className="rounded-3xl bg-white/80 p-7 ring-1 ring-slate-900/5 backdrop-blur"
                >
                  <div className="text-xs font-medium text-cyan-700">
                    {String(i + 1).padStart(2, "0")} /
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-bold">{h.title}</h3>
                  <p className="mt-3 text-slate-600">{h.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Event */}
        <section className="px-6 py-24 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-900 p-12 text-white shadow-xl sm:p-16"
          >
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200">
              Save the date
            </p>
            <h2 className="mt-3 font-display text-5xl font-bold leading-tight sm:text-6xl">
              {nextEvent.title}
            </h2>
            <p className="mt-5 max-w-xl text-cyan-50">{nextEvent.description}</p>
            <p className="mt-6 text-sm text-cyan-200">
              {nextEvent.date} · {nextEvent.place}
            </p>
          </motion.div>
        </section>

        <footer id="contact" className="bg-slate-900 py-14 text-slate-300">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-3 sm:px-10">
            <div>
              <p className="font-display text-xl font-bold text-white">{club.name}</p>
              <p className="mt-3 text-sm">{club.address}</p>
              <p className="text-sm">{club.phone}</p>
              <p className="mt-4 text-xs text-slate-500">FFVL n°{club.ffvl}</p>
            </div>
            <div className="text-sm">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                Rejoindre
              </p>
              <a
                href="#"
                className="mt-3 inline-block rounded-full bg-cyan-500 px-5 py-2 text-white transition hover:bg-cyan-400"
              >
                HelloAsso ↗
              </a>
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
                  <Link href="/design-d" className="underline">
                    Design D
                  </Link>
                </li>
                <li>
                  <Link href="/design-f" className="underline">
                    Design F
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
