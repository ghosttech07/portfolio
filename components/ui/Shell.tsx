'use client';

import { useCallback, useEffect, useState } from 'react';
import SmoothScroll from './SmoothScroll';
import Cursor from './Cursor';
import Loader from './Loader';
import Nav from './Nav';
import Menu from './Menu';
import Hero3D, { type RevealMode } from '@/components/Hero3D/Hero3D';
import { lockScroll, setPhase, unlockScroll } from '@/lib/scroll';

/**
 * Client-side app shell: global effects (smooth scroll, cursor, menu), the
 * loading screen and the 3D hero. All later sections are
 * passed in as `children`.
 */
export default function Shell({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [reveal, setReveal] = useState<RevealMode>('pending');

  // Lock scrolling + flag the phase as early as possible.
  useEffect(() => {
    setPhase('loading');
    lockScroll();
    // Balanced cleanup keeps the lock count correct under React StrictMode's double-mount.
    return () => unlockScroll();
  }, []);

  // Loading screen finished → unlock scrolling and let the hero animate in.
  const onLoaded = useCallback(() => {
    setLoaded(true);
    setPhase('ready');
    unlockScroll();
    setReveal('animate');
  }, []);

  return (
    <SmoothScroll>
      <Cursor />
      <Nav />
      <Menu />
      <Loader onComplete={onLoaded} />
      <Hero3D reveal={reveal} ready={loaded} />
      {children}
    </SmoothScroll>
  );
}
