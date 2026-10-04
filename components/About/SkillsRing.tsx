'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { about } from '@/data/content';
import { useReducedMotion } from '@/lib/hooks';
import { pad2 } from '@/lib/utils';
import SkillDialog from './SkillDialog';
import Portal from '@/components/ui/Portal';
import { SkillLogo } from './skillIcons';

const N = about.skills.length;
const STEP = 360 / N;
const AUTO = 7; // deg / second

/**
 * Skills as a ring of cards that rotates in a circle (CSS 3D).
 * • auto-rotates; pauses on hover/focus and while a card is open
 * • drag (mouse or touch) to spin it; prev / next buttons and card focus snap to a card
 * • click a card to open it (SkillDialog) with a logo for every skill
 * Cards facing away are dimmed and hidden; reduced motion: no auto-rotation.
 */
export default function SkillsRing() {
  const reduced = useReducedMotion();
  const ring = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const s = useRef({ rot: 0, vel: 0, snap: null as number | null, hover: false, drag: false, moved: 0, lastX: 0, open: false, size: 260 });
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [radius, setRadius] = useState(340);
  const [cardW, setCardW] = useState(260);
  const wrap = useRef<HTMLDivElement>(null);

  s.current.open = openIdx !== null;

  // responsive card size / ring radius
  useEffect(() => {
    const fit = () => {
      const w = wrap.current?.clientWidth ?? 800;
      const cw = w < 480 ? 210 : w < 800 ? 250 : 300;
      setCardW(cw);
      setRadius(Math.round((cw / 2 / Math.tan(Math.PI / N)) * 1.5));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // animation loop: rotate + fade cards that face away
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = s.current;
      if (st.snap !== null) {
        st.rot += (st.snap - st.rot) * (1 - Math.exp(-8 * dt));
        if (Math.abs(st.snap - st.rot) < 0.05) {
          st.rot = st.snap;
          st.snap = null;
        }
      } else if (st.drag) {
        /* rotation driven by the pointer */
      } else {
        st.rot += st.vel * dt;
        st.vel += ((reduced || st.hover || st.open ? 0 : AUTO) - st.vel) * (1 - Math.exp(-2.5 * dt)); // ease back to auto speed
      }
      if (ring.current) ring.current.style.transform = `translateZ(${-radius}px) rotateY(${-st.rot}deg)`;
      cards.current.forEach((el, i) => {
        if (!el) return;
        const a = (((i * STEP - st.rot) % 360) + 540) % 360 - 180; // -180..180, 0 = front
        const facing = Math.cos((a * Math.PI) / 180); // 1 front … -1 back
        el.style.opacity = String(Math.max(0, 0.25 + 0.75 * facing));
        el.style.filter = `brightness(${0.55 + 0.45 * Math.max(0, facing)})`;
        el.style.pointerEvents = facing > 0.2 ? 'auto' : 'none';
        el.tabIndex = facing > 0.2 ? 0 : -1;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [radius, reduced]);

  const snapTo = useCallback((i: number) => {
    const st = s.current;
    // shortest way round to card i
    const base = Math.round((st.rot - i * STEP) / 360) * 360 + i * STEP;
    st.snap = base;
    st.vel = 0;
  }, []);
  const nudge = (dir: 1 | -1) => {
    const st = s.current;
    st.snap = (Math.round(st.rot / STEP) + dir) * STEP;
    st.vel = 0;
  };

  // drag to spin
  const onDown = (e: React.PointerEvent) => {
    const st = s.current;
    st.drag = true;
    st.moved = 0;
    st.lastX = e.clientX;
    st.snap = null;
  };
  const onMove = (e: React.PointerEvent) => {
    const st = s.current;
    if (!st.drag) return;
    const dx = e.clientX - st.lastX;
    st.lastX = e.clientX;
    st.moved += Math.abs(dx);
    st.rot -= dx * 0.35;
    st.vel = -dx * 0.35 * 60 * 0.6; // fling
  };
  const end = () => {
    s.current.drag = false;
  };

  return (
    <div>
      <div
        ref={wrap}
        className="relative mx-auto h-[380px] w-full select-none touch-pan-y sm:h-[470px]"
        style={{ perspective: '1400px' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={() => {
          end();
          s.current.hover = false;
        }}
        onPointerEnter={() => (s.current.hover = true)}
        role="group"
        aria-roledescription="carousel"
        aria-label="Skills"
      >
        <div ref={ring} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transformStyle: 'preserve-3d' }}>
          {about.skills.map((g, i) => (
            <button
              key={g.category}
              ref={(el) => void (cards.current[i] = el)}
              onFocus={() => snapTo(i)}
              onClick={() => {
                if (s.current.moved > 8) return; // it was a drag, not a click
                snapTo(i);
                setOpenIdx(i);
              }}
              data-cursor
              aria-haspopup="dialog"
              aria-label={`${g.category}: ${g.items.map((x) => x.name).join(', ')}. Open`}
              className="group absolute flex flex-col justify-between rounded-[1.75rem] border border-white/30 bg-[#0b0b0b] p-5 text-left transition-[border-color,box-shadow] duration-300 hover:border-brand hover:shadow-[0_0_60px_-10px_rgba(255,106,0,0.55)] focus-visible:border-brand focus-visible:outline-none"
              style={{
                width: cardW,
                height: cardW * 1.3,
                left: -cardW / 2,
                top: -(cardW * 1.3) / 2,
                transform: `rotateY(${i * STEP}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
              }}
            >
              <div>
                <span className="font-chunk text-4xl leading-none text-brand">{pad2(i + 1)}</span>
                <h4 className="mt-3 text-xs font-bold uppercase leading-snug tracking-wider text-white sm:text-sm">{g.category}</h4>
              </div>
              <div>
                <ul className="flex flex-wrap gap-2" aria-hidden>
                  {g.items.slice(0, 4).map((it) => (
                    <li key={it.name} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-2">
                      <SkillLogo icon={it.icon} name={it.name} />
                    </li>
                  ))}
                </ul>
                <p className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {g.items.length} {g.items.length === 1 ? 'skill' : 'skills'}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 text-sm transition-all duration-300 group-hover:rotate-45 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                    ↗
                  </span>
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4">
        <button
          onClick={() => nudge(-1)}
          aria-label="Previous skill group"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition-colors hover:border-brand hover:bg-brand"
        >
          <span aria-hidden>←</span>
        </button>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">{about.skillsHint}</p>
        <button
          onClick={() => nudge(1)}
          aria-label="Next skill group"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition-colors hover:border-brand hover:bg-brand"
        >
          <span aria-hidden>→</span>
        </button>
      </div>

      {openIdx !== null && (
        <Portal>
          <SkillDialog group={about.skills[openIdx]} index={openIdx} onClose={() => setOpenIdx(null)} />
        </Portal>
      )}
    </div>
  );
}
