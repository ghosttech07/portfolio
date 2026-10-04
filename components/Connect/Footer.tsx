'use client';

import { footerInfo, site, socials } from '@/data/content';
import { useRef } from 'react';
import { scrollToTarget } from '@/lib/scroll';
import SceneScroll from '@/components/ui/SceneScroll';

/** Flat, colourful geometric shapes (like the reference footer). Decorative. */
const SHAPES: { c: string; d: React.ReactNode }[] = [
  { c: '#FF9A3C', d: <circle cx="50" cy="50" r="42" /> },
  { c: '#FFF6EE', d: <path d="M8 60a42 42 0 0 1 84 0z" /> },
  { c: '#E8500A', d: <path d="M50 4l12 30 32 3-24 21 8 32-28-17-28 17 8-32L6 37l32-3z" /> },
  { c: '#FF6A00', d: <path d="M50 8a42 42 0 1 0 0 84 42 42 0 0 0 0-84zm0 26a16 16 0 1 1 0 32 16 16 0 0 1 0-32z" fillRule="evenodd" /> },
  { c: '#F4C6A8', d: <path d="M10 92V50a40 40 0 0 1 80 0v42z" /> },
  { c: '#FF9A3C', d: <path d="M50 6l44 80H6z" /> },
  { c: '#FFF6EE', d: <rect x="6" y="30" width="88" height="40" rx="20" /> },
  { c: '#E8500A', d: <path d="M50 50m-14 0a14 14 0 1 0 28 0a14 14 0 1 0-28 0M50 8c10 0 14 14 0 30 -14-16-10-30 0-30zm0 84c-10 0-14-14 0-30 14 16 10 30 0 30zM8 50c0-10 14-14 30 0-16 14-30 10-30 0zm84 0c0 10-14 14-30 0 16-14 30-10 30 0z" /> },
  { c: '#FF6A00', d: <path d="M8 8h84v84z" /> },
];

/** Dark footer: outlined name, social + contact columns, shapes row, © and back-to-top. */
export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const email = socials.find((s) => s.id === 'email')!;
  return (
    <footer ref={root} className="relative z-20 -mt-14 rounded-t-[2.5rem] bg-[#0b0b0b] px-5 pb-8 pt-14 text-white sm:px-10 sm:pt-20">
      <SceneScroll trigger={root} exit={false}>
      <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2">

        <div>
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">Social</h3>
          <ul className="space-y-2 text-sm">
            {socials
              .filter((s) => s.id !== 'email')
              .map((s) => (
                <li key={s.id}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-brand">
                    {s.label}
                  </a>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={email.href} className="transition-colors hover:text-brand">
                {email.handle}
              </a>
            </li>
            <li>{footerInfo.phone}</li>
            <li className="text-white/70">{footerInfo.address}</li>
          </ul>
        </div>
      </div>

      <div aria-hidden className="mx-auto mt-14 flex max-w-6xl items-center justify-between gap-2 sm:mt-20">
        {SHAPES.map((s, i) => (
          <svg key={i} viewBox="0 0 100 100" className="h-10 w-10 sm:h-20 sm:w-20" fill={s.c}>
            {s.d}
          </svg>
        ))}
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
        <p className="pl-0 sm:pl-2">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <button
          onClick={() => scrollToTarget(0)}
          aria-label="Back to top"
          className="group flex items-center gap-3 whitespace-nowrap rounded-full bg-brand py-1.5 pl-5 pr-1.5 text-[11px] font-bold uppercase tracking-widest text-white transition-transform hover:scale-105"
        >
          Back to top
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base text-ink transition-transform duration-300 group-hover:-translate-y-0.5">
            ↑
          </span>
        </button>
      </div>
      </SceneScroll>
    </footer>
  );
}
