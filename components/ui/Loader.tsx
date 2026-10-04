'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { site } from '@/data/content';
import { useReducedMotion } from '@/lib/hooks';

/**
 * Full-screen loading screen with a 0–100% counter.
 * Progress eases to ~90% while fonts + the window load event settle, then
 * finishes and fades out. `onComplete` fires as the fade begins so the intro
 * can start underneath (the shutter is the same near-black, so it feels seamless).
 */
export default function Loader({ onComplete }: { onComplete: () => void }) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const done = useRef(onComplete);
  done.current = onComplete;

  useEffect(() => {
    const state = { v: 0 };
    const render = () => {
      setPct(Math.round(state.v));
      if (bar.current) bar.current.style.transform = `scaleX(${state.v / 100})`;
    };

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true })),
    ]);

    const tl = gsap.timeline();
    // Phase 1: climb to 90% (minimum on-screen time so it never just flashes).
    tl.to(state, { v: 90, duration: reduced ? 0.4 : 1.6, ease: 'power2.out', onUpdate: render });
    // Phase 2: wait for real readiness, then finish + exit.
    let cancelled = false;
    ready.then(() => {
      if (cancelled) return;
      tl.to(state, { v: 100, duration: reduced ? 0.15 : 0.5, ease: 'power1.inOut', onUpdate: render })
        .add(() => done.current())
        .to(root.current, { opacity: 0, duration: reduced ? 0.2 : 0.7, ease: 'power2.inOut', delay: 0.15 })
        .add(() => setGone(true));
    });

    return () => {
      cancelled = true;
      tl.kill();
    };
  }, [reduced]);

  if (gone) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-label={`Loading ${pct}%`}
      className="fixed inset-0 z-[150] flex flex-col justify-between bg-[#0d0d0d] p-6 sm:p-10"
    >
      <div className="flex items-center justify-between font-display text-xs uppercase tracking-[0.3em] text-fg/50">
        <span>{site.name}</span>
        <span>Portfolio {new Date().getFullYear()}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className="font-display text-[clamp(6rem,26vw,20rem)] font-bold leading-[0.8] tracking-tighter tabular-nums text-fg">
          {pct}
          <span className="text-accent">%</span>
        </div>
        <p className="hidden max-w-[16ch] pb-3 text-right text-sm text-fg/50 sm:block">Preparing the experience…</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-fg/10">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
    </div>
  );
}
