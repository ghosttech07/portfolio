'use client';

import { useEffect, useRef } from 'react';
import { lerp } from '@/lib/utils';

/**
 * Custom cursor: a small dot that sticks to the pointer + a ring that trails
 * behind and grows over anything clickable.
 *
 * Other code can force the "grow" state (e.g. the 3D cards, which aren't DOM
 * nodes) by setting `document.body.dataset.cursor = 'view'` and clearing it
 * afterwards. Only active on devices with a fine pointer + hover.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const root = document.documentElement;
    root.classList.add('has-cursor');

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let scale = 1;
    let hoverEl = false;
    let raf = 0;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!shown) {
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        shown = true;
        dot.current!.style.opacity = '1';
        ring.current!.style.opacity = '1';
      }
      const t = e.target as HTMLElement | null;
      hoverEl = !!t?.closest('a, button, select, label, input, textarea, [data-cursor]');
    };
    const onLeave = () => {
      shown = false;
      dot.current!.style.opacity = '0';
      ring.current!.style.opacity = '0';
    };

    const loop = () => {
      const forced = document.body.dataset.cursor; // set by 3D cards
      const grow = hoverEl || !!forced;
      const target = forced ? 2.6 : grow ? 1.9 : 1;
      scale = lerp(scale, target, 0.18);
      ringPos.x = lerp(ringPos.x, pos.x, 0.17);
      ringPos.y = lerp(ringPos.y, pos.y, 0.17);
      dot.current!.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) translate(-50%,-50%) scale(${grow ? 0.4 : 1})`;
      ring.current!.dataset.on = grow ? '1' : '0';
      ring.current!.style.transform = `translate3d(${ringPos.x}px,${ringPos.y}px,0) translate(-50%,-50%) scale(${scale})`;
      if (label.current) label.current.style.opacity = forced ? '1' : '0';
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] h-2 w-2 rounded-full bg-white opacity-0 mix-blend-difference transition-opacity duration-300"
      />
      <div
        ref={ring}
        aria-hidden
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[299] flex h-10 w-10 items-center justify-center rounded-full border border-white/80 opacity-0 transition-[opacity,background-color,border-color] duration-300"
      >
        <span
          ref={label}
          className="text-[6px] font-bold uppercase tracking-widest text-white opacity-0 transition-opacity"
        >
          View
        </span>
      </div>
    </>
  );
}
