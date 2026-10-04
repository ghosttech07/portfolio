'use client';

import { useState } from 'react';
import type { Review } from '@/data/content';

const field =
  'w-full rounded-full border border-white/25 bg-transparent px-6 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/40 focus:border-brand';

/** "Leave a review" form. On success the new review is handed up so it appears in the marquee immediately. */
export default function ReviewForm({ onAdded }: { onAdded: (r: Review) => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');
    setError('');
    const data = { ...Object.fromEntries(new FormData(form)), rating };
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || 'Something went wrong. Please try again.');
      if (json.review) onAdded(json.review as Review);
      setStatus('sent');
      form.reset();
      setRating(5);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div className="mx-auto mt-14 max-w-xl text-center sm:mt-20">
      <button
        onClick={() => {
          setOpen((o) => !o);
          setStatus('idle');
        }}
        aria-expanded={open}
        className="rounded-full bg-gradient-to-r from-deep via-brand to-light px-9 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white shadow-[0_14px_40px_-10px_rgba(255,106,0,0.8)] transition-transform hover:scale-105"
      >
        {open ? 'Close' : 'Leave a review'}
      </button>

      {open && (
        <form onSubmit={onSubmit} className="relative mt-8 space-y-3 rounded-[2rem] border border-white/25 p-6 text-left sm:p-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-white/60">Worked with me? Tell everyone how it went</p>

          <div className="flex items-center justify-center gap-1 py-1" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="p-1"
              >
                <svg viewBox="0 0 24 24" className={`h-8 w-8 transition-colors ${n <= (hover || rating) ? 'fill-brand' : 'fill-white/20'}`} aria-hidden>
                  <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z" />
                </svg>
              </button>
            ))}
          </div>

          <input name="name" required minLength={2} maxLength={60} placeholder="Your name" autoComplete="name" className={field} />
          <input name="business" maxLength={80} placeholder="Business / company (optional)" autoComplete="organization" className={field} />
          <textarea
            name="quote"
            required
            minLength={10}
            maxLength={400}
            rows={4}
            placeholder="Your review"
            className={`${field} resize-none rounded-[1.75rem]`}
          />
          {/* honeypot */}
          <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-full border border-white/40 py-3.5 text-xs font-bold uppercase tracking-[0.3em] transition-colors hover:border-brand hover:bg-brand disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Submit review'}
          </button>
          <p role="status" aria-live="polite" className="min-h-[1.25rem] text-center text-sm font-semibold">
            {status === 'sent' && <span className="text-brand">Thank you! Your review is live above.</span>}
            {status === 'error' && <span className="text-light">{error}</span>}
          </p>
        </form>
      )}
    </div>
  );
}
