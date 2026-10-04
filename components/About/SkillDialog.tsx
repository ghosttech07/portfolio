'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { lockScroll, unlockScroll } from '@/lib/scroll';
import { pad2 } from '@/lib/utils';
import { SkillLogo } from './skillIcons';

interface Group {
  category: string;
  items: { name: string; icon: string }[];
}

/**
 * The opened skill card: a dialog with a big logo tile for each skill.
 * Accessible: role="dialog" + aria-modal, focus moves in and is trapped, Esc / backdrop / X close,
 * focus returns to the card that opened it. Page scroll is locked while open.
 */
export default function SkillDialog({ group, index, onClose }: { group: Group; index: number; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = `skill-title-${index}`;

  useEffect(() => {
    opener.current = document.activeElement as HTMLElement | null;
    lockScroll();
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      unlockScroll();
      opener.current?.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center p-4 sm:p-8" role="presentation">
      <motion.div className="absolute inset-0 bg-ink/70 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.85, rotateY: -35, y: 30 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 170, damping: 20 }}
        style={{ transformPerspective: 1200 }}
        className="relative max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-white/30 bg-[#0b0b0b] p-6 text-white shadow-[0_40px_120px_-20px_rgba(255,106,0,0.45)] sm:p-10"
        data-lenis-prevent
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-chunk text-5xl leading-none text-brand sm:text-7xl">{pad2(index + 1)}</p>
            <h3 id={titleId} className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-white/70 sm:text-sm">
              {group.category}
            </h3>
          </div>
          <button
            ref={closeBtn}
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg text-ink transition-colors hover:bg-brand hover:text-white"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {group.items.map((it, i) => (
            <motion.li
              key={it.name}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.18 + i * 0.07, type: 'spring', stiffness: 260, damping: 18 }}
              whileHover={{ y: -6 }}
              className="flex flex-col items-center gap-4 rounded-3xl border border-white/20 p-5 text-center transition-colors hover:border-brand"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-3.5 shadow-[0_12px_30px_-10px_rgba(255,106,0,0.6)] sm:h-20 sm:w-20 sm:p-4">
                <SkillLogo icon={it.icon} name={it.name} />
              </span>
              <span className="text-sm font-semibold sm:text-base">{it.name}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
