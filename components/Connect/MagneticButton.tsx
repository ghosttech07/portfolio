'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Social } from '@/data/content';
import { useReducedMotion } from '@/lib/hooks';

const ICONS: Record<Social['id'], React.ReactNode> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </>
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  github: (
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </>
  ),
  email: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  whatsapp: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
};

/**
 * Round link button that is pulled toward the cursor and tilts in 3D
 * (perspective parent + rotateX/Y). Hover reveals a tooltip with the handle.
 */
export default function MagneticButton({ social }: { social: Social }) {
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !window.matchMedia('(hover: hover)').matches) return;
    const el = btn.current!;
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const r = wrap.current!.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < r.width * 1.1; // magnetic radius
      x(near ? dx * 0.35 : 0);
      y(near ? dy * 0.35 : 0);
      ry(near ? (dx / r.width) * 30 : 0);
      rx(near ? (-dy / r.height) * 30 : 0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  return (
    <div ref={wrap} className="group relative" style={{ perspective: '600px' }}>
      <a
        ref={btn}
        href={social.href}
        target={social.id === 'email' ? undefined : '_blank'}
        rel="noopener noreferrer"
        aria-label={`${social.label}: ${social.handle}`}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-[0_16px_28px_-10px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:bg-brand sm:h-20 sm:w-20"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 fill-none stroke-current sm:h-8 sm:w-8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: 'translateZ(26px)' }}
          aria-hidden
        >
          {ICONS[social.id]}
        </svg>
      </a>
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-full bg-brand px-4 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
      >
        {social.handle}
      </span>
    </div>
  );
}
