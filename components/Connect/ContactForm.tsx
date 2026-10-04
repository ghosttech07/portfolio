'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const MAX = 1000;

/** Shared look for text inputs: floating label that lifts when the field is focused or filled. */
const input =
  'peer w-full rounded-2xl border border-ink/15 bg-cream/60 px-5 pb-2.5 pt-6 text-[15px] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder-transparent focus:border-brand focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,106,0,0.14)]';
const label =
  'pointer-events-none absolute left-5 top-4 origin-left text-[15px] text-ink/50 transition-all duration-200 peer-focus:top-2 peer-focus:scale-[0.78] peer-focus:text-brand peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:scale-[0.78]';

/** Contact form → POST /api/contact (emails you through Resend, see app/api/contact/route.ts). */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [len, setLen] = useState(0);
  const [sentTo, setSentTo] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');
    setError('');
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || 'Something went wrong. Please try again.');
      setSentTo(String(data.name ?? '').split(' ')[0]);
      setStatus('sent');
      form.reset();
      setLen(0);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div className="relative flex h-full flex-col justify-center rounded-[2rem] bg-white p-6 shadow-[0_40px_90px_-40px_rgba(17,17,17,0.35)] sm:p-9">
      {/* soft orange accent in the corner */}
      <div aria-hidden className="pointer-events-none absolute -right-px -top-px h-28 w-28 overflow-hidden rounded-tr-[2rem]">
        <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-gradient-to-br from-deep to-light opacity-90" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {status === 'sent' ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex min-h-[460px] flex-col items-center justify-center text-center sm:min-h-[640px]"
            role="status"
            aria-live="polite"
          >
            <motion.span
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-white shadow-[0_18px_40px_-10px_rgba(255,106,0,0.8)]"
            >
              <svg viewBox="0 0 24 24" className="h-9 w-9 fill-none stroke-current" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </motion.span>
            <h3 className="mt-6 font-chunk text-3xl uppercase leading-tight">Message sent{sentTo ? `, ${sentTo}` : ''}!</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/65">Thanks for reaching out. I read every message and reply within 24 hours.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-8 rounded-full border border-ink/30 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-brand hover:bg-brand hover:text-white"
            >
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative" noValidate={false}>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand">Start a project</p>
            <h3 className="mt-1 font-chunk text-2xl uppercase leading-tight sm:text-3xl">Tell me about your idea</h3>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="relative">
                <input id="cf-name" name="name" required minLength={2} maxLength={100} placeholder="Name" autoComplete="name" className={input} />
                <label htmlFor="cf-name" className={label}>
                  Your name
                </label>
              </div>
              <div className="relative">
                <input id="cf-email" name="email" type="email" required maxLength={200} placeholder="Email" autoComplete="email" className={input} />
                <label htmlFor="cf-email" className={label}>
                  Email address
                </label>
              </div>
            </div>

            <div className="relative mt-6">
              <textarea
                id="cf-message"
                name="message"
                required
                minLength={10}
                maxLength={MAX}
                rows={5}
                placeholder="Message"
                onChange={(e) => setLen(e.target.value.length)}
                className={`${input} resize-none pt-7`}
              />
              <label htmlFor="cf-message" className={label}>
                What are you building?
              </label>
              <span aria-hidden className={`pointer-events-none absolute bottom-3 right-4 text-[11px] tabular-nums ${len > MAX * 0.9 ? 'text-deep' : 'text-ink/35'}`}>
                {len}/{MAX}
              </span>
            </div>

            {/* honeypot: hidden from humans, bots fill it */}
            <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="group flex w-full items-center justify-between rounded-full bg-brand py-2 pl-8 pr-2 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_16px_36px_-12px_rgba(255,106,0,0.85)] transition-all duration-300 hover:shadow-[0_20px_44px_-10px_rgba(255,106,0,0.95)] disabled:opacity-70"
              >
                {status === 'sending' ? 'Sending…' : 'Send message'}
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-lg transition-transform duration-300 group-hover:rotate-45">
                  {status === 'sending' ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <span aria-hidden>↗</span>
                  )}
                </span>
              </button>
              <p role="alert" aria-live="polite" className="min-h-[1.25rem] text-center text-sm font-semibold text-deep">
                {status === 'error' && error}
              </p>
              <p className="text-center text-xs text-ink/45">I reply within 24 hours. Your details are only used to answer your message.</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
