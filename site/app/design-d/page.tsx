"use client";

import Link from "next/link";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Line } from "@react-three/drei";
import * as THREE from "three";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { club, nextEvent, highlights } from "@/lib/content";

type Mouse = {
  x: number;
  y: number;
  active: boolean;
  /** incremented on each click to trigger a loop animation */
  loopToken: number;
};

const LOOP_DURATION = 1.8; // seconds
const PIVOT_Y = 2.0; // vertical offset (local Y) where the pilot group orbits — near the wing anchor.

const smoothstep = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

/** Rotation of the whole canopy+pilot during the loop (radians, around X axis).
 *  Signs are calibrated for the Y-flipped model: positive X = leading edge UP (cabrage),
 *  negative X = leading edge DOWN (piqué), full front loop goes to -2π. */
function loopParaPitch(lp: number) {
  // 0 .. 0.16 : cabrage (leading edge up) → +0.45
  if (lp < 0.16) return 0.45 * smoothstep(lp / 0.16);
  // 0.16 .. 0.28 : piqué (dives forward to build speed) → -0.35
  if (lp < 0.28) {
    const t = (lp - 0.16) / 0.12;
    return 0.45 - 0.8 * smoothstep(t);
  }
  // 0.28 .. 0.92 : full front loop (-2π rotation) — canopy + pilot rotate together
  if (lp < 0.92) {
    const t = (lp - 0.28) / 0.64;
    return -0.35 - Math.PI * 2 * smoothstep(t);
  }
  // 0.92 .. 1 : settle from (-2π - 0.35) back to -2π (same as 0 visually)
  const t = (lp - 0.92) / 0.08;
  return -Math.PI * 2 - 0.35 * (1 - smoothstep(t));
}

/** Pendulum offset of the pilot relative to the canopy during the loop.
 *  Small swing that gives life to the movement (pilot lags/leads the wing). */
function loopPilotAngle(lp: number) {
  // Only active during the 2π loop phase.
  if (lp < 0.28) return 0;
  if (lp < 0.92) {
    const t = (lp - 0.28) / 0.64;
    // Bell curve: pilot swings out and back within the loop.
    return Math.sin(t * Math.PI) * 0.35;
  }
  return 0;
}

/** Forward Z advance during the sequence (negative = forward). */
function loopForward(lp: number) {
  return -Math.sin(lp * Math.PI) * 2.8;
}

/** Small vertical bump during the sequence. */
function loopRise(lp: number) {
  return Math.sin(lp * Math.PI) * 0.6;
}

const WORLD_CYCLE = 260; // how often the decor repeats in the Z axis
const WORLD_SPEED = 8;   // base flow speed (units / second)

