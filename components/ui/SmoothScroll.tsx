'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenisRef, scrollState } from '@/lib/scroll';
import { useReducedMotion } from '@/lib/hooks';

/**
 * Sets up Lenis smooth scrolling and keeps GSAP ScrollTrigger in sync with it.
 * With prefers-reduced-motion we skip Lenis entirely and use native scrolling.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Re-measure all scroll animations whenever the page height changes (fonts, images, the hero
    // resizing on phones...). Without this, triggers keep stale positions and fire late.
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(document.body);
    const stopRefresh = () => {
      clearTimeout(t);
      ro.disconnect();
    };
    if (reduced) return stopRefresh;

    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.95, smoothWheel: true });
    lenisRef.current = lenis;
    // If a lock (loader/intro) was applied before Lenis existed, honour it.
    if (document.documentElement.classList.contains('is-locked')) lenis.stop();

    lenis.on('scroll', (e: { velocity: number }) => {
      scrollState.velocity = e.velocity;
      scrollState.updatedAt = performance.now();
      ScrollTrigger.update();
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      stopRefresh();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return <>{children}</>;
}
