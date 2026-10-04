'use client';

/**
 * 3D HERO — React Three Fiber scene.
 *
 *   back    glossy orange arrows (top-right / bottom-left, partly off-screen)
 *   middle  your photo, ringed by thin orbit lines
 *   orbit   tech-icon tiles (HTML, CSS, JS, Figma, React, Next) circling the photo,
 *           some passing behind you, some in front
 * The whole rig tilts toward the pointer (each layer by a different amount), and on
 * scroll the camera pushes forward while icons/arrows fly outward.
 */

import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  Float,
  Lightformer,
  PerformanceMonitor,
  RoundedBox,
  Sparkles,
  useTexture,
} from '@react-three/drei';
import { hero } from '@/data/content';
import { clamp, damp } from '@/lib/utils';
import { easeOutCubic, easeOutBack, type HeroState } from './heroState';

const FOV = 35;
const CAM_Z = 10;
const STAGE_Z = 1.4; // z of the plane everything is laid out on
const PHOTO_Z = STAGE_Z + 0.2;
const PHOTO_ASPECT = 1000 / 1312;

const frustum = (aspect: number, d: number) => {
  const h = 2 * Math.tan((FOV * Math.PI) / 360) * d;
  return { w: h * aspect, h };
};
const now = () => performance.now() / 1000;
function since(state: HeroState, delay: number, dur: number) {
  if (state.revealAt === null) return 0;
  return clamp((now() - state.revealAt - delay) / dur, 0, 1);
}

interface SceneProps {
  state: MutableRefObject<HeroState>;
  mobile: boolean;
  reduced: boolean;
  /** false once scrolled past the hero → render loop pauses */
  active: boolean;
  onReady: () => void;
}

/** Shared layout numbers (world units on the stage plane). Everything is centred. */
function useLayout(mobile: boolean) {
  const size = useThree((s) => s.size);
  const { w, h } = frustum(size.width / size.height, CAM_Z - STAGE_Z);
  const ph = mobile ? Math.min(h * 0.5, (w * 1.0) / PHOTO_ASPECT) : h * 0.82;
  const cx = 0;
  const photoY = -h / 2 + ph / 2 - h * 0.03; // photo stands on the bottom edge
  const orbY = mobile ? -h * 0.02 : h * 0.03;
  // orbit scale: on phones it follows the screen WIDTH so rings + tiles always stay on screen
  const rr = mobile ? Math.min(h * 0.3, w * 0.55) : ph; // the orb (used until a photo is set)
  return { w, h, ph, rr, pw: ph * PHOTO_ASPECT, cx, photoY, orbY, ringY: hero.photo ? photoY + ph * 0.07 : orbY };
}
type L = ReturnType<typeof useLayout>;

/* ─────────────────────────── photo ─────────────────────────── */

