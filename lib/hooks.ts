'use client';

import { useEffect, useState, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** SSR-safe matchMedia hook. Returns `fallback` until mounted. */
export function useMediaQuery(query: string, fallback = false) {
  const [matches, setMatches] = useState(fallback);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/** True when the user asked the OS to reduce motion. */
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/**
 * Scroll reveal: every `[data-rise]` element inside `root` starts hidden and rises
 * into place (staggered per batch) the first time it enters the viewport.
 * Skipped entirely with prefers-reduced-motion.
 */
export function useReveal(root: RefObject<HTMLElement | null>, selector = '[data-rise]') {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.set(selector, { opacity: 0, y: 60 });
      ScrollTrigger.batch(selector, {
        start: 'top 97%',
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12, overwrite: true }),
      });
    }, root);
    return () => ctx.revert();
  }, [reduced, root, selector]);
}
