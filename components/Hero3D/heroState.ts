/**
 * Mutable state shared between the DOM (pointer + scroll handlers in Hero3D.tsx)
 * and the R3F scene (read every frame). A plain object, not React state, so
 * updating it never re-renders anything.
 */
export interface HeroState {
  /** Smoothed pointer position, -1..1 (x right, y down). */
  px: number;
  py: number;
  /** Scroll-exit progress through the hero, 0..1. */
  scroll: number;
  /** performance.now()/1000 at which the reveal started (negative = already revealed). null = not yet. */
  revealAt: number | null;
}

export const createHeroState = (): HeroState => ({ px: 0, py: 0, scroll: 0, revealAt: null });

export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
