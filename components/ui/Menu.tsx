'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { navLinks, site, socials } from '@/data/content';
import { lockScroll, scrollToTarget, unlockScroll } from '@/lib/scroll';

/** Full-screen menu, opened by the round menu buttons (see lib/menu.ts). */
export default function Menu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setOpen((o) => !o);
    window.addEventListener('menu:toggle', toggle);
    return () => window.removeEventListener('menu:toggle', toggle);
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      unlockScroll();
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          role="dialog"
          aria-label="Menu"
          initial={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
          animate={{ clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
          exit={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          data-lenis-prevent
          className="fixed inset-0 z-[120] flex flex-col justify-between gap-6 overflow-y-auto overscroll-contain bg-gradient-to-br from-deep to-brand p-6 sm:p-12"
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
            <span>{site.name}</span>
            <button onClick={() => setOpen(false)} className="rounded-full bg-white px-4 py-2 text-ink">
              Close ✕
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            {navLinks.map((l, i) => (
              <motion.a
                key={l.label}
                href={l.target}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.25 + i * 0.07 } }}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  setTimeout(() => scrollToTarget(l.target), 350);
                }}
                className="font-display text-[clamp(2.6rem,min(14vw,11vh),9rem)] uppercase leading-[0.95] text-white transition-colors hover:text-ink"
              >
                {l.label}
              </motion.a>
            ))}
          </nav>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            {socials.map((s) => (
              <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {s.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
