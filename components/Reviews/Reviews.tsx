'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { copy, reviews as seedReviews, type Review } from '@/data/content';
import { useReveal } from '@/lib/hooks';
import ReviewForm from './ReviewForm';
import SceneScroll from '@/components/ui/SceneScroll';

const initials = (n: string) =>
  n
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${i <= n ? 'fill-brand' : 'fill-white/20'}`} aria-hidden>
          <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <article className="mr-4 flex min-h-[230px] w-[300px] shrink-0 flex-col justify-between rounded-[1.75rem] border border-white/30 bg-[#0b0b0b] p-6 transition-colors duration-300 hover:border-brand sm:w-[360px]">
      <div>
        <div className="flex items-start justify-between">
          {r.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-deep to-light text-xs font-bold text-white">
              {initials(r.name)}
            </span>
          )}
          <Stars n={r.rating} />
        </div>
        <p className="mt-5 text-[13px] leading-relaxed text-white/80">{r.quote}</p>
      </div>
      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-wider text-white">{r.name}</p>
        <p className="text-[10px] uppercase tracking-wider text-white/45">{r.business}</p>
      </div>
    </article>
  );
}

/**
 * One endless row. The list is repeated to fill the width, then rendered twice and
 * translated by -50% (see .marquee-track in globals.css); `is-reverse` makes it travel
 * LEFT → RIGHT. Pauses on hover; static + scrollable with reduced motion.
 */
function MarqueeRow({ items, seconds, ariaHidden }: { items: Review[]; seconds: number; ariaHidden?: boolean }) {
  const set = useMemo(() => {
    const out: Review[] = [];
    while (out.length < 8) out.push(...items);
    return out;
  }, [items]);
  return (
    <div
      className="marquee-wrap overflow-hidden py-2"
      aria-hidden={ariaHidden}
      style={{
        maskImage: 'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)',
      }}
    >
      <div className="marquee-track is-reverse" style={{ ['--marquee-duration' as string]: `${Math.round(set.length * seconds)}s` }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0" aria-hidden={k === 1 ? true : undefined}>
            {set.map((r, i) => (
              <ReviewCard key={`${k}-${r.id}-${i}`} r={r} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** SECTION — CLIENT REVIEWS: endless left-to-right marquee of outlined cards + "Leave a review". */
export default function Reviews() {
  const root = useRef<HTMLElement>(null);
  const [submitted, setSubmitted] = useState<Review[]>([]);
  const [canSubmit, setCanSubmit] = useState(false);
  useReveal(root);

  // Reviews submitted by visitors (newest first). Loaded on mount and refreshed every minute.
  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews', { cache: 'no-store' });
      const json = await res.json();
      if (Array.isArray(json.reviews)) setSubmitted(json.reviews);
      setCanSubmit(json.canSubmit === true);
    } catch {
      /* offline / no storage: just show the seeded reviews */
    }
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  const all = useMemo(() => [...submitted, ...seedReviews.filter((s) => !submitted.some((u) => u.id === s.id))], [submitted]);
  const rowB = useMemo(() => [...all].reverse(), [all]);

  return (
    <section id="reviews" ref={root} className="relative overflow-hidden bg-[#0b0b0b] pb-28 pt-20 text-white sm:pb-40 sm:pt-24">
      <SceneScroll trigger={root}>
      <h2
        data-rise
        className="mx-auto max-w-5xl px-5 text-center font-grotesk text-[clamp(2rem,5vw,4.4rem)] font-semibold leading-[1.05] tracking-tight"
      >
        {copy.reviewsTitle} <span aria-hidden>😍</span>
      </h2>

      <div data-rise className="mt-14 space-y-4 sm:mt-20">
        <MarqueeRow items={all} seconds={7} />
        <MarqueeRow items={rowB} seconds={9} ariaHidden />
      </div>

      <div className="px-5">
        {canSubmit && <ReviewForm onAdded={(r) => setSubmitted((s) => [r, ...s])} />}
      </div>
      </SceneScroll>
    </section>
  );
}
