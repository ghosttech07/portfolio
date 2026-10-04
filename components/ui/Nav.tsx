'use client';

import { useEffect, useState } from 'react';
import { navLinks, site } from '@/data/content';
import { scrollToTarget } from '@/lib/scroll';
import { toggleMenu } from '@/lib/menu';

/**
 * Sticky pill nav. The hero has its own nav inside the white panel, so this only
 * appears once you've scrolled past the hero. Also hidden during loader/intro
 * (see .nav-fade in globals.css).
 */
export default function Nav() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`nav-fade fixed inset-x-0 top-4 z-40 flex items-center justify-between px-4 transition-all duration-500 sm:px-8 ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0 pointer-events-none'
      }`}
    >
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          scrollToTarget(0);
        }}
        className="flex h-11 items-center rounded-full bg-white px-5 font-display text-lg uppercase tracking-wide text-ink shadow-lg"
        aria-label={`${site.name} — back to top`}
      >
        SS<span className="text-brand">.</span>
      </a>
      <div className="flex items-center gap-2 rounded-full bg-white p-1 pl-6 text-ink shadow-lg">
        <nav aria-label="Primary" className="hidden gap-5 text-[11px] font-bold uppercase tracking-widest sm:flex">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.target}
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget(l.target);
              }}
              className="transition-colors hover:text-brand"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <button
          onClick={toggleMenu}
          aria-label="Open menu"
          className="ml-2 flex h-9 w-9 flex-col items-center justify-center gap-1 rounded-full bg-ink transition-colors hover:bg-brand"
        >
          <span className="h-0.5 w-4 bg-white" />
          <span className="h-0.5 w-4 bg-white" />
        </button>
      </div>
    </header>
  );
}
