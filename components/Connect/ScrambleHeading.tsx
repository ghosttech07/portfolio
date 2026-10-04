'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/lib/hooks';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*+?/';

/**
 * Huge chunky heading. Hovering (or first scrolling into view) scrambles every
 * letter through random glyphs before settling. Characters are updated straight
 * in the DOM so it never re-renders React.
 */
export default function ScrambleHeading({ lines, className = '' }: { lines: string[]; className?: string }) {
  const root = useRef<HTMLHeadingElement>(null);
  const raf = useRef(0);
  const reduced = useReducedMotion();

  const run = () => {
    if (reduced) return;
    cancelAnimationFrame(raf.current);
    const spans = Array.from(root.current!.querySelectorAll<HTMLElement>('[data-ch]'));
    const start = performance.now();
    const step = (t: number) => {
      let done = true;
      spans.forEach((el, i) => {
        const orig = el.dataset.ch!;
        if (orig === ' ' || orig === "'") return;
        const local = (t - start - i * 28) / 520;
        if (local < 1) {
          done = false;
          el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        } else el.textContent = orig;
      });
      if (!done) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  // scramble once when it scrolls into view
  useEffect(() => {
    const el = root.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <h2 ref={root} onPointerEnter={run} data-cursor aria-label={lines.join(' ')} className={`cursor-default select-none ${className}`}>
      {lines.map((line, li) => (
        <span key={li} aria-hidden className="block">
          {[...line].map((ch, i) => (
            <span key={i} data-ch={ch} className="inline-block whitespace-pre">
              {ch}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}
