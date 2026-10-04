'use client';

/**
 * The boy as an interactive 3D "standee" (React Three Fiber).
 *
 *  • orange disc  ── behind, moves opposite to the boy (parallax)
 *  • boy layers   ── a front face + a stack of dark copies behind it = visible thickness
 *  • idle         ── breathing, gentle sway, and a small hop every few seconds (no cursor needed)
 *  • cursor       ── the whole figure turns toward the pointer; hovering pops him forward and wobbles
 *  • click / tap  ── crouch, jump, full spin and a squashy landing
 *
 * World units: the box is 1 wide × 1.3 tall (same as the static CSS version), the orange
 * disc is the bottom 1×1 square. The camera is set so the canvas (24% bigger than the box)
 * leaves room for the head, the jump and the sparkles.
 */

import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { damp } from '@/lib/utils';

export interface PortraitControl {
  /** pointer relative to the figure, roughly -1..1 (x right, y down) */
  px: number;
  py: number;
  hover: boolean;
  /** performance.now()/1000 of the last click (0 = never) */
  clickAt: number;
}

const BOX_H = 1.3;
const LAYERS = 22;
const LAYER_STEP = 0.0065; // 22 × 0.0065 ≈ 0.14 units of thickness

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Draw the boy into a canvas and clip it: free above the disc's equator, clipped to the disc below. */
function buildBoyTexture(img: HTMLImageElement) {
  const W = 1000;
  const H = 1300;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const w = (img.naturalWidth / img.naturalHeight) * H;
  x.drawImage(img, (W - w) / 2, 0, w, H);
  x.globalCompositeOperation = 'destination-in';
  x.beginPath();
  x.moveTo(0, 0);
  x.lineTo(W, 0);
  x.lineTo(W, H * 0.6154);
  x.arc(W / 2, H * 0.6154, W / 2, 0, Math.PI);
  x.closePath();
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function buildDiscTexture() {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, '#E8500A');
  g.addColorStop(0.5, '#FF6A00');
  g.addColorStop(1, '#FF9A3C');
  x.fillStyle = g;
  x.beginPath();
  x.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  x.fill();
  // soft highlight
  const r = x.createRadialGradient(S * 0.35, S * 0.3, 10, S * 0.35, S * 0.3, S * 0.6);
  r.addColorStop(0, 'rgba(255,255,255,0.28)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = r;
  x.beginPath();
  x.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Figure({ src, ctl, reduced, onReady }: { src: string; ctl: MutableRefObject<PortraitControl>; reduced: boolean; onReady: () => void }) {
  const root = useRef<THREE.Group>(null);
  const boy = useRef<THREE.Group>(null);
  const disc = useRef<THREE.Mesh>(null);
  const state = useRef({ tx: 0, ty: 0, hover: 0, nextHop: 3, hop: 0, hopSpin: false, lastClick: 0 });
  const faceMat = useRef<THREE.MeshBasicMaterial>(null);

  const discTex = useMemo(buildDiscTexture, []);
  const ready = useRef<THREE.CanvasTexture | null>(null);
  // load + compose the boy texture once
  const loaded = useRef(false);
  useEffect(() => {
    let dead = false;
    const img = new Image();
    img.onload = () => {
      if (dead) return;
      ready.current = buildBoyTexture(img);
      loaded.current = true;
      onReady();
    };
    img.src = src;
    return () => {
      dead = true;
      ready.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const layerRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;
    const s = state.current;
    const c = ctl.current;

    // hand the composed texture to the materials as soon as it exists
    if (ready.current && faceMat.current && faceMat.current.map !== ready.current) {
      faceMat.current.map = ready.current;
      faceMat.current.needsUpdate = true;
      layerRefs.current.forEach((m) => {
        if (m) {
          m.map = ready.current;
          m.needsUpdate = true;
        }
      });
    }
    if (!root.current || !boy.current || !disc.current) return;
    if (reduced) return; // static pose

    // --- pointer: turn toward the cursor, pop forward when hovered ---
    s.tx = damp(s.tx, c.px, 5, dt);
    s.ty = damp(s.ty, c.py, 5, dt);
    s.hover = damp(s.hover, c.hover ? 1 : 0, 7, dt);
    root.current.rotation.y = s.tx * 0.38;
    root.current.rotation.x = s.ty * 0.22;

    // --- idle: breathe, sway, bob ---
    const breathe = Math.sin(t * 1.6);
    let y = Math.sin(t * 1.3) * 0.012;
    let sx = 1 + breathe * 0.004;
    let sy = 1 + breathe * 0.008;
    let rotY = 0;
    let rotZ = Math.sin(t * 0.8) * 0.018 + Math.sin(t * 11) * 0.03 * s.hover; // wobble on hover

    // --- actions: click = full jump + spin, automatic small hop every few seconds ---
    if (c.clickAt && c.clickAt !== s.lastClick) {
      s.lastClick = c.clickAt;
      s.hop = t;
      s.hopSpin = true;
    } else if (t > s.nextHop && !c.hover) {
      s.hop = t;
      s.hopSpin = false;
      s.nextHop = t + 6 + Math.random() * 3;
    }
    if (s.hop) {
      const dur = s.hopSpin ? 1.15 : 0.7;
      const k = (t - s.hop) / dur;
      if (k >= 0 && k <= 1) {
        const air = s.hopSpin ? 0.2 : 0.09;
        // crouch (0–0.15) → launch → land with a bounce
        if (k < 0.15) {
          const q = k / 0.15;
          sy *= 1 - 0.07 * q;
          sx *= 1 + 0.05 * q;
        } else {
          const a = (k - 0.15) / 0.85;
          y += air * Math.sin(Math.PI * a); // up and back down
          sy *= 1 + 0.05 * Math.sin(Math.PI * a); // stretch in the air
          if (a > 0.85) {
            // squash on landing
            const q = (a - 0.85) / 0.15;
            sy *= 1 - 0.06 * Math.sin(Math.PI * q);
            sx *= 1 + 0.05 * Math.sin(Math.PI * q);
          }
          if (s.hopSpin) rotY = easeInOut(Math.min(1, a * 1.1)) * Math.PI * 2;
        }
      } else if (k > 1) s.hop = 0;
    }

    boy.current.position.set(s.tx * 0.03, y, 0.16 + s.hover * 0.22);
    boy.current.rotation.set(0, rotY, rotZ);
    boy.current.scale.set(sx * (1 + s.hover * 0.04), sy * (1 + s.hover * 0.04), 1);
    // parallax: disc drifts the other way, a little behind
    disc.current.position.set(-s.tx * 0.04, -0.15 - s.ty * 0.015, -0.02);
  });

  return (
    <group ref={root}>
      {/* orange disc: bottom 1×1 of the 1×1.3 box */}
      <mesh ref={disc} position={[0, -0.15, -0.02]}>
        <circleGeometry args={[0.5, 96]} />
        <meshBasicMaterial map={discTex} toneMapped={false} />
      </mesh>

      <group ref={boy} position={[0, 0, 0.16]}>
        {/* thickness: darker copies stacked behind the face */}
        {Array.from({ length: LAYERS }).map((_, i) => (
          <mesh key={i} position={[0, 0, -LAYER_STEP * (i + 1)]}>
            <planeGeometry args={[1, BOX_H]} />
            <meshBasicMaterial
              ref={(m) => void (layerRefs.current[i] = m)}
              color={i === LAYERS - 1 ? '#4a2208' : '#8a4413'}
              transparent
              alphaTest={0.05}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        <mesh>
          <planeGeometry args={[1, BOX_H]} />
          <meshBasicMaterial ref={faceMat} transparent alphaTest={0.05} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {!reduced && (
        <Sparkles count={26} scale={[1.5, 1.9, 0.6]} size={4} speed={0.5} opacity={0.85} color="#ffd9b0" position={[0, 0, 0.5]} />
      )}
    </group>
  );
}

export default function PortraitScene({
  src,
  ctl,
  reduced,
  active,
  onReady,
}: {
  src: string;
  ctl: MutableRefObject<PortraitControl>;
  reduced: boolean;
  active: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? (reduced ? 'demand' : 'always') : 'never'}
      dpr={[1, 1.75]}
      camera={{ fov: 30, position: [0, 0, 3], near: 0.1, far: 20 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Figure src={src} ctl={ctl} reduced={reduced} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