function makePeak(id: string, x: number, y: number, z: number, h: number, color: string) {
  return (
    <mesh key={id} position={[x, y, z]} castShadow>
      <coneGeometry args={[h * 0.55, h, 4]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

function mountainLayer(seedSalt: number) {
  // Deterministic layout shared between copies so the loop is seamless.
  let s = 13 + seedSalt;
  const rng = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const peaks: React.ReactElement[] = [];

  // Close peaks — line the flight corridor on both sides so the pilot can steer between them.
  for (let i = 0; i < 16; i++) {
    const side = rng() > 0.5 ? 1 : -1;
    const x = side * (3.5 + rng() * 6.5); // 3.5..10
    const z = -rng() * WORLD_CYCLE;
    const h = 4 + rng() * 8;
    const color = new THREE.Color()
      .setHSL(0.58 + rng() * 0.05, 0.22, 0.22 + rng() * 0.22)
      .getStyle();
    peaks.push(makePeak(`nc${seedSalt}-${i}`, x, h / 2 - 8, z, h, color));
  }

  // Backdrop peaks — pushed further out for scenery.
  for (let i = 0; i < 14; i++) {
    const side = rng() > 0.5 ? 1 : -1;
    const x = side * (18 + rng() * 100);
    const z = -rng() * WORLD_CYCLE;
    const h = 14 + rng() * 22;
    const color = new THREE.Color()
      .setHSL(0.58 + rng() * 0.06, 0.2, 0.18 + rng() * 0.2)
      .getStyle();
    peaks.push(makePeak(`fb${seedSalt}-${i}`, x, h / 2 - 8, z, h, color));
  }

  return peaks;
}

function WorldDecor({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const layerA = mountainLayer(0);
  const layerB = mountainLayer(0); // same layout, offset by WORLD_CYCLE for seamless loop
  return (
    <group ref={groupRef}>
      {/* Copy A */}
      <group>{layerA}</group>
      {/* Copy B shifted back — so when A flows past, B is already there */}
      <group position={[0, 0, -WORLD_CYCLE]}>{layerB}</group>
      {/* Signature take-off mountain — sits in the loop so it passes by too. */}
      <mesh position={[18, 8, -WORLD_CYCLE * 0.6]} castShadow>
        <coneGeometry args={[10, 32, 5]} />
        <meshStandardMaterial color="#3b4a5f" flatShading />
      </mesh>
      <mesh position={[18, 20, -WORLD_CYCLE * 0.6]} castShadow>
        <coneGeometry args={[3.5, 8, 5]} />
        <meshStandardMaterial color="#f1f5f9" flatShading />
      </mesh>
    </group>
  );
}

function WorldFlow({
  groupRef,
  pilotPosRef,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  pilotPosRef: React.MutableRefObject<THREE.Vector3>;
}) {
  const zOffset = useRef(0);
  const xDrift = useRef(0);
  const yawRef = useRef(0);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Constant forward flow.
    zOffset.current += dt * WORLD_SPEED;
    groupRef.current.position.z = zOffset.current % WORLD_CYCLE;

    // Lateral drift: pilot steers toward pgX → the world drifts the same way so new terrain
    // keeps coming into view from that direction.
    const pgX = pilotPosRef.current.x;
    xDrift.current += pgX * dt * 2.5;
    // Wrap lateral drift so we don't grow unbounded.
    const wrap = WORLD_CYCLE;
    if (xDrift.current > wrap) xDrift.current -= wrap * 2;
    if (xDrift.current < -wrap) xDrift.current += wrap * 2;
    groupRef.current.position.x = xDrift.current;

    // Yaw of the world to reinforce the steering feel.
    const targetYaw = THREE.MathUtils.clamp(pgX * 0.09, -0.4, 0.4);
    yawRef.current += (targetYaw - yawRef.current) * 0.06;
    groupRef.current.rotation.y = yawRef.current;
  });
  return null;
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, -100]} receiveShadow>
      <planeGeometry args={[600, 600, 1, 1]} />
      <meshStandardMaterial color="#1d2b38" />
    </mesh>
  );
}

// Wing geometry constants (reused by Lines())
const WING_SPAN = 4.6;
const WING_CHORD = 1.05;
const WING_CELLS = 16;
const WING_ARCH = 1.0;       // how high the center sits above the tips
const WING_BASE_Y = 1.1;     // offset of wing tips above pilot origin

// Returns (y, z) of wing mid-line at normalized chord position tc in [-0.5, 0.5].
function wingPoint(tc: number) {
  // Arch: center HIGH, tips LOW.
  const y = WING_BASE_Y + WING_ARCH * Math.cos(tc * Math.PI * 0.82);
  // Slight forward sweep near the tips (tips advance a bit in front of the center).
  const z = -Math.pow(Math.abs(tc * 2), 2) * 0.25;
  return { y, z };
}

