"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, viewportDefault } from "@/app/lib/motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
}

export default function AnimatedSection({
  children,
  className,
  delay = 0,
  stagger = false
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      variants={stagger ? staggerContainer : fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportDefault}
      transition={delay ? { delay } : undefined}
    >
      {stagger ? children : children}
    </motion.div>
  );
}

// For individual items within a stagger container
export function AnimatedItem({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string
}) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}
