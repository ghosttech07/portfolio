import type Lenis from 'lenis';

/** Shared Lenis instance (set by <SmoothScroll />). Null when reduced-motion / SSR. */
export const lenisRef: { current: Lenis | null } = { current: null };

/** Live scroll velocity, read by the 3D ring to speed itself up while scrolling. */
export const scrollState = { velocity: 0, updatedAt: 0 };

// Reference-counted so the loader, intro and modal can each lock independently.
let locks = 0;

export function lockScroll() {
  locks++;
  document.documentElement.classList.add('is-locked');
  lenisRef.current?.stop();
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.documentElement.classList.remove('is-locked');
    lenisRef.current?.start();
  }
}

export function scrollToTarget(target: string | number) {
  if (lenisRef.current) lenisRef.current.scrollTo(target as string, { duration: 1.6 });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}

/** Coarse app phase, exposed as <html data-phase>. Lets plain CSS react (nav fade-in etc). */
export type Phase = 'loading' | 'intro' | 'ready';
export const setPhase = (p: Phase) => {
  document.documentElement.dataset.phase = p;
};