function Wing() {
  const cells: React.ReactElement[] = [];
  const trailing: React.ReactElement[] = [];
  const leading: React.ReactElement[] = [];

  for (let i = 0; i < WING_CELLS; i++) {
    const t = i / (WING_CELLS - 1);
    const tc = t - 0.5;
    const x = tc * WING_SPAN;
    const { y, z } = wingPoint(tc);

    // Each cell is tangent to the arc — roll around Z so the chord follows the curve.
    const roll = Math.sin(tc * Math.PI * 0.82) * 0.7;

    // Color banding
    const abs = Math.abs(tc);
    const color =
      abs > 0.42 ? "#dc2626" : abs > 0.26 ? "#f59e0b" : "#fbbf24";

    const cellW = (WING_SPAN / WING_CELLS) * 0.96;

    cells.push(
      <mesh key={"c" + i} position={[x, y, z]} rotation={[0, 0, roll]}>
        <boxGeometry args={[cellW, 0.32, WING_CHORD]} />
        <meshStandardMaterial color={color} flatShading roughness={0.55} />
      </mesh>,
    );

    // Trailing edge — dark stripe along the back
    trailing.push(
      <mesh
        key={"t" + i}
        position={[x, y - 0.1, z - WING_CHORD / 2 + 0.03]}
        rotation={[0, 0, roll]}
      >
        <boxGeometry args={[cellW, 0.1, 0.08]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>,
    );

    // Leading edge — slightly rounded
    leading.push(
      <mesh
        key={"l" + i}
        position={[x, y + 0.15, z + WING_CHORD / 2 - 0.04]}
        rotation={[0, 0, roll]}
      >
        <boxGeometry args={[cellW, 0.08, 0.08]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>,
    );
  }

  return (
    <group>
      {cells}
      {trailing}
      {leading}
    </group>
  );
}

function Harness() {
  return (
    <group scale={0.7}>
      {/* Cocoon body */}
      <mesh rotation={[-0.15, 0, 0]}>
        <capsuleGeometry args={[0.26, 0.75, 6, 12]} />
        <meshStandardMaterial color="#1e293b" flatShading />
      </mesh>
      {/* Legs forward */}
      <mesh position={[0, -0.15, 0.48]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[0.3, 0.25, 0.65]} />
        <meshStandardMaterial color="#0f172a" flatShading />
      </mesh>
      {/* Speedbar */}
      <mesh position={[0, -0.34, 0.85]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.35, 6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Back plate */}
      <mesh position={[0, 0.18, -0.2]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[0.32, 0.4, 0.1]} />
        <meshStandardMaterial color="#0f172a" flatShading />
      </mesh>
      {/* Helmet */}
      <mesh position={[0, 0.46, -0.04]}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.35} />
      </mesh>
    </group>
  );
}

function Lines() {
  // Risers converge at two points above the pilot's shoulders, then fan out to the wing.
  const riserL: [number, number, number] = [-0.2, 0.35, 0];
  const riserR: [number, number, number] = [0.2, 0.35, 0];

  const ratios = [-0.46, -0.32, -0.18, -0.06, 0.06, 0.18, 0.32, 0.46];
  const els: React.ReactElement[] = [];

  ratios.forEach((r, i) => {
    const x = r * WING_SPAN;
    const { y, z } = wingPoint(r);
    const target = r < 0 ? riserL : riserR;
    els.push(
      <Line
        key={"s" + i}
        points={[
          [x, y - 0.2, z],
          target,
        ]}
        color="#e2e8f0"
        lineWidth={0.8}
        transparent
        opacity={0.75}
      />,
    );
  });

  els.push(
    <Line
      key="rl"
      points={[riserL, [-0.16, -0.05, 0]]}
      color="#cbd5e1"
      lineWidth={1.3}
      transparent
      opacity={0.95}
    />,
    <Line
      key="rr"
      points={[riserR, [0.16, -0.05, 0]]}
      color="#cbd5e1"
      lineWidth={1.3}
      transparent
      opacity={0.95}
    />,
  );

  return <>{els}</>;
}

// Keyframed wander path (X, Y) along scroll progress. Z is always forward.
const WANDER: Array<{ p: number; x: number; y: number }> = [
  { p: 0.00, x: 0,   y: 3 },   // hero — centered
  { p: 0.10, x: 2,   y: 4 },
  { p: 0.14, x: -6,  y: 9 },   // exits top-left
  // [0.14 .. 0.20] invisible — teleport
  { p: 0.20, x: 14,  y: 6 },   // reappears from the right
  { p: 0.28, x: 7,   y: 5 },
  { p: 0.38, x: -4,  y: 7 },   // drifts left
  { p: 0.50, x: 5,   y: 6 },
  { p: 0.60, x: -7,  y: 8 },   // big left sweep
  { p: 0.72, x: 6,   y: 5 },
  { p: 0.84, x: -3,  y: 7 },
  { p: 1.00, x: 0,   y: 5 },   // centered finish
];

function sampleWander(p: number): { x: number; y: number } {
  if (p <= WANDER[0].p) return { x: WANDER[0].x, y: WANDER[0].y };
  if (p >= WANDER[WANDER.length - 1].p)
    return { x: WANDER[WANDER.length - 1].x, y: WANDER[WANDER.length - 1].y };
  for (let i = 0; i < WANDER.length - 1; i++) {
    const a = WANDER[i];
    const b = WANDER[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = (p - a.p) / (b.p - a.p);
      // Smoothstep
      const s = t * t * (3 - 2 * t);
      return { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s };
    }
  }
  return { x: 0, y: 3 };
}

const HIDE_FROM = 0.14;
const HIDE_TO = 0.20;

function Paraglider({
  mouseRef,
  progress,
  positionOutRef,
}: {
  mouseRef: React.MutableRefObject<Mouse>;
  progress: MotionValue<number>;
  positionOutRef: React.MutableRefObject<THREE.Vector3>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pilotOrbitRef = useRef<THREE.Group>(null);
  const linesGroupRef = useRef<THREE.Group>(null);
  const posRef = useRef(new THREE.Vector3(0, 3, 0));
  const prevPosRef = useRef(new THREE.Vector3(0, 3, 0));
  const bankRef = useRef(0);
  const pitchRef = useRef(0);
  const lastLoopToken = useRef(0);
  const loopStartClock = useRef(-Infinity);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);

    const m = mouseRef.current;
    const p = progress.get();
    const clockT = state.clock.elapsedTime;

    // During the hero the paraglider stays roughly in place (mouse offsets X/Y), while
    // the world group flows past behind it. After the hero, the scripted wander kicks in.
    const inHero = p < 0.10;

    let targetX: number;
    let targetY: number;

    if (inHero) {
      if (m.active) {
        targetX = m.x * 4.5;
        targetY = 0.6 + m.y * 1.4;
      } else {
        targetX = Math.sin(clockT * 0.45) * 1.4;
        targetY = 0.6 + Math.cos(clockT * 0.35) * 0.3;
      }
    } else {
      const scripted = sampleWander(p);
      const idleX = Math.sin(clockT * 0.5) * 0.7;
      const idleY = Math.cos(clockT * 0.4) * 0.3;
      targetX = scripted.x + idleX;
      targetY = scripted.y + idleY;
    }

    // Z stays fixed — decor flows past via WorldDecor group.
    let targetZ = 0;

    // Loop trigger: check if a new click happened (hero only).
    if (inHero && m.loopToken > lastLoopToken.current) {
      lastLoopToken.current = m.loopToken;
      loopStartClock.current = clockT;
    }

    // Compute loop animation contribution: paraglider pitch + pilot orbit around wing.
    const loopElapsed = clockT - loopStartClock.current;
    const looping = loopElapsed >= 0 && loopElapsed < LOOP_DURATION;
    let paraPitch = 0;
    let pilotAngle = 0;
    let loopZ = 0;
    let loopY = 0;
    if (looping) {
      const lp = loopElapsed / LOOP_DURATION;
      paraPitch = loopParaPitch(lp);
      pilotAngle = loopPilotAngle(lp);
      loopZ = loopForward(lp);
      loopY = loopRise(lp);
    }
    targetZ += loopZ;
    targetY += loopY;

    // During the hide window, teleport instantly (no lerp) so reappearance is clean.
    const hidden = p >= HIDE_FROM && p <= HIDE_TO;
    if (hidden) {
      posRef.current.set(targetX, targetY, targetZ);
    } else {
      const lerp = 1 - Math.pow(0.0015, dt);
      posRef.current.x += (targetX - posRef.current.x) * lerp;
      posRef.current.y += (targetY - posRef.current.y) * lerp;
      posRef.current.z += (targetZ - posRef.current.z) * Math.min(1, dt * 3);
    }

    groupRef.current.position.copy(posRef.current);
    groupRef.current.visible = !hidden;
    // Expose the live position to the parent (used by ChaseCamera and WorldFlow).
    positionOutRef.current.copy(posRef.current);

    // Bank from lateral velocity
    const dx = posRef.current.x - prevPosRef.current.x;
    const targetBank = THREE.MathUtils.clamp(dx * -8, -0.6, 0.6);
    bankRef.current += (targetBank - bankRef.current) * 0.08;
    groupRef.current.rotation.z = bankRef.current;

    // Pitch from vertical velocity (natural flight)
    const dy = posRef.current.y - prevPosRef.current.y;
    const targetPitch = THREE.MathUtils.clamp(dy * -4, -0.25, 0.25);
    pitchRef.current += (targetPitch - pitchRef.current) * 0.08;
    // During the loop, the canopy pitches up then dives (cabrage / piqué).
    groupRef.current.rotation.x = looping ? paraPitch : pitchRef.current;

    groupRef.current.rotation.y = -bankRef.current * 0.35;

    // Pilot has a small pendulum swing relative to the canopy during the loop.
    if (pilotOrbitRef.current) {
      pilotOrbitRef.current.rotation.x = pilotAngle;
    }

    prevPosRef.current.copy(posRef.current);
  });

  return (
    <group ref={groupRef}>
      {/* Flip the whole model 180° around Y so the pilot flies forward (back to camera). */}
      <group rotation={[0, Math.PI, 0]}>
        <Wing />
        {/* Pilot + lines pivot around the wing anchor (PIVOT_Y). */}
        <group position={[0, PIVOT_Y, 0]} ref={pilotOrbitRef}>
          <group position={[0, -PIVOT_Y, 0]}>
            <group ref={linesGroupRef}>
              <Lines />
            </group>
            <Harness />
          </group>
        </group>
      </group>
    </group>
  );
}

