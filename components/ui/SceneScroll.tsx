'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks';

/**
 * The hero's scroll feel, for every section.
 *
 * The content is tied (scrubbed) directly to the scroll position, so it moves exactly as fast as you scroll:
 *  • ENTER  – as the section's top rises into view, the content comes up from below, tilting from
 *             a slight 3D angle, growing from ~92% to 100% and fading in.
 *  • EXIT   – as the section's bottom leaves the top of the screen, the content keeps drifting up,
 *             pushes toward you (scale up) with a small tilt and fades back (like the hero's camera push).
 * In the middle, content is untouched (identity), so reading is never affected. Backgrounds stay put.
 * Two nested wrappers are used so enter and exit never fight over the same transform.
 *
 * Dialogs must not live inside this wrapper (a transformed ancestor breaks `position: fixed`);
 * they are rendered through <Portal /> instead.
 * Skipped entirely with prefers-reduced-motion.
 */
export default function SceneScroll({
  children,
  trigger,
  enter = true,
  exit = true,
  className = '',
}: {
  children: React.ReactNode;
  /** The section element whose position drives the animation. */
  trigger: React.RefObject<HTMLElement | null>;
  enter?: boolean;
  exit?: boolean;
  className?: string;
}) {
  const enterEl = useRef<HTMLDivElement>(null);
  const exitEl = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !trigger.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (enter && enterEl.current) {
        gsap.fromTo(
          enterEl.current,
          { y: 80, scale: 0.94, rotateX: 7, opacity: 0.15 },
          {
            y: 0,
            scale: 1,
            rotateX: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: trigger.current, start: 'top 100%', end: 'top 35%', scrub: 0.5 },
          },
        );
      }
      if (exit && exitEl.current) {
        gsap.fromTo(
          exitEl.current,
          { y: 0, scale: 1, rotateX: 0, opacity: 1 },
          {
            y: -140,
            scale: 1.07,
            rotateX: -6,
            opacity: 0.2,
            ease: 'none',
            scrollTrigger: { trigger: trigger.current, start: 'bottom 70%', end: 'bottom 0%', scrub: 0.5 },
          },
        );
      }
    });
    return () => ctx.revert();
  }, [reduced, trigger, enter, exit]);

  return (
    <div style={{ perspective: '1400px' }} className={className}>
      <div ref={enterEl} style={{ transformOrigin: '50% 0%', willChange: reduced ? undefined : 'transform, opacity' }}>
        <div ref={exitEl} style={{ transformOrigin: '50% 100%', willChange: reduced ? undefined : 'transform, opacity' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
