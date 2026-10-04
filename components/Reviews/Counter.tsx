'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks';

/** Counts from 0 → `value` the first time it scrolls into view (static with reduced motion). */
export default function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const num = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = num.current!;
    if (reduced) {
      el.textContent = String(value);
      return;
    }
    const o = { v: 0 };
    const tween = gsap.to(o, {
      v: value,
      duration: 2.2,
      ease: 'power2.out',
      paused: true,
      onUpdate: () => (el.textContent = String(Math.round(o.v))),
    });
    const st = ScrollTrigger.create({ trigger: root.current, start: 'top 90%', once: true, onEnter: () => tween.play() });
    return () => {
      st.kill();
      tween.kill();
    };
  }, [value, reduced]);

  return (
    <div ref={root} className="border-t border-white/20 pt-4">
      <p className="font-chunk text-[clamp(2.2rem,6vw,4.5rem)] leading-none text-white">
        <span ref={num}>0</span>
        <span className="text-brand">{suffix}</span>
      </p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/65 sm:text-xs">{label}</p>
    </div>
  );
}
