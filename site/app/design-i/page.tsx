"use client";

import Link from "next/link";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";
import { club, nextEvent, highlights } from "@/lib/content";

/* Fullscreen GLSL sky that reacts to mouse & time. */
function SkyShader() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });

  useFrame((state) => {
    if (!matRef.current) return;
    const t = state.clock.elapsedTime;
    // Smoothly follow pointer
    mouse.current.x += (state.pointer.x * 0.5 + 0.5 - mouse.current.x) * 0.05;
    mouse.current.y += (state.pointer.y * 0.5 + 0.5 - mouse.current.y) * 0.05;
    matRef.current.uniforms.uTime.value = t;
    matRef.current.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uResolution: { value: new THREE.Vector2(1, 1) },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          precision highp float;
          varying vec2 vUv;
          uniform float uTime;
          uniform vec2 uMouse;

          // Hash + value noise
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(41.0, 289.0))) * 45758.5453);
          }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
              mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
              u.y
            );
          }
          float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p *= 2.07;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 uv = vUv;
            // Warp UV slightly by mouse to give a parallax feel
            vec2 mDelta = (uMouse - 0.5) * 0.22;
            uv += mDelta * (1.0 - uv.y);

            // Sun position follows mouse softly
            vec2 sun = vec2(0.35, 0.6) + mDelta * 0.9;

            // Sky gradient
            vec3 top = vec3(0.08, 0.22, 0.48);
            vec3 mid = vec3(0.95, 0.66, 0.42);
            vec3 low = vec3(0.98, 0.42, 0.32);
            vec3 sky = mix(low, mid, smoothstep(0.1, 0.55, uv.y));
            sky = mix(sky, top, smoothstep(0.55, 1.0, uv.y));

            // Sun bloom
            float d = length(uv - sun);
            float sun1 = smoothstep(0.22, 0.0, d);
            float sun2 = smoothstep(0.5, 0.05, d) * 0.45;
            sky += vec3(1.0, 0.84, 0.55) * (sun1 + sun2);

            // Clouds (fbm scrolled in time)
            vec2 cuv = uv * vec2(3.5, 2.5) + vec2(uTime * 0.02, 0.0);
            float clouds = fbm(cuv);
            clouds = smoothstep(0.45, 0.85, clouds);
            vec3 cloudCol = mix(vec3(1.0, 0.88, 0.72), vec3(1.0, 0.95, 0.9), uv.y);
            sky = mix(sky, cloudCol, clouds * 0.55);

            // Soft vignette
            float v = smoothstep(1.0, 0.35, length(vUv - 0.5));
            sky *= v;

            gl_FragColor = vec4(sky, 1.0);
          }
        `}
      />
    </mesh>
  );
}

export default function DesignI() {
  return (
    <main className="relative min-h-screen text-white">
      {/* Sky shader fixed */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
          <Suspense fallback={null}>
            <SkyShader />
          </Suspense>
        </Canvas>
      </div>

      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-30">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-sm sm:px-10">
          <Link href="/" className="font-display font-bold tracking-tight drop-shadow">
            {club.name}
          </Link>
          <span className="text-[11px] uppercase tracking-[0.25em] text-white/80 drop-shadow">
            Ciel · live · 42.96°N
          </span>
          <a
            href="#contact"
            className="rounded-full border border-white/40 px-4 py-1.5 backdrop-blur hover:bg-white/10"
          >
            Adhérer
          </a>
        </nav>
      </header>

      <div className="relative z-10">
        {/* Hero */}
        <section className="flex min-h-screen items-center px-6 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="mx-auto w-full max-w-5xl"
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/80 drop-shadow">
              Parallailement · Vallée d&apos;Aure
            </p>
            <h1 className="mt-4 font-serif text-[16vw] leading-[0.95] tracking-tight drop-shadow-2xl sm:text-[13vw]">
              <span className="block">Le ciel,</span>
              <span className="block italic">c&apos;est ici que ça se passe.</span>
            </h1>
            <p className="mt-10 max-w-lg text-lg text-white/90 drop-shadow">
              Bouge ta souris — le ciel bouge avec toi.
            </p>
          </motion.div>
        </section>

        {/* Glass cards */}
        <section className="px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/70 drop-shadow">
              Ce qu&apos;on fait
            </p>
            <h2 className="mt-3 font-serif text-6xl drop-shadow-lg">
              Trois raisons de nous rejoindre.
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {highlights.map((h) => (
                <motion.article
                  key={h.title}
                  whileHover={{ y: -6 }}
                  className="rounded-3xl border border-white/30 bg-white/15 p-7 backdrop-blur-xl"
                >
                  <h3 className="font-serif text-2xl">{h.title}</h3>
                  <p className="mt-3 text-sm text-white/90">{h.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Event */}
        <section className="px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-5xl rounded-[2.5rem] border border-white/25 bg-white/10 p-12 backdrop-blur-2xl sm:p-16">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">
              Save the date
            </p>
            <h2 className="mt-3 font-serif text-6xl leading-tight">{nextEvent.title}</h2>
            <p className="mt-6 max-w-xl text-white/90">{nextEvent.description}</p>
            <p className="mt-4 text-sm text-white/70">
              {nextEvent.date} · {nextEvent.place}
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="relative border-t border-white/20 bg-black/30 py-14 text-white/85 backdrop-blur-lg"
        >
          <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-3 sm:px-10">
            <div>
              <p className="font-serif text-2xl text-white">{club.name}</p>
              <p className="mt-3 text-sm">{club.address}</p>
              <p className="text-sm">{club.phone}</p>
              <p className="mt-3 text-xs text-white/60">FFVL n°{club.ffvl}</p>
            </div>
            <div className="text-sm">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/60">
                Rejoindre
              </p>
              <a
                href="#"
                className="mt-3 inline-block rounded-full bg-white/20 px-5 py-2 backdrop-blur hover:bg-white/30"
              >
                HelloAsso ↗
              </a>
            </div>
            <div className="text-sm">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/60">
                Voir aussi
              </p>
              <ul className="mt-3 space-y-1">
                <li>
                  <Link href="/" className="underline">
                    ← comparateur
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
