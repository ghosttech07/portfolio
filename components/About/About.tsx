'use client';

import { useRef } from 'react';
import SceneScroll from '@/components/ui/SceneScroll';
import Portrait from './Portrait';
import SkillsRing from './SkillsRing';
import { about } from '@/data/content';
import { useReveal } from '@/lib/hooks';
import { scrollToTarget } from '@/lib/scroll';

/** Small orange uppercase label used across the site. */
const label = 'text-[11px] font-bold uppercase tracking-[0.25em] text-brand';

/**
 * SECTION — ABOUT ME: dark, chrome heading, then skills (grouped chips), education
 * (timeline) and the first client project. All copy comes from `about` in data/content.ts.
 */
export default function About() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section
      id="about"
      ref={root}
      className="relative overflow-hidden bg-[#0b0b0b] px-5 pb-16 pt-28 text-white sm:px-10 sm:pb-24 sm:pt-12"
    >
      <SceneScroll trigger={root}>
      {/* top: About Me + name on the left, portrait in an orange circle on the right */}
      <header className="mx-auto grid max-w-[1600px] items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        <div className="text-left">
          <h2 data-rise className="text-chrome-orange font-chunk text-[clamp(2.2rem,5vw,4.6rem)] uppercase leading-none">
            {about.heading}
          </h2>
          <p
            data-rise
            aria-label={about.name}
            className="mt-8 font-chunk text-[clamp(3rem,8.4vw,8rem)] uppercase leading-[0.92] text-white"
          >
            <span aria-hidden>
              {about.firstName}
              <br />
              {about.lastName}
            </span>
          </p>
          <p data-rise className="mt-5 text-lg font-semibold text-white/80 sm:text-2xl">
            {about.role}
          </p>
          <p data-rise className="mt-6 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            {about.intro}
          </p>
        </div>

        <div data-rise className="lg:justify-self-end">
          <Portrait />
        </div>
      </header>

      <div className="mx-auto max-w-5xl">
        {/* skills: rotating ring of category cards */}
        <div className="mt-20 sm:mt-28">
          <h3 data-rise className={label}>
            {about.skillsTitle}
          </h3>
          <div data-rise className="mt-4">
            <SkillsRing />
          </div>
        </div>

        {/* education timeline */}
        <div className="mt-20 sm:mt-28">
          <h3 data-rise className={label}>
            {about.educationTitle}
          </h3>
          <ol className="mt-8 border-l border-white/25">
            {about.education.map((e) => (
              <li key={e.degree} data-rise className="relative pb-10 pl-8 last:pb-0 sm:pl-10">
                <span aria-hidden className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#0b0b0b] bg-brand" />
                <p className="text-xs font-bold uppercase tracking-wider text-brand">{e.period}</p>
                <h4 className="mt-1 font-chunk text-xl uppercase leading-tight sm:text-3xl">{e.degree}</h4>
                <p className="mt-1 text-sm text-white/80 sm:text-base">{e.institution}</p>
                {e.note && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">{e.note}</p>}
              </li>
            ))}
          </ol>
        </div>

        {/* first client project */}
        <div className="mt-20 sm:mt-28">
          <h3 data-rise className={label}>
            {about.projectLabel}
          </h3>
          <article
            data-rise
            className="mt-6 rounded-[2rem] border border-white/30 p-6 transition-colors duration-300 hover:border-brand sm:p-10"
          >
            <span className="inline-block rounded-full bg-brand px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white">
              {about.project.tag}
            </span>
            <h4 className="mt-4 font-chunk text-2xl uppercase leading-tight sm:text-4xl">{about.project.title}</h4>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">{about.project.description}</p>
            <a
              href={about.project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/60 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors hover:border-brand hover:bg-brand"
            >
              {about.project.linkLabel}
              <span aria-hidden>↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </article>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center sm:mt-28">
          <button
            data-rise
            onClick={() => scrollToTarget('#connect')}
            className="rounded-full bg-gradient-to-r from-deep via-brand to-light px-10 py-3 text-xs font-bold uppercase tracking-[0.25em] text-white shadow-[0_14px_40px_-10px_rgba(255,106,0,0.8)] transition-transform duration-300 hover:scale-105"
          >
            {about.cta}
          </button>
        </div>
      </div>
      </SceneScroll>
    </section>
  );
}
