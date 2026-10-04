'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useInView } from 'framer-motion';
import { about } from '@/data/content';
import { useReducedMotion } from '@/lib/hooks';
import type { PortraitControl } from './PortraitScene';

// three.js is only downloaded once the portrait is near the viewport.
const Scene = dynamic(() => import('./PortraitScene'), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The boy in his orange circle.
 *
 * Interactive 3D (see PortraitScene.tsx): he turns toward the cursor, wobbles and pops forward
 * on hover, and jumps + spins when clicked / tapped (or Enter / Space). He also breathes, sways
 * and hops on his own every few seconds, so he moves even without a cursor.
 *
 * Until the 3D scene is ready — and always for reduced motion or browsers without WebGL —
 * a static CSS version of the same picture is shown.
 */
export default function Portrait() {
  const box = useRef<HTMLDivElement>(null);
  const ctl = useRef<PortraitControl>({ px: 0, py: 0, hover: false, clickAt: 0 });
  const near = useInView(box, { margin: '300px' });
  const visible = useInView(box, { margin: '0px' });
  const reduced = useReducedMotion();
  const [webgl, setWebgl] = useState(false);
  const [everNear, setEverNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => setWebgl(hasWebGL()), []);
  useEffect(() => {
    if (near) setEverNear(true);
  }, [near]);

  // the figure looks toward the cursor wherever it is on the page (gently), strongest over him
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const r = box.current?.getBoundingClientRect();
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.45);
      const dy = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.45);
      ctl.current.px = Math.max(-1, Math.min(1, dx));
      ctl.current.py = Math.max(-1, Math.min(1, dy));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  const poke = () => {
    ctl.current.clickAt = performance.now() / 1000;
    setTouched(true);
  };

  const use3D = webgl && !reduced && everNear;

  return (
    <div className="relative mx-auto w-[min(78vw,440px)]" style={{ aspectRatio: '1 / 1.3' }}>
      {/* interaction surface (the 3D canvas itself doesn't take pointer events) */}
      <div
        ref={box}
        role="button"
        tabIndex={0}
        aria-label="Interactive portrait. Press to make him jump."
        onPointerEnter={() => {
          ctl.current.hover = true;
        }}
        onPointerLeave={() => {
          ctl.current.hover = false;
        }}
        onClick={poke}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            poke();
          }
        }}
        data-cursor
        className="absolute inset-0 z-10 cursor-pointer rounded-[3rem] outline-none focus-visible:ring-2 focus-visible:ring-brand"
      />

      {/* static version (fallback + shown while the 3D scene loads) */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${use3D && ready ? 'opacity-0' : 'opacity-100'}`}>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 aspect-square rounded-full bg-gradient-to-br from-deep via-brand to-light shadow-[0_40px_100px_-30px_rgba(255,106,0,0.7)]"
        />
        <svg width="0" height="0" aria-hidden className="absolute">
          <defs>
            {/* keep everything above the circle's equator, clip the rest to the circle */}
            <clipPath id="boy-clip" clipPathUnits="objectBoundingBox">
              <path d="M0,0 L1,0 L1,0.6154 A0.5,0.3846 0 0 1 0,0.6154 Z" />
            </clipPath>
          </defs>
        </svg>
        <div className="absolute inset-0 flex justify-center" style={{ clipPath: 'url(#boy-clip)' }}>
          <Image
            src={about.portrait.src}
            alt={about.portrait.alt}
            width={about.portrait.width}
            height={about.portrait.height}
            sizes="(max-width: 1024px) 78vw, 440px"
            priority
            className="h-full w-auto object-contain"
          />
        </div>
      </div>

      {/* 3D scene: canvas is 24% larger than the box so jumps, head and sparkles have room */}
      {use3D && (
        <div aria-hidden className="pointer-events-none absolute -inset-[12%] z-[5]" style={{ opacity: ready ? 1 : 0 }}>
          <Scene src={about.portrait.src} ctl={ctl} reduced={reduced} active={visible} onReady={() => setReady(true)} />
        </div>
      )}

      {/* discoverability hint, disappears after the first poke */}
      {!reduced && (
        <p
          aria-hidden
          className={`pointer-events-none absolute -bottom-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-ink shadow-lg transition-opacity duration-500 ${
            touched ? 'opacity-0' : 'opacity-100'
          }`}
        >
          Hover or tap me 👋
        </p>
      )}
    </div>
  );
}
