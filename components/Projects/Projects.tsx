'use client';

import { useCallback, useRef, useState } from 'react';
import SceneScroll from '@/components/ui/SceneScroll';
import Portal from '@/components/ui/Portal';
import Image from 'next/image';
import { copy, projects } from '@/data/content';
import ProjectModal from '@/components/ProjectModal/ProjectModal';
import { useReveal } from '@/lib/hooks';
import { pad2, type Rect } from '@/lib/utils';

const isSvg = (s: string) => s.endsWith('.svg');

/**
 * SECTION — PROJECTS: dark, chrome heading, and cards that STACK as you scroll.
 * Each card is `position: sticky` with a slightly larger `top` than the previous
 * one, so earlier cards stay parked with just their header row peeking out.
 * Clicking the image collage expands it into the full case study (Section 4).
 */
export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<{ id: string; rect: Rect } | null>(null);
  useReveal(root, '[data-rise]');

  /** Where a project's collage is on screen right now (used to morph into / out of the panel). */
  const getRect = useCallback((id: string): Rect | null => {
    const el = document.querySelector<HTMLElement>(`[data-project-id="${id}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  }, []);

  return (
    <section
      id="works"
      ref={root}
      className="relative overflow-x-clip bg-[#0b0b0b] px-4 pb-32 pt-20 text-white [--stack-step:60px] [--stack-top:72px] sm:px-10 sm:pt-24 sm:[--stack-step:74px] sm:[--stack-top:96px]"
    >
      <SceneScroll trigger={root}>
      <h2 data-rise className="text-chrome text-center font-chunk text-[clamp(3rem,10.5vw,9.5rem)] uppercase leading-none">
        {copy.worksTitle}
      </h2>

      <div className="mx-auto mt-14 max-w-6xl sm:mt-20">
        {projects.map((p, i) => (
          <div
            key={p.id}
            className="sticky mb-[16vh] last:mb-0"
            style={{ top: `calc(var(--stack-top) + ${i} * var(--stack-step))`, zIndex: i + 1 }}
          >
            <article className="rounded-[1.6rem] border border-white/45 bg-[#0b0b0b] p-3 sm:rounded-[2rem] sm:p-5">
              {/* header row: this is the strip that stays visible when the next card covers it */}
              <header className="flex h-[38px] items-center justify-between sm:h-[42px]">
                <div className="flex items-center gap-4 sm:gap-6">
                  <span className="font-chunk text-3xl leading-none sm:text-4xl">{pad2(i + 1)}</span>
                  <div className="leading-tight">
                    <p className="text-[11px] font-bold uppercase tracking-wider">{p.client}</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/50">
                      {[p.category, p.year].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors hover:border-brand hover:bg-brand sm:px-6 sm:py-2 sm:text-[11px]"
                >
                  Live project
                </a>
              </header>

              {/* image collage → opens the case study */}
              <button
                data-project-id={p.id}
                data-cursor
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setOpen({ id: p.id, rect: { top: r.top, left: r.left, width: r.width, height: r.height } });
                }}
                aria-label={`Open ${p.title} case study`}
                className="group mt-3 grid h-[min(46vh,300px)] w-full grid-cols-[1.7fr_1fr] gap-2 text-left sm:mt-5 sm:h-[min(52vh,470px)] sm:gap-3"
              >
                <span className="relative row-span-2 overflow-hidden rounded-2xl bg-white/5 sm:rounded-3xl">
                  <Image
                    src={p.hero}
                    alt={`${p.title} preview`}
                    fill
                    sizes="(max-width: 768px) 60vw, 640px"
                    unoptimized={isSvg(p.hero)}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-5">
                    <span className="font-chunk text-lg uppercase sm:text-2xl">{p.title}</span>
                    <span className="hidden shrink-0 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
                      View case study ↗
                    </span>
                  </span>
                </span>
                {[p.gallery[0] || p.thumbnail || p.hero, p.gallery[1] || p.gallery[0] || p.thumbnail || p.hero].map((g, k) => (
                  <span key={k} className="relative overflow-hidden rounded-2xl bg-white/5 sm:rounded-3xl">
                    <Image
                      src={g}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 35vw, 380px"
                      unoptimized={isSvg(g)}
                      loading="lazy"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </span>
                ))}
              </button>
            </article>
          </div>
        ))}
      </div>

      </SceneScroll>

      {open && (
        <Portal>
        <ProjectModal
          key="modal"
          projectId={open.id}
          list={projects}
          originRect={open.rect}
          getRect={getRect}
          onNavigate={(id) => setOpen((o) => (o ? { ...o, id } : o))}
          onClosed={() => setOpen(null)}
        />
        </Portal>
      )}
    </section>
  );
}
