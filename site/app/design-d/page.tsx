"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Line } from "@react-three/drei";
import * as THREE from "three";
import { club } from "@/lib/content";

type Mouse = {
  x: number;
  y: number;
  active: boolean;
  /** incremented on each click to trigger a loop animation */
  loopToken: number;
};

const LOOP_DURATION = 1.8; // seconds
const PIVOT_Y = 2.5; // vertical offset (local Y) where the pilot group orbits — near the wing anchor.

const smoothstep = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

/** Rotation of the whole canopy+pilot during the loop (radians, around X axis). */
function loopParaPitch(lp: number) {
  if (lp < 0.16) return 0.45 * smoothstep(lp / 0.16);
  if (lp < 0.28) {
    const t = (lp - 0.16) / 0.12;
    return 0.45 - 0.8 * smoothstep(t);
  }
  if (lp < 0.92) {
    const t = (lp - 0.28) / 0.64;
    return -0.35 - Math.PI * 2 * smoothstep(t);
  }
  const t = (lp - 0.92) / 0.08;
  return -Math.PI * 2 - 0.35 * (1 - smoothstep(t));
}

function loopPilotAngle(lp: number) {
  if (lp < 0.28) return 0;
  if (lp < 0.92) {
    const t = (lp - 0.28) / 0.64;
    return Math.sin(t * Math.PI) * 0.35;
  }
  return 0;
}

function loopForward(lp: number) {
  return -Math.sin(lp * Math.PI) * 2.8;
}

function loopRise(lp: number) {
  return Math.sin(lp * Math.PI) * 0.6;
}

const WORLD_CYCLE = 260;
const WORLD_SPEED = 8;

