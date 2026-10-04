'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { projects, type Project } from '@/data/content';
import CardFace from './CardFace';
import { lockScroll, unlockScroll } from '@/lib/scroll';
import { pad2, type Rect } from '@/lib/utils';

/**
 * SECTION 4 — "THE EXPANSION"
 *
 * Shared-element transition: the panel STARTS at the exact on-screen rectangle
 * of the card that was clicked (3D card → projected rect; mobile card → DOM
 * rect), showing the same card face, then springs to (almost) full screen. On
 * close it measures where the card is *now* and shrinks back into it.
 * The real content is laid out at its final size and only revealed once the
 * panel is nearly open, so text never reflows mid-morph.
 */

interface Props {
  projectId: string;
  list: Project[]; // projects reachable with prev/next (respects the active filter)
  originRect: Rect;
  getRect: (id: string) => Rect | null;
  onNavigate: (id: string) => void;
  onClosed: () => void;
}

const finalRect = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw < 768) return { top: 0, left: 0, width: vw, height: vh, borderRadius: 0 };
  return { top: vh * 0.03, left: vw * 0.03, width: vw * 0.94, height: vh * 0.94, borderRadius: 36 };
};

export default function ProjectModal({ projectId, list, originRect, getRect, onNavigate, onClosed }: Props) {
  const project = list.find((p) => p.id === projectId) ?? projects.find((p) => p.id === projectId)!;
  const index = Math.max(0, list.findIndex((p) => p.id === projectId));
  const controls = useAnimationControls();
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening');
  const [box, setBox] = useState<ReturnType<typeof finalRect> | null>(null);
  const closing = useRef(false);
  const idRef = useRef(projectId);
  idRef.current = projectId;

  // lock page scroll while open
  useEffect(() => {
    lockScroll();
    return () => unlockScroll();
  }, []);

  // open: morph from the card's rect to the final rect
  useEffect(() => {
    const f = finalRect();
    setBox(f);
    controls.start({ ...f, transition: { type: 'spring', stiffness: 120, damping: 20, mass: 1 } });
    const t = setTimeout(() => setPhase('open'), 420);
    const onResize = () => {
      const nf = finalRect();
      setBox(nf);
      controls.set(nf);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [controls]);

  // close: shrink back into wherever the card is right now
  const close = useCallback(async () => {
    if (closing.current) return;
    closing.current = true;
    setPhase('closing');
    const r = getRect(idRef.current);
    const onScreen = r && r.width > 20 && r.top < window.innerHeight && r.top + r.height > 0;
    if (onScreen && r) {
      await controls.start({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        borderRadius: 20,
        transition: { type: 'spring', stiffness: 170, damping: 24 },
      });
    } else {
      await controls.start({ opacity: 0, scale: 0.92, transition: { duration: 0.3 } });
    }
    onClosed();
  }, [controls, getRect, onClosed]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (list.length < 2) return;
      onNavigate(list[(index + dir + list.length) % list.length].id);
    },
    [index, list, onNavigate],
  );

  // keyboard: Esc closes, arrows navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (phase === 'open' && e.key === 'ArrowRight') go(1);
      else if (phase === 'open' && e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, go, phase]);

  const open = phase === 'open';

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label={`${project.title} case study`}>
      {/* blurred backdrop — click to close */}
      <motion.div
        className="absolute inset-0 bg-ink/50 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'closing' ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        onClick={close}
      />

      {/* the morphing panel */}
      <motion.div
        animate={controls}
        initial={{ ...originRect, borderRadius: 20 }}
        className="fixed overflow-hidden bg-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)]"
        style={{ willChange: 'top,left,width,height' }}
      >
        {/* ghost: the card face, visible while morphing */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: 'none' }}
        >
          <CardFace project={project} sizes="100vw" />
        </motion.div>

        {/* real content, fixed at final size */}
        {box && (
          <motion.div
            className="absolute left-0 top-0"
            style={{ width: box.width, height: box.height }}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="h-full overflow-y-auto overscroll-contain text-ink"
                data-lenis-prevent
              >
                <CaseStudy project={project} list={list} index={index} go={go} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* controls */}
        <motion.div animate={{ opacity: open ? 1 : 0 }} style={{ pointerEvents: open ? 'auto' : 'none' }}>
          <button
            onClick={close}
            aria-label="Close case study"
            className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-xl text-white shadow-xl transition-transform hover:rotate-90 hover:bg-brand"
          >
            ✕
          </button>
          {list.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink p-1.5 text-white shadow-xl">
              <button onClick={() => go(-1)} aria-label="Previous project" className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-brand">
                ←
              </button>
              <span className="min-w-[4.5rem] text-center font-display text-sm tracking-wider">
                {pad2(index + 1)} / {pad2(list.length)}
              </span>
              <button onClick={() => go(1)} aria-label="Next project" className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-brand">
                →
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── case-study content ─────────────────────────── */

function CaseStudy({ project: p, list, index, go }: { project: Project; list: Project[]; index: number; go: (d: 1 | -1) => void }) {
  const next = list[(index + 1) % list.length];
  const prev = list[(index - 1 + list.length) % list.length];
  const isSvg = (s: string) => s.endsWith('.svg');

  return (
    <article className="px-5 pb-28 pt-5 md:px-10 md:pt-10">
      {/* hero media */}
      <div className="relative aspect-[16/9] max-h-[62vh] w-full overflow-hidden rounded-[1.75rem] bg-cream md:rounded-[2.5rem]">
        {p.video ? (
          <video src={p.video} poster={p.hero} autoPlay muted loop playsInline className="h-full w-full object-cover" />
        ) : (
          <Image src={p.hero} alt={`${p.title} hero`} fill sizes="94vw" priority unoptimized={isSvg(p.hero)} className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute inset-x-5 bottom-5 md:inset-x-10 md:bottom-8">
          <span className="rounded-full bg-brand px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">{p.category}</span>
          <h2 className="mt-3 font-display text-[clamp(2.6rem,8vw,7rem)] uppercase leading-[0.92] text-white">{p.title}</h2>
          <p className="mt-2 max-w-xl text-sm text-white/85 md:text-lg">{p.tagline}</p>
        </div>
      </div>

      {/* meta */}
      <dl className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {[
          ['Client', p.client],
          ['Project type', p.projectType],
          ['My role', p.role],
          ['Year', p.year],
          ['Duration', p.duration],
        ].filter(([, v]) => Boolean(v)).map(([k, v]) => (
          <div key={k} className="border-t-2 border-ink/10 pt-3">
            <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">{k}</dt>
            <dd className="mt-1 font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      {/* stack */}
      {p.stack.length > 0 && <div className="mt-10">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Tech stack</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {p.stack.map((t, i) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, scale: 0.6, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.07, type: 'spring', stiffness: 300, damping: 18 }}
              className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white"
            >
              {t}
            </motion.li>
          ))}
        </ul>
      </div>}

      {/* problem / solution */}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {[
          ['The problem', p.problem],
          [p.problem ? 'My solution' : 'About the game', p.solution],
        ].filter(([, v]) => Boolean(v)).map(([k, v]) => (
          <section key={k} className="rounded-[1.75rem] bg-cream p-6 md:p-8">
            <h3 className="font-display text-3xl uppercase text-brand">{k}</h3>
            <p className="mt-3 leading-relaxed text-ink/80">{v}</p>
          </section>
        ))}
      </div>

      {/* results */}
      {(p.challenge || p.outcome) && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            ['The challenge', p.challenge],
            ['The outcome', p.outcome],
          ].filter(([, value]) => Boolean(value)).map(([title, value]) => (
            <section key={title} className="rounded-[1.75rem] bg-cream p-6 md:p-8">
              <h3 className="font-display text-3xl uppercase text-brand">{title}</h3>
              <p className="mt-3 leading-relaxed text-ink/80">{value}</p>
            </section>
          ))}
        </div>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {p.results.map((r) => (
          <div key={r.label} className="rounded-[1.75rem] bg-gradient-to-br from-deep to-light p-6 text-white">
            <p className="font-display text-[clamp(3rem,6vw,5rem)] leading-none">{r.value}</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/85">{r.label}</p>
          </div>
        ))}
      </div>

      {/* gallery */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {p.gallery.map((g, i) => (
          <div key={g} className={`relative aspect-[3/2] overflow-hidden rounded-3xl bg-cream ${i === 0 ? 'md:col-span-2 md:row-span-1' : ''}`}>
            <Image src={g} alt={`${p.title} screenshot ${i + 1}`} fill sizes="(max-width: 768px) 90vw, 45vw" loading="lazy" unoptimized={isSvg(g)} className="object-cover" />
          </div>
        ))}
      </div>

      {/* links */}
      <div className="mt-10 flex flex-wrap gap-3">
        {p.liveUrl && <a
          href={p.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-transform hover:scale-105"
        >
          {p.category === 'Game' ? 'Play game' : 'Live site'} <span aria-hidden>↗</span>
        </a>}
        {p.githubUrl && <a
          href={p.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-transform hover:scale-105"
        >
          GitHub <span aria-hidden>↗</span>
        </a>}
      </div>

      {/* prev / next */}
      {list.length > 1 && (
        <div className="mt-12 grid gap-3 border-t-2 border-ink/10 pt-6 sm:grid-cols-2">
          <button onClick={() => go(-1)} className="group text-left">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">← Previous</span>
            <span className="mt-1 block font-display text-3xl uppercase transition-colors group-hover:text-brand">{prev.title}</span>
          </button>
          <button onClick={() => go(1)} className="group text-left sm:text-right">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Next →</span>
            <span className="mt-1 block font-display text-3xl uppercase transition-colors group-hover:text-brand">{next.title}</span>
          </button>
        </div>
      )}
    </article>
  );
}
