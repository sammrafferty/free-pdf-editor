"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/app/lib/motion";

interface Props {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}

/**
 * Lightweight client wrapper that fades-up content when it scrolls into view.
 * Replaces the CSS-only `hero-animate` class with Framer Motion `whileInView`.
 */
export default function AnimatedSection({ children, className, style, delay = 0 }: Props) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
