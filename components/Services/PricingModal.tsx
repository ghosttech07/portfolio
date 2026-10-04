'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { servicesText, type ServiceCategory } from '@/data/content';
import { lockScroll, scrollToTarget, unlockScroll } from '@/lib/scroll';

/**
 * Pricing dialog for one service category.
 * Accessible: role="dialog" + aria-modal, labelled by its title, focus moves in on open,
 * Tab is trapped inside, Esc / backdrop / Close button dismiss it, and focus returns to
 * the button that opened it. Page scroll is locked while open.
 */
export default function PricingModal({ service, onClose }: { service: ServiceCategory; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = `pricing-title-${service.id}`;

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
      const focusable = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
      opener.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quote = () => {
    onClose();
    // wait for the dialog to unmount and scroll unlock before scrolling
    setTimeout(() => scrollToTarget(servicesText.quoteTarget), 250);
  };

  return (
    <div className="fixed inset-0 z-[115] flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <motion.div
        className="absolute inset-0 bg-ink/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="relative flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-white text-ink shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] sm:rounded-[2rem]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink/10 p-6 sm:p-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand">{servicesText.pricingTitle}</p>
            <h3 id={titleId} className="mt-1 font-chunk text-2xl uppercase leading-tight sm:text-4xl">
              {service.title}
            </h3>
          </div>
          <button
            ref={closeBtn}
            onClick={onClose}
            aria-label={servicesText.close}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-lg text-white transition-colors hover:bg-brand"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain p-6 sm:p-8" data-lenis-prevent>
          {service.points ? (
            <ul>
              {service.points.map((p) => (
                <li key={p.name} className="flex flex-col gap-1 border-b border-ink/10 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <span className="text-sm font-medium sm:text-base">{p.name}</span>
                  <span className="shrink-0 font-chunk text-sm text-brand sm:text-base">{p.price}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-ink/60">Custom pricing</p>
              <p className="mt-2 font-chunk text-2xl text-brand sm:text-3xl">{service.startingPrice}</p>
              <p className="mt-5 text-sm leading-relaxed text-ink/75 sm:text-base">{service.pricingExplainer}</p>
            </div>
          )}
          <ul className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink/65">
            {servicesText.pricingTerms.map((term) => <li key={term}>{term}</li>)}
          </ul>
        </div>

        <div className="border-t border-ink/10 p-6 sm:p-8">
          <button
            onClick={quote}
            className="group inline-flex items-center gap-3 rounded-full bg-brand py-2 pl-8 pr-2 text-sm font-bold uppercase tracking-widest text-white transition-transform duration-300 hover:scale-105"
          >
            {servicesText.quoteCta}
            <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-lg transition-transform duration-300 group-hover:rotate-45">
              ↗
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
