'use client';

// animation-engine.tsx
// ────────────────────────────────────────────────────────────────────────
// Shared time/easing engine for the PDF animation scenes.
// Each scene calls useSceneTime(durationSec) and gets back the current
// playhead in seconds (loops). Pauses when the scene's container is
// offscreen (IntersectionObserver).

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// ─── Easing ──────────────────────────────────────────────────────────────
export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// ─── Scene time context ──────────────────────────────────────────────────
const SceneTimeContext = createContext<number>(0);
export const useTime = () => useContext(SceneTimeContext);

// ─── SceneHost — wraps a scene, drives its clock, pauses offscreen ──────
export function SceneHost({
  duration,
  children,
  className,
  pauseOffscreen = true,
}: {
  duration: number;
  children: ReactNode;
  className?: string;
  pauseOffscreen?: boolean;
}) {
  const [time, setTime] = useState(0);
  const [visible, setVisible] = useState(!pauseOffscreen);
  const [reducedMotion, setReducedMotion] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // IntersectionObserver for offscreen pause
  useEffect(() => {
    if (!pauseOffscreen || !hostRef.current) return;
    const el = hostRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setVisible(e.isIntersecting);
      },
      { threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pauseOffscreen]);

  // RAF loop
  useEffect(() => {
    const playing = visible && !reducedMotion;
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) next = next % duration;
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [visible, reducedMotion, duration]);

  // With reduced-motion, freeze on a nice frame (~60% through)
  const effectiveTime = reducedMotion ? duration * 0.6 : time;

  return (
    <div ref={hostRef} className={className}>
      <SceneTimeContext.Provider value={effectiveTime}>
        {children}
      </SceneTimeContext.Provider>
    </div>
  );
}