function makePeak(id: string, x: number, y: number, z: number, h: number, color: string) {
  return (
    <mesh key={id} position={[x, y, z]} castShadow>
      <coneGeometry args={[h * 0.55, h, 4]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

function mountainLayer(seedSalt: number) {
  let s = 13 + seedSalt;
  const rng = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const peaks: React.ReactElement[] = [];

  for (let i = 0; i < 16; i++) {
    const side = rng() > 0.5 ? 1 : -1;
    const x = side * (3.5 + rng() * 6.5);
    const z = -rng() * WORLD_CYCLE;
    const h = 4 + rng() * 8;
    const color = new THREE.Color()
      .setHSL(0.58 + rng() * 0.05, 0.22, 0.22 + rng() * 0.22)
      .getStyle();
    peaks.push(makePeak(`nc${seedSalt}-${i}`, x, h / 2 - 8, z, h, color));
  }

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
  const layerB = mountainLayer(0);
  return (
    <group ref={groupRef}>
      <group>{layerA}</group>
      <group position={[0, 0, -WORLD_CYCLE]}>{layerB}</group>
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

    zOffset.current += dt * WORLD_SPEED;
    groupRef.current.position.z = zOffset.current % WORLD_CYCLE;

    const pgX = pilotPosRef.current.x;
    xDrift.current += pgX * dt * 0.25;
    const wrap = WORLD_CYCLE;
    if (xDrift.current > wrap) xDrift.current -= wrap * 2;
    if (xDrift.current < -wrap) xDrift.current += wrap * 2;
    groupRef.current.position.x = xDrift.current;

    const targetYaw = THREE.MathUtils.clamp(pgX * 0.02, -0.12, 0.12);
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

const WING_SPAN = 4.8;
const WING_CHORD = 1.1;
const WING_CELLS = 26;
const WING_THICKNESS = 0.28;
const WING_ARCH = 1.4;
const WING_BASE_Y = 1.75;

function wingPoint(tc: number) {
  const norm = Math.abs(tc * 2);
  const squish = norm * 0.95;
  const arcShape = Math.sqrt(Math.max(0, 1 - squish * squish));
  const y = WING_BASE_Y + WING_ARCH * arcShape;
  const z = -Math.pow(norm, 2) * 0.18;
  return { y, z };
}

function wingRoll(tc: number) {
  const norm = tc * 2;
  return Math.sign(norm) * Math.pow(Math.abs(norm), 1.5) * 0.5;
}

function Wing() {
  const cells: React.ReactElement[] = [];
  const trailing: React.ReactElement[] = [];

  for (let i = 0; i < WING_CELLS; i++) {
    const t = i / (WING_CELLS - 1);
    const tc = t - 0.5;
    const x = tc * WING_SPAN;
    const { y, z } = wingPoint(tc);

    const roll = wingRoll(tc);

    const abs = Math.abs(tc);
    const color = abs > 0.42 ? "#dc2626" : abs > 0.26 ? "#f59e0b" : "#fbbf24";

    const cellW = (WING_SPAN / WING_CELLS) * 1.1;

    cells.push(
      <mesh key={"c" + i} position={[x, y, z]} rotation={[0, 0, roll]}>
        <boxGeometry args={[cellW, WING_THICKNESS, WING_CHORD]} />
        <meshStandardMaterial color={color} flatShading roughness={0.55} />
      </mesh>,
    );

    trailing.push(
      <mesh
        key={"t" + i}
        position={[x, y - 0.08, z - WING_CHORD / 2 + 0.03]}
        rotation={[0, 0, roll]}
      >
        <boxGeometry args={[cellW, 0.08, 0.08]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>,
    );
  }

  return (
    <group>
      {cells}
      {trailing}
    </group>
  );
}

function Harness() {
  return (
    <group scale={0.7}>
      <mesh rotation={[-0.15, 0, 0]}>
        <capsuleGeometry args={[0.26, 0.75, 6, 12]} />
        <meshStandardMaterial color="#1e293b" flatShading />
      </mesh>
      <mesh position={[0, -0.15, 0.48]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[0.3, 0.25, 0.65]} />
        <meshStandardMaterial color="#0f172a" flatShading />
      </mesh>
      <mesh position={[0, -0.34, 0.85]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.35, 6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0.18, -0.2]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[0.32, 0.4, 0.1]} />
        <meshStandardMaterial color="#0f172a" flatShading />
      </mesh>
      <mesh position={[0, 0.46, -0.04]}>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.35} />
      </mesh>
    </group>
  );
}

function Lines() {
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

function Paraglider({
  mouseRef,
  positionOutRef,
  isMobile,
}: {
  mouseRef: React.MutableRefObject<Mouse>;
  positionOutRef: React.MutableRefObject<THREE.Vector3>;
  isMobile: boolean;
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
    const clockT = state.clock.elapsedTime;

    const baseY = isMobile ? 2.2 : 0.6;

    let targetX: number;
    let targetY: number;
    if (m.active) {
      targetX = m.x * 4.5;
      targetY = baseY + m.y * 1.4;
    } else {
      targetX = Math.sin(clockT * 0.45) * 1.4;
      targetY = baseY + Math.cos(clockT * 0.35) * 0.3;
    }

    let targetZ = 0;

    if (m.loopToken > lastLoopToken.current) {
      lastLoopToken.current = m.loopToken;
      loopStartClock.current = clockT;
    }

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

    const lerp = 1 - Math.pow(0.0015, dt);
    posRef.current.x += (targetX - posRef.current.x) * lerp;
    posRef.current.y += (targetY - posRef.current.y) * lerp;
    posRef.current.z += (targetZ - posRef.current.z) * Math.min(1, dt * 3);

    groupRef.current.position.copy(posRef.current);
    positionOutRef.current.copy(posRef.current);

    const dx = posRef.current.x - prevPosRef.current.x;
    const targetBank = THREE.MathUtils.clamp(dx * -8, -0.6, 0.6);
    bankRef.current += (targetBank - bankRef.current) * 0.08;
    groupRef.current.rotation.z = bankRef.current;

    const dy = posRef.current.y - prevPosRef.current.y;
    const targetPitch = THREE.MathUtils.clamp(dy * 4, -0.25, 0.25);
    pitchRef.current += (targetPitch - pitchRef.current) * 0.08;
    groupRef.current.rotation.x = looping ? paraPitch : pitchRef.current;

    groupRef.current.rotation.y = -bankRef.current * 0.35;

    if (pilotOrbitRef.current) {
      pilotOrbitRef.current.rotation.x = pilotAngle;
    }

    prevPosRef.current.copy(posRef.current);
  });

  return (
    <group ref={groupRef}>
      <group rotation={[0, Math.PI, 0]}>
        <Wing />
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
  isMobile,
}: {
  groupTargetRef: React.MutableRefObject<THREE.Vector3>;
  isMobile: boolean;
}) {
  const tmp = useRef(new THREE.Vector3());
  const lookTmp = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3(0, 3, -10));
  useFrame((state) => {
    const t = groupTargetRef.current;
    const followStrength = 0.85;

    const camZOffset = isMobile ? 9.5 : 5.8;
    const camYOffset = isMobile ? 1.9 : 1.4;

    tmp.current.set(t.x * followStrength, t.y + camYOffset, t.z + camZOffset);
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
  isMobile,
}: {
  mouseRef: React.MutableRefObject<Mouse>;
  isMobile: boolean;
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
      <Paraglider
        mouseRef={mouseRef}
        positionOutRef={pilotPosRef}
        isMobile={isMobile}
      />
      <ChaseCamera groupTargetRef={pilotPosRef} isMobile={isMobile} />
    </>
  );
}

export default function DesignDHero() {
  const mouseRef = useRef<Mouse>({ x: 0, y: 0, active: false, loopToken: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    mouseRef.current.loopToken += 1;
  };

  return (
    <section
      className="relative h-screen w-full overflow-hidden text-white"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
    >
      <div className="absolute inset-0">
        <Canvas shadows camera={{ position: [0, 5, 12], fov: 55 }}>
          <Suspense fallback={null}>
            <Scene mouseRef={mouseRef} isMobile={isMobile} />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none relative z-10 flex h-full items-end px-6 pb-20 sm:px-10">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">
            {club.name} · Vallée d&apos;Aure
          </p>
          <h1 className="mt-4 font-display text-[16vw] font-bold leading-[0.95] tracking-tight sm:text-8xl">
            Le vol
            <br />
            commence
            <br />
            <span className="text-amber-300">ici.</span>
          </h1>
          <p className="mt-6 text-white/80">
            <span className="hidden sm:inline">
              🖱️ Pilote avec la souris · clique pour un looping.
            </span>
            <span className="sm:hidden">👆 Balaye l&apos;écran pour piloter.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
