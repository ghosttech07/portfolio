'use client';

import { useRef } from 'react';
import ScrambleHeading from './ScrambleHeading';
import MagneticButton from './MagneticButton';
import ContactForm from './ContactForm';
import SceneScroll from '@/components/ui/SceneScroll';
import { copy, socials } from '@/data/content';
import { useReveal } from '@/lib/hooks';

/**
 * SECTION — LET'S GET IN TOUCH: light background. Left: scrambling chunky heading, email, magnetic 3D social buttons. Right: the form.
 */
export default function Connect() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  const email = socials.find((s) => s.id === 'email')!;

  return (
    <section
      id="connect"
      ref={root}
      className="relative z-10 overflow-hidden bg-[#f3f3f1] px-5 pb-40 pt-20 text-ink sm:px-10 sm:pb-52 sm:pt-28"
    >
      <SceneScroll trigger={root} exit={false}>
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-stretch lg:gap-20">
        <div className="relative">
          <div className="relative z-10 flex h-full flex-col">
            <ScrambleHeading
              lines={copy.connectTitle}
              className="font-chunk text-[clamp(2.4rem,6.3vw,5.6rem)] uppercase leading-[0.95]"
            />
            <a
              data-rise
              href={email.href}
              className="mt-6 inline-block text-lg font-semibold underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand sm:text-2xl"
            >
              {email.handle}
            </a>
            <p data-rise className="mt-4 max-w-sm text-sm text-ink/60">
              {copy.connectLead}
            </p>
            <div data-rise className="mt-10 flex flex-wrap gap-4 lg:mt-auto lg:pt-10">
              {socials.map((s) => (
                <MagneticButton key={s.id} social={s} />
              ))}
            </div>
          </div>
        </div>

        <div data-rise className="lg:h-full">
          <ContactForm />
        </div>
      </div>
      </SceneScroll>
    </section>
  );
}
