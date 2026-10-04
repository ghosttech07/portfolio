export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent smoothing (like THREE.MathUtils.damp). */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
