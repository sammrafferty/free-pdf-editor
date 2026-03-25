"use client";

import { type Variants, type Transition } from "framer-motion";

/* ═══════════════════════════════════════════════════════
   SHARED ANIMATION PRESETS — Premium, polished feel
   ═══════════════════════════════════════════════════════ */

// Signature easing — smooth deceleration with slight overshoot
export const ease = [0.16, 1, 0.3, 1] as const;
export const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Spring presets
export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 24,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

// Alias used by Dropzone
export const springSnap = springSnappy;

export const springModal: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 25,
  mass: 0.8,
};

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
};

export const entranceTransition: Transition = {
  duration: 0.5,
  ease: smoothEase,
};

export const loopTransition = (duration = 1.4, delay = 1.5): Transition => ({
  duration,
  ease: smoothEase,
  repeat: Infinity,
  repeatType: "reverse",
  repeatDelay: delay,
});

/* ── Reusable Variants ── */

// Fade up — replaces heroEntrance keyframe
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

// Fade in — subtle, no movement
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease },
  },
};

// Scale in — for thumbnails, badges
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease },
  },
};

// Slide up — for modals, toasts
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease },
  },
};

/* ── Stagger Containers ── */

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

/* ── Page Transition ── */

export const pageTransition: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease },
  },
};

/* ── Hover Presets (for whileHover prop) ── */

export const hoverLift = {
  y: -3,
  transition: springGentle,
};

export const hoverLiftSubtle = {
  y: -2,
  transition: springGentle,
};

export const hoverScale = {
  scale: 1.03,
  transition: springGentle,
};

/* ── Scroll-triggered animation defaults ── */

export const viewportOnce = { once: true, amount: 0.3 } as const;
export const viewportDefault = { once: true, amount: 0.2 } as const;