function ChaseCamera({
  groupTargetRef,
  progress,
}: {
  groupTargetRef: React.MutableRefObject<THREE.Vector3>;
  progress: MotionValue<number>;
}) {
  const tmp = useRef(new THREE.Vector3());
  const lookTmp = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3(0, 3, -10));
  useFrame((state) => {
    const t = groupTargetRef.current;
    const p = progress.get();
    // Hero (mini-game): camera tracks X closely → steering feels responsive.
    // Sections (cinematic): camera tracks X loosely so the paraglider can exit / reappear.
    const followMix = Math.min(1, Math.max(0, (p - 0.05) / 0.08));
    const followStrength = 0.85 - followMix * 0.55; // 0.85 → 0.30

    tmp.current.set(t.x * followStrength, t.y + 1.4, t.z + 5.8);
    state.camera.position.lerp(tmp.current, 0.1);

    lookTmp.current.set(t.x * followStrength * 0.8, t.y + 0.7, t.z - 4);
    currentLook.current.lerp(lookTmp.current, 0.12);
    state.camera.lookAt(currentLook.current);
  });
  return null;
}

function SkyGradient() {
  return (
    <mesh position={[0, 0, -180]} scale={[700, 400, 1]}>
      <planeGeometry />
      <shaderMaterial
        uniforms={{}}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            vec3 top = vec3(0.18, 0.38, 0.62);
            vec3 mid = vec3(0.85, 0.64, 0.42);
            vec3 bottom = vec3(0.96, 0.48, 0.28);
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

function Scene({
  mouseRef,
  progress,
}: {
  mouseRef: React.MutableRefObject<Mouse>;
  progress: MotionValue<number>;
}) {
  const pilotPosRef = useRef(new THREE.Vector3(0, 3, 0));
  const worldRef = useRef<THREE.Group>(null);

  return (
    <>
      <SkyGradient />
      <ambientLight intensity={0.55} />
      <directionalLight position={[10, 20, 10]} intensity={1.3} castShadow />
      <fog attach="fog" args={["#f0b787", 20, 170]} />
      <Stars radius={200} depth={50} count={2500} factor={4} fade />
      <Ground />
      <WorldDecor groupRef={worldRef} />
      <WorldFlow groupRef={worldRef} pilotPosRef={pilotPosRef} />
      <Paraglider mouseRef={mouseRef} progress={progress} positionOutRef={pilotPosRef} />
      <ChaseCamera groupTargetRef={pilotPosRef} progress={progress} />
    </>
  );
}

export default function DesignD() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const headingOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const mouseRef = useRef<Mouse>({ x: 0, y: 0, active: false, loopToken: 0 });

  const onMove = (e: React.PointerEvent) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    mouseRef.current.x = (e.clientX / w) * 2 - 1;
    mouseRef.current.y = -((e.clientY / h) * 2 - 1);
    mouseRef.current.active = true;
  };
  const onLeave = () => {
    mouseRef.current.active = false;
  };
  const onClick = () => {
    // Only trigger while in the hero — scripted mode handles its own flight.
    if (scrollYProgress.get() < 0.10) {
      mouseRef.current.loopToken += 1;
    }
  };

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen text-white"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 5, 12], fov: 55 }}>
          <Suspense fallback={null}>
            <Scene mouseRef={mouseRef} progress={scrollYProgress} />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10">
        <header className="fixed top-0 inset-x-0 z-30">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-sm sm:px-10">
            <Link href="/" className="font-display font-bold tracking-tight">
              {club.name}
            </Link>
            <span className="hidden text-xs uppercase tracking-[0.25em] text-white/70 sm:inline">
              🖱️ Pilote avec la souris · scrolle pour avancer
            </span>
            <a
              href="#contact"
              className="rounded-full border border-white/30 px-4 py-2 backdrop-blur hover:bg-white/10"
            >
              Adhérer
            </a>
          </nav>
        </header>

        <motion.section
          style={{ opacity: headingOpacity }}
          className="relative flex h-screen items-end px-6 pb-20 sm:px-10"
        >
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/80">
              Parallailement · Vallée d&apos;Aure
            </p>
            <h1 className="mt-4 font-display text-[16vw] font-bold leading-[0.95] tracking-tight sm:text-8xl">
              Le vol
              <br />
              commence
              <br />
              <span className="text-amber-300">ici.</span>
            </h1>
            <p className="mt-6 text-white/80 sm:hidden">
              👆 Balaye l&apos;écran pour piloter.
            </p>
          </div>
        </motion.section>

        <Section title="Le décollage" index="01">
          Un déco local, face à la vallée d&apos;Aure. Ouvert aux adhérents.
          L&apos;atterrissage est en cours de conventionnement — on en parle dès que
          c&apos;est signé.
        </Section>

        <Section title="Thermiques & grands vols" index="02">
          Dans les Pyrénées, le relief joue pour nous. On apprend, on vole ensemble,
          on partage les bons plans sur le groupe.
        </Section>

        <Section title={nextEvent.title} index="03">
          {nextEvent.description} · {nextEvent.date}.
        </Section>

        <Section title="On rejoint ?" index="04">
          Cotisation via HelloAsso, licence via la FFVL (n°{club.ffvl}). Le club est
          petit, on te guide pas à pas.
        </Section>

        <footer
          id="contact"
          className="relative border-t border-white/10 bg-[#0b1220]/85 py-14 backdrop-blur"
        >
          <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-3 sm:px-10">
            <div>
              <p className="font-display text-xl font-bold">{club.name}</p>
              <p className="mt-3 text-sm text-white/70">{club.address}</p>
              <p className="text-sm text-white/70">{club.phone}</p>
            </div>
            <div className="text-sm">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
                Pratique
              </p>
              <ul className="mt-3 space-y-1 text-white/70">
                {highlights.map((h) => (
                  <li key={h.title}>{h.title}</li>
                ))}
              </ul>
            </div>
            <div className="text-sm">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
                Voir aussi
              </p>
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