function Photo({ state, layout }: { state: MutableRefObject<HeroState>; layout: L }) {
  const tex = useTexture(hero.photo);
  const gl = useThree((s) => s.gl);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const rimMat = useRef<THREE.MeshBasicMaterial>(null);
  const g = useRef<THREE.Group>(null);

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    tex.needsUpdate = true;
  }, [tex, gl]);

  useFrame(() => {
    const st = state.current;
    const k = easeOutCubic(since(st, 0.45, 1.2));
    if (mat.current) mat.current.opacity = k;
    if (rimMat.current) rimMat.current.opacity = k * 0.9;
    if (g.current) {
      g.current.visible = k > 0;
      g.current.rotation.set(-st.py * 0.05, st.px * 0.14, 0);
      g.current.position.set(layout.cx + st.px * 0.3, layout.photoY + (1 - k) * -1.6 - st.scroll * 0.6, PHOTO_Z + st.scroll * 0.9);
    }
  });

  return (
    <group ref={g}>
      {/* warm rim light: slightly larger tinted copy directly behind the photo */}
      <mesh renderOrder={1} scale={1.035} position={[0, -0.01, -0.05]}>
        <planeGeometry args={[layout.pw, layout.ph]} />
        <meshBasicMaterial ref={rimMat} map={tex} color="#ff9a3c" transparent opacity={0} toneMapped={false} />
      </mesh>
      <mesh renderOrder={2}>
        <planeGeometry args={[layout.pw, layout.ph]} />
        <meshBasicMaterial ref={mat} map={tex} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────── orbit rings ─────────────────────────── */

const RING_R = [0.34, 0.5, 0.66]; // desktop orbit radii (× layout.rr)
const RING_R_MOBILE = [0.45, 0.62, 0.8];
const ORBIT_Y_MOBILE = 0.42; // even flatter on phones so tiles don't cover the headline
const ORBIT_Y = 0.46; // orbits are tilted ellipses (squashed vertically) so tiles stay clear of the text // × photo height

function Rings({ state, layout, reduced, mobile }: { state: MutableRefObject<HeroState>; layout: L; reduced: boolean; mobile: boolean }) {
  const radii = mobile ? RING_R_MOBILE : RING_R;
  const group = useRef<THREE.Group>(null);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const dots = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const st = state.current;
    const t = reduced ? 0 : now();
    if (group.current) {
      group.current.position.set(layout.cx + st.px * 0.18, layout.ringY - st.py * 0.1, STAGE_Z - 0.6 + st.scroll * 2);
      {
        const sc = 1 + st.scroll * 1.5;
        group.current.scale.set(sc, sc * (mobile ? ORBIT_Y_MOBILE : ORBIT_Y), sc);
      }
    }
    radii.forEach((r, i) => {
      const k = easeOutCubic(since(st, 0.7 + i * 0.18, 1.3));
      const g = refs.current[i];
      if (g) {
        g.scale.setScalar(Math.max(0.0001, k));
        g.visible = k > 0;
      }
      const d = dots.current[i];
      if (d) {
        const a = t * (0.18 - i * 0.04) * (i % 2 ? -1 : 1) + i * 2;
        d.position.set(Math.cos(a) * r * layout.rr, Math.sin(a) * r * layout.rr, 0);
      }
    });
  });

  return (
    <group ref={group}>
      {radii.map((r, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)}>
          <mesh>
            <torusGeometry args={[r * layout.rr, 0.012, 8, 160]} />
            <meshBasicMaterial color="#ffb070" transparent opacity={0.3 - i * 0.05} toneMapped={false} />
          </mesh>
          <mesh ref={(el) => void (dots.current[i] = el)}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color="#ff6a00" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─────────────────────────── tech icon tiles ─────────────────────────── */

type IconId = (typeof hero.techIcons)[number];

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function drawIcon(id: IconId): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d')!;
  x.fillStyle = '#171717';
  rr(x, 6, 6, 244, 244, 58);
  x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.16)';
  x.lineWidth = 5;
  x.stroke();
  x.textAlign = 'center';
  x.textBaseline = 'middle';

  const shield = (fill: string, label: string) => {
    x.fillStyle = fill;
    x.beginPath();
    x.moveTo(70, 56); x.lineTo(186, 56); x.lineTo(175, 188); x.lineTo(128, 204); x.lineTo(81, 188);
    x.closePath();
    x.fill();
    x.fillStyle = 'rgba(255,255,255,0.14)';
    x.beginPath();
    x.moveTo(128, 62); x.lineTo(180, 62); x.lineTo(170, 186); x.lineTo(128, 200);
    x.closePath();
    x.fill();
    x.fillStyle = '#fff';
    x.font = '700 96px Arial, sans-serif';
    x.fillText(label, 128, 128);
  };

  if (id === 'html') shield('#E44D26', '5');
  else if (id === 'css') shield('#1572B6', '3');
  else if (id === 'js') {
    x.fillStyle = '#F7DF1E';
    rr(x, 56, 56, 144, 144, 18);
    x.fill();
    x.fillStyle = '#111';
    x.font = '800 66px Arial, sans-serif';
    x.textAlign = 'right';
    x.textBaseline = 'alphabetic';
    x.fillText('JS', 190, 188);
  } else if (id === 'figma') {
    const cell = 44;
    const ox = 84;
    const oy = 46;
    x.fillStyle = '#F24E1E'; rr(x, ox, oy, cell, cell, [22, 0, 0, 22]); x.fill();
    x.fillStyle = '#FF7262'; rr(x, ox + cell, oy, cell, cell, [0, 22, 22, 0]); x.fill();
    x.fillStyle = '#A259FF'; rr(x, ox, oy + cell, cell, cell, [22, 0, 0, 22]); x.fill();
    x.fillStyle = '#1ABCFE'; x.beginPath(); x.arc(ox + cell * 1.5, oy + cell * 1.5, 22, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#0ACF83'; rr(x, ox, oy + cell * 2, cell, cell, [22, 0, 22, 22]); x.fill();
  } else if (id === 'react') {
    x.strokeStyle = '#61DAFB';
    x.lineWidth = 9;
    for (let i = 0; i < 3; i++) {
      x.save();
      x.translate(128, 128);
      x.rotate((i * Math.PI) / 3);
      x.beginPath();
      x.ellipse(0, 0, 70, 27, 0, 0, Math.PI * 2);
      x.stroke();
      x.restore();
    }
    x.fillStyle = '#61DAFB';
    x.beginPath(); x.arc(128, 128, 11, 0, Math.PI * 2); x.fill();
  } else {
    x.fillStyle = '#000';
    x.beginPath(); x.arc(128, 128, 76, 0, Math.PI * 2); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 6; x.stroke();
    x.fillStyle = '#fff';
    x.font = '700 92px Arial, sans-serif';
    x.fillText('N', 126, 132);
  }
  return c;
}

// which ring each icon rides, its start angle, speed and depth (z>0 = in front of the photo)
const ICON_LAYOUT = [
  { ring: 1, a0: 0.9, speed: 0.1, z: -0.5 },
  { ring: 2, a0: 2.4, speed: -0.07, z: 0.9 },
  { ring: 1, a0: 3.9, speed: 0.1, z: -0.7 },
  { ring: 2, a0: 5.0, speed: -0.07, z: 0.9 },
  { ring: 0, a0: 5.9, speed: 0.13, z: -0.4 },
  { ring: 2, a0: 3.7, speed: -0.07, z: 0.7 },
];

function TechIcon({
  id,
  index,
  state,
  layout,
  reduced,
  mobile,
}: {
  id: IconId;
  index: number;
  state: MutableRefObject<HeroState>;
  layout: L;
  reduced: boolean;
  mobile: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  const cfg = ICON_LAYOUT[index % ICON_LAYOUT.length];
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(drawIcon(id));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [id]);
  useEffect(() => () => tex.dispose(), [tex]);
  const s = mobile ? 0.46 : 0.72;

  useFrame(() => {
    const st = state.current;
    const grp = g.current;
    if (!grp) return;
    const t = reduced ? 0 : now();
    const a = cfg.a0 + t * cfg.speed;
    const r = (mobile ? RING_R_MOBILE : RING_R)[cfg.ring] * layout.rr;
    const k = reduced ? (st.revealAt === null ? 0 : 1) : easeOutBack(since(st, 1 + index * 0.13, 0.9));
    const fly = 1 + st.scroll * 2.2;
    grp.position.set(
      (layout.cx + Math.cos(a) * r) * fly + st.px * 0.5 * (cfg.z > 0 ? 1 : 0.6),
      (layout.ringY + Math.sin(a) * r * (mobile ? ORBIT_Y_MOBILE : ORBIT_Y)) * fly - st.py * 0.3,
      STAGE_Z + cfg.z + Math.sin(a * 1.3) * 0.25 + st.scroll * 5,
    );
    grp.rotation.set(Math.sin(a) * 0.35 - st.py * 0.2, Math.cos(a) * 0.5 + st.px * 0.3, Math.sin(a * 0.7) * 0.12);
    grp.scale.setScalar(Math.max(0.0001, k) * s);
  });

  return (
    <group ref={g}>
      <RoundedBox args={[1, 1, 0.24]} radius={0.22} smoothness={4}>
        <meshPhysicalMaterial color="#1b1b1b" roughness={0.3} clearcoat={1} clearcoatRoughness={0.15} />
      </RoundedBox>
      <mesh position={[0, 0, 0.126]}>
        <planeGeometry args={[0.98, 0.98]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.126]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.98, 0.98]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────── rig + scene ─────────────────────────── */

function Rig({ state, reduced, children }: { state: MutableRefObject<HeroState>; reduced: boolean; children: React.ReactNode }) {
  const tilt = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const st = state.current;
    if (tilt.current && !reduced) {
      tilt.current.rotation.y = damp(tilt.current.rotation.y, st.px * 0.12, 6, dt);
      tilt.current.rotation.x = damp(tilt.current.rotation.x, st.py * 0.08, 6, dt);
    }
    const s = reduced ? 0 : st.scroll;
    camera.position.z = CAM_Z - s * s * 7 - s * 1.5;
  });
  return <group ref={tilt}>{children}</group>;
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => (r2 = requestAnimationFrame(onReady)));
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [onReady]);
  return null;
}

