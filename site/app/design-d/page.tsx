"use client";

import Link from "next/link";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { club, nextEvent, highlights } from "@/lib/content";

function Mountains() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  const mountains = [];
  for (let i = 0; i < 28; i++) {
    const x = (Math.random() - 0.5) * 160;
    const z = -Math.random() * 220 - 10;
    const h = 6 + Math.random() * 22;
    mountains.push(
      <mesh key={i} position={[x, h / 2 - 8, z]} castShadow>
        <coneGeometry args={[h * 0.55, h, 4]} />
        <meshStandardMaterial
          color={new THREE.Color().setHSL(0.6 + Math.random() * 0.05, 0.15, 0.2 + Math.random() * 0.25)}
          flatShading
        />
      </mesh>,
    );
  }
  return <group ref={group}>{mountains}</group>;
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, -100]} receiveShadow>
      <planeGeometry args={[500, 500, 1, 1]} />
      <meshStandardMaterial color="#1d2b38" />
    </mesh>
  );
}

function Paraglider({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const p = progress.get();
    ref.current.position.y = 2 + Math.sin(t * 0.8) * 0.3 - p * 2;
    ref.current.position.x = Math.sin(t * 0.4) * 0.6;
    ref.current.rotation.z = Math.sin(t * 0.4) * 0.08;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <group ref={ref} position={[0, 2, -4]}>
        {/* Wing */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[3, 0.1, 0.8]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        {/* Pilot */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Lines */}
        {[-1, -0.5, 0.5, 1].map((x) => (
          <mesh key={x} position={[x, 0.5, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 1]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function FlyingCamera({ progress }: { progress: MotionValue<number> }) {
  useFrame((state) => {
    const p = progress.get();
    const z = 10 - p * 200;
    state.camera.position.set(0, 3 + Math.sin(state.clock.elapsedTime * 0.3) * 0.4, z);
    state.camera.lookAt(0, 1, z - 10);
  });
  return null;
}

function SkyGradient() {
  return (
    <mesh position={[0, 0, -180]} scale={[600, 300, 1]}>
      <planeGeometry />
      <shaderMaterial
        uniforms={{}}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            vec3 top = vec3(0.42, 0.63, 0.85);
            vec3 mid = vec3(0.92, 0.74, 0.52);
            vec3 bottom = vec3(0.98, 0.55, 0.35);
            float t = vUv.y;
            vec3 col = mix(bottom, mid, smoothstep(0.0, 0.55, t));
            col = mix(col, top, smoothstep(0.55, 1.0, t));
            gl_FragColor = vec4(col, 1.0);
          }
        `}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      <SkyGradient />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <fog attach="fog" args={["#f0b787", 15, 140]} />
      <Stars radius={200} depth={50} count={3000} factor={4} fade />
      <Ground />
      <Mountains />
      <Paraglider progress={progress} />
      <FlyingCamera progress={progress} />
    </>
  );
}

export default function DesignD() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const headingOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen text-white"
    >
      {/* 3D canvas fixed behind */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 3, 10], fov: 55 }}>
          <Suspense fallback={null}>
            <Scene progress={scrollYProgress} />
          </Suspense>
        </Canvas>
      </div>
      <div className="relative z-10">

      {/* Top nav */}
      <header className="fixed top-0 inset-x-0 z-30">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-sm sm:px-10">
          <Link href="/" className="font-display font-bold tracking-tight">
            {club.name}
          </Link>
          <span className="text-xs uppercase tracking-[0.25em] text-white/60">
            ↓ Scrolle, tu voles ↓
          </span>
          <a
            href="#contact"
            className="rounded-full border border-white/30 px-4 py-2 backdrop-blur hover:bg-white/10"
          >
            Adhérer
          </a>
        </nav>
      </header>

      {/* Hero over 3D */}
      <motion.section
        style={{ opacity: headingOpacity }}
        className="relative flex h-screen items-end px-6 pb-20 sm:px-10"
      >
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Parallailement · Vallée d&apos;Aure
          </p>
          <h1 className="mt-4 font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-8xl">
            Le vol
            <br />
            commence
            <br />
            <span className="text-amber-300">ici.</span>
          </h1>
        </div>
      </motion.section>

      {/* Sections that appear while camera flies */}
      <Section title="Le décollage" index="01">
        Un déco local, face à la vallée d&apos;Aure. Ouvert aux adhérents. L&apos;atterrissage
        est en cours de conventionnement — on en parle dès que c&apos;est signé.
      </Section>

      <Section title="Thermiques & grands vols" index="02">
        Dans les Pyrénées, le relief joue pour nous. On apprend, on vole ensemble, on partage les
        bons plans sur le groupe.
      </Section>

      <Section title={nextEvent.title} index="03">
        {nextEvent.description} · {nextEvent.date}.
      </Section>

      <Section title="On rejoint ?" index="04">
        Cotisation via HelloAsso, licence via la FFVL (n°{club.ffvl}). Le club est petit, on te
        guide pas à pas.
      </Section>

      {/* Footer */}
      <footer id="contact" className="relative border-t border-white/10 bg-[#0b1220]/80 backdrop-blur py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-3 sm:px-10">
          <div>
            <p className="font-display text-xl font-bold">{club.name}</p>
            <p className="mt-3 text-sm text-white/70">{club.address}</p>
            <p className="text-sm text-white/70">{club.phone}</p>
          </div>
          <div className="text-sm">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">Pratique</p>
            <ul className="mt-3 space-y-1 text-white/70">
              {highlights.map((h) => (
                <li key={h.title}>{h.title}</li>
              ))}
            </ul>
          </div>
          <div className="text-sm">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">Voir aussi</p>
            <ul className="mt-3 space-y-1 text-white/70">
              <li>
                <Link href="/" className="underline">
                  ← comparateur
                </Link>
              </li>
              <li>
                <Link href="/design-e" className="underline">
                  Design E
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

function Section({
  title,
  index,
  children,
}: {
  title: string;
  index: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-screen items-center px-6 sm:px-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl rounded-3xl border border-white/10 bg-[#0b1220]/60 p-10 backdrop-blur"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">{index}</p>
        <h2 className="mt-3 font-display text-4xl font-bold leading-tight">{title}</h2>
        <p className="mt-5 text-white/80">{children}</p>
      </motion.div>
    </section>
  );
}
