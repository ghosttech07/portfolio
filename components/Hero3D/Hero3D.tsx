'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hero, navLinks, services, site } from '@/data/content';
import { useMediaQuery, useReducedMotion } from '@/lib/hooks';
import { scrollToTarget } from '@/lib/scroll';
import { toggleMenu } from '@/lib/menu';
import { clamp } from '@/lib/utils';
import { createHeroState } from './heroState';

// three.js only loads after the loader finishes, and never on browsers without WebGL.
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

export type RevealMode = 'pending' | 'animate' | 'instant';

const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * SECTION 2 — HERO
 *
 *   back    dark → orange gradient with warm glows (slow parallax)
 *   middle  R3F canvas: photo inside orbit rings, orbiting tech icons, glossy arrows
 *   front   DOM: top bar, greeting/title/CTA, glass testimonial card
 *
 * The section is 125svh tall with a sticky 100svh stage: scrolling through the
 * extra height drives `state.scroll` (camera push-through, icons/arrows fly
 * outward) while the stage fades into the dark About section.
 */
export default function Hero3D({
  reveal,
  ready,
}: {
  reveal: RevealMode;
  /** loader finished: safe to load three.js */
  ready: boolean;
}) {
  const reduced = useReducedMotion();
  const mobile = useMediaQuery('(max-width: 899px)');
  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [active, setActive] = useState(true);
  const activeRef = useRef(true);
  const state = useRef(createHeroState());

  const outer = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setWebgl(hasWebGL());
  }, []);

  /* ── reveal: start the 3D entrance + fade in the DOM overlays ── */
  useEffect(() => {
    if (reveal === 'pending') return;
    const st = state.current;
    const items = overlay.current?.querySelectorAll('[data-in]') ?? [];
    const letters = headline.current?.querySelectorAll('[data-letter]') ?? [];
    if (reveal === 'instant' || reduced) {
      st.revealAt = -100;
      gsap.set(items, { opacity: 1, y: 0 });
      gsap.set(letters, { yPercent: 0, opacity: 1 });
    } else {
      gsap.fromTo(letters, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.25, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
      st.revealAt = performance.now() / 1000;
      gsap.fromTo(items, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.7 });
    }
  }, [reveal, reduced]);

  /* ── pointer tilt + scroll exit ── */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const st = state.current;
    const el = stage.current!;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduced && !mobile) window.addEventListener('pointermove', onMove, { passive: true });

    const loop = () => {
      st.px += (tx - st.px) * 0.07;
      st.py += (ty - st.py) * 0.07;
      // back-layer glows read these CSS vars
      el.style.setProperty('--px', st.px.toFixed(3));
      el.style.setProperty('--py', st.py.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    if (!reduced) raf = requestAnimationFrame(loop);

    // Phones skip the pinned push-through: it left a full screen of empty glow before About.
    const trigger = reduced || mobile
      ? null
      : ScrollTrigger.create({
          trigger: outer.current,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const p = self.progress;
            st.scroll = p;
            const on = p < 0.985;
            if (on !== activeRef.current) {
              activeRef.current = on;
              setActive(on);
            }
            if (headline.current) {
              headline.current.style.transform = `translate3d(0,${-p * 260}px,0) scale(${1 + p * 0.25})`;
              headline.current.style.opacity = String(1 - smooth(0.1, 0.55, p));
            }
            if (overlay.current) {
              overlay.current.style.opacity = String(1 - smooth(0, 0.3, p));
              overlay.current.style.transform = `translate3d(0,${-p * 140}px,0)`;
            }
            if (fade.current) fade.current.style.opacity = String(0.5 * smooth(0.3, 1, p));
            el.style.setProperty('--sy', String(p));
          },
        });

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      trigger?.kill();
    };
  }, [reduced, mobile]);

  return (
    <section
      id="top"
      ref={outer}
      className={`relative ${reduced || mobile ? 'h-[100svh] min-h-[600px]' : 'h-[125svh]'}`}
      aria-label={`${site.name} — ${site.role}`}
    >
      <h1 className="sr-only">
        {hero.greeting} {site.firstName}, {hero.title}
      </h1>

      <div ref={stage} className="sticky top-0 h-[100svh] min-h-[600px] overflow-hidden bg-[#0b0b0b]">
        {/* ───── BACK: dark → orange gradient with warm glows ───── */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(75% 80% at 88% 85%, rgba(232,80,10,0.95) 0%, rgba(232,80,10,0.35) 45%, transparent 75%), radial-gradient(45% 55% at 0% 100%, rgba(255,106,0,0.35) 0%, transparent 70%), linear-gradient(135deg, #090909 0%, #120a06 45%, #2a0f05 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute right-[6%] top-[18%] h-[62vmin] w-[62vmin] rounded-full bg-brand/25 blur-[90px] will-change-transform"
          style={{ transform: 'translate3d(calc(var(--px,0) * -26px), calc(var(--py,0) * -20px + var(--sy,0) * 160px), 0)' }}
        />

        {/* ───── HEADLINE: huge condensed word BEHIND the 3D layer, so the orb / icons / photo overlap it ───── */}
        <div
          ref={headline}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[20%] z-[5] flex justify-center will-change-transform sm:top-[15%]"
        >
          <div
            className="flex overflow-hidden font-display uppercase leading-[0.95] tracking-tight text-[clamp(4.4rem,20.5vw,25rem)]"
            style={{
              backgroundImage: 'linear-gradient(180deg, #ffffff 15%, #ffc9a0 60%, #ff8a3c 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 18px 40px rgba(232,80,10,0.35))',
            }}
          >
            {[...hero.title.toUpperCase()].map((ch, i) => (
              <span key={i} data-letter className="inline-block">
                {ch}
              </span>
            ))}
          </div>
        </div>

        {/* ───── MIDDLE: 3D scene ───── */}
        {mounted && ready && webgl && (
          <div className="absolute inset-0 z-10">
            <HeroScene state={state} mobile={mobile} reduced={reduced} active={active} onReady={() => {}} />
          </div>
        )}

        {/* No-WebGL fallback: just the photo */}
        {mounted && ready && !webgl && hero.photo && (
          <div className="absolute inset-0 z-10">
            <Image
              src={hero.photo}
              alt=""
              width={1000}
              height={1312}
              priority
              className="absolute bottom-0 right-[8%] h-[90%] w-auto max-md:left-1/2 max-md:right-auto max-md:h-[62%] max-md:-translate-x-1/2"
            />
          </div>
        )}

        {/* ───── FRONT: DOM overlays ───── */}
        <div ref={overlay} className="pointer-events-none absolute inset-0 z-20 font-hero will-change-transform">
          {/* top bar */}
          <header data-in className="pointer-events-auto flex items-center justify-end gap-6 px-5 pt-5 opacity-0 md:justify-between sm:px-10 sm:pt-7">
            {/* reserved space for a logo (left) */}
            <div aria-hidden className="hidden w-[170px] shrink-0 md:block" />

            <nav aria-label="Primary" className="hidden flex-1 justify-evenly rounded-full border border-white/20 bg-black/20 px-2 py-1.5 backdrop-blur md:flex">
              {navLinks.map((l, i) => (
                <a
                  key={l.label}
                  href={l.target}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToTarget(l.target === '#top' ? 0 : l.target);
                  }}
                  className={`rounded-full px-5 py-1.5 text-sm transition-colors hover:text-brand ${i === 0 ? 'text-brand' : 'text-white/90'}`}
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3 md:w-[170px] md:shrink-0">
              <button
                onClick={toggleMenu}
                aria-label="Open menu"
                className="flex h-11 w-11 flex-col items-center justify-center gap-1 rounded-full bg-white shadow-lg md:hidden"
              >
                <span className="h-0.5 w-4 bg-ink" />
                <span className="h-0.5 w-4 bg-ink" />
              </button>
            </div>
          </header>

          {/* bottom row: intro copy (left) + testimonial (right) */}
          <div className="absolute inset-x-0 bottom-[68px] flex items-end justify-between gap-6 px-5 sm:bottom-[76px] sm:px-10">
            <div className="max-w-[min(520px,92vw)]">
              <p data-in className="text-[clamp(1rem,1.6vw,1.4rem)] font-medium text-white opacity-0">
                {hero.greeting} <span className="text-brand">{site.firstName}</span>
              </p>
              <p data-in className="mt-3 max-w-md text-sm leading-relaxed text-white/75 opacity-0 sm:text-base">
                {hero.description}
              </p>
              <div data-in className="pointer-events-auto mt-5 flex items-center gap-3 opacity-0">
                <button
                  onClick={() => scrollToTarget('#connect')}
                  className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-8px_rgba(255,106,0,0.7)] transition-transform duration-300 hover:scale-105"
                >
                  {hero.primaryCta}
                </button>
                <button
                  onClick={() => scrollToTarget('#works')}
                  aria-label={hero.secondaryCta}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-lg text-white transition-colors hover:border-brand hover:bg-brand"
                >
                  ↗
                </button>
              </div>
            </div>

          </div>

          {/* services strip */}
          <div data-in aria-hidden className="marquee-wrap absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/15 bg-black/30 py-3 opacity-0 backdrop-blur">
            <div className="marquee-track" style={{ ['--marquee-duration' as string]: '32s' }}>
              {[0, 1].map((k) => (
                <div key={k} className="flex shrink-0">
                  {[...services, ...services].map((sv, i) => (
                    <span key={`${k}-${i}`} className="flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                      {sv.title}
                      <span className="mx-8 text-brand">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* soft fade into the About section below */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[22%] bg-gradient-to-t from-[#0b0b0b] to-transparent" />

        {/* transition into the dark About section */}
        <div ref={fade} aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-[#0b0b0b] opacity-0" />
      </div>
    </section>
  );
}