function Scene({ state, mobile, reduced }: { state: MutableRefObject<HeroState>; mobile: boolean; reduced: boolean }) {
  const layout = useLayout(mobile);
  const icons = mobile ? hero.techIcons.slice(0, 4) : hero.techIcons;
  return (
    <>
      <Rings state={state} layout={layout} reduced={reduced} mobile={mobile} />
      {icons.map((id, i) => (
        <TechIcon key={id} id={id} index={i} state={state} layout={layout} reduced={reduced} mobile={mobile} />
      ))}
      {hero.photo && <Photo state={state} layout={layout} />}
      {!mobile && !reduced && (
        <Sparkles count={60} scale={[16, 8, 6]} size={5} speed={0.4} opacity={0.7} color="#ffb070" position={[0, 0, 1]} />
      )}
    </>
  );
}

export default function HeroScene({ state, mobile, reduced, active, onReady }: SceneProps) {
  const [quality, setQuality] = useState(mobile ? 0 : 1);
  return (
    <Canvas
      frameloop={reduced ? 'demand' : active ? 'always' : 'never'}
      dpr={quality ? [1, 1.6] : [1, 1.1]}
      camera={{ fov: FOV, near: 0.1, far: 60, position: [0, 0, CAM_Z] }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      {/* lower quality automatically on weak GPUs */}
      <PerformanceMonitor onDecline={() => setQuality(0)} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 6]} intensity={1.5} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.6} position={[0, 6, 4]} scale={[14, 4, 1]} />
        <Lightformer form="rect" intensity={2} position={[-7, 1, 2]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} color="#ffb070" />
        <Lightformer form="rect" intensity={1.6} position={[7, 0, 2]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} color="#ffffff" />
        <Lightformer form="ring" intensity={1.4} position={[0, 0, 8]} scale={6} color="#ff8a3c" />
      </Environment>
      <Suspense fallback={null}>
        <Rig state={state} reduced={reduced}>
          <Scene state={state} mobile={mobile} reduced={reduced} />
        </Rig>
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
