'use client';

import { useRef, useState } from 'react';
import { services, servicesSubtitle, servicesText, servicesTitle, type ServiceCategory } from '@/data/content';
import { useReveal } from '@/lib/hooks';
import { pad2 } from '@/lib/utils';
import PricingModal from './PricingModal';
import Portal from '@/components/ui/Portal';
import SceneScroll from '@/components/ui/SceneScroll';

/** Stroke icons in the same style as the social icons. Add a key here + in ServiceCategory['icon'] to add one. */
const ICONS: Record<ServiceCategory['icon'], React.ReactNode> = {
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </>
  ),
  design: (
    <>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </>
  ),
  ai: (
    <>
      <path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" />
    </>
  ),
  app: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </>
  ),
  custom: (
    <>
      <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M15 9h.01M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5" />
    </>
  ),
};

function Icon({ name, className = '' }: { name: ServiceCategory['icon']; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`h-6 w-6 fill-none stroke-current ${className}`}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

/**
 * SECTION — SERVICES: light background, black chunky heading, big numbered rows split by
 * hairlines. Each row lists the service points and has a "View Pricing" button that opens
 * a pricing dialog. The last row (Custom Projects) is a dark, accent-outlined card.
 * All copy and prices live in `services` / `servicesText` in data/content.ts.
 */
export default function Services() {
  const root = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  useReveal(root);
  const active = services.find((s) => s.id === openId) ?? null;

  return (
    <section id="services" ref={root} className="relative overflow-hidden bg-[#f3f3f1] px-5 pb-28 pt-20 text-ink sm:px-10 sm:pb-40 sm:pt-24">
      <SceneScroll trigger={root}>
      <header className="text-center">
        <h2 data-rise className="font-chunk text-[clamp(2.2rem,9vw,9rem)] uppercase leading-none">
          {servicesTitle}
        </h2>
        <p data-rise className="mt-5 text-sm font-semibold uppercase tracking-[0.25em] text-ink/65 sm:text-base">
          {servicesSubtitle}
        </p>
      </header>

      <ol className="mx-auto mt-16 max-w-5xl sm:mt-24">
        {services.map((s, i) => {
          const custom = !!s.highlight;
          return (
            <li
              key={s.id}
              data-rise
              className={
                custom
                  ? 'group mt-10 grid grid-cols-1 gap-x-4 gap-y-5 rounded-[2rem] border-2 border-brand bg-ink p-6 text-white shadow-[0_30px_80px_-30px_rgba(255,106,0,0.7)] sm:grid-cols-[8.5rem_1fr_auto] sm:gap-x-8 sm:gap-y-6 sm:p-10'
                  : 'group grid grid-cols-1 gap-x-4 gap-y-5 border-b border-ink/15 py-8 first:border-t sm:grid-cols-[8.5rem_1fr_auto] sm:items-start sm:gap-x-8 sm:py-10'
              }
            >
              <span
                aria-hidden
                className={`font-chunk text-4xl leading-none transition-colors duration-300 sm:text-7xl ${
                  custom ? 'text-brand' : 'group-hover:text-brand'
                }`}
              >
                {pad2(i + 1)}
              </span>

              <div className="transition-transform duration-500 ease-out group-hover:translate-x-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                      custom ? 'border-brand/60 text-brand' : 'border-ink/25'
                    }`}
                  >
                    <Icon name={s.icon} />
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wide sm:text-lg">{s.title}</h3>
                  {custom && (
                    <span className="hidden rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white sm:inline">
                      Anything else
                    </span>
                  )}
                </div>

                {s.points ? (
                  <ul className="mt-5 grid gap-x-8 gap-y-2 text-sm text-ink/75 sm:grid-cols-2">
                    {s.points.map((p) => (
                      <li key={p.name} className="flex gap-3 leading-snug">
                        <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        {p.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                    <p>{s.description}</p>
                    <p className="mt-4 font-chunk text-lg text-brand sm:text-2xl">{s.startingPrice}</p>
                  </div>
                )}
              </div>

              {!custom && <div className="sm:pt-1">
                <button
                  onClick={() => setOpenId(s.id)}
                  aria-haspopup="dialog"
                  aria-label={`${servicesText.viewPricing}: ${s.title}`}
                  className={`w-full whitespace-nowrap rounded-full border px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 sm:w-auto ${
                    custom
                      ? 'border-brand bg-brand text-white hover:bg-white hover:text-ink'
                      : 'border-ink/40 hover:border-brand hover:bg-brand hover:text-white'
                  }`}
                >
                  {servicesText.viewPricing}
                </button>
              </div>}
            </li>
          );
        })}
      </ol>
      <ul className="mx-auto mt-8 max-w-5xl space-y-2 text-sm leading-relaxed text-ink/65">
        {servicesText.pricingTerms.map((term) => <li key={term}>{term}</li>)}
      </ul>

      </SceneScroll>

      {active && (
        <Portal>
          <PricingModal key={active.id} service={active} onClose={() => setOpenId(null)} />
        </Portal>
      )}
    </section>
  );
}
