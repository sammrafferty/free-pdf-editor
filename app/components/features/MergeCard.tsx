"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { springGentle, smoothEase } from "@/app/lib/motion";

const loopEase = smoothEase;

export default function MergeCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  const mergeTransition = {
    duration: 1.4,
    ease: loopEase,
    repeat: Infinity,
    repeatType: "reverse" as const,
    repeatDelay: 1.5,
  };

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4 }}
      transition={springGentle}
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-primary)",
        borderRadius: 16,
        padding: 32,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 32,
        cursor: "default",
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .merge-card-root { flex-direction: column !important; text-align: center; }
        }
      `}</style>

      {/* Left side -- text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            color: "var(--text-primary)",
            fontSize: 24,
            fontWeight: 700,
            margin: "0 0 12px",
            lineHeight: 1.3,
          }}
        >
          Merge Made Simple
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 15,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Combine multiple PDF files into a single document. Drag to reorder,
          then download your merged file.
        </p>
      </div>

      {/* Right side -- SVG illustration */}
      <div style={{ flexShrink: 0 }}>
        <svg
          width="280"
          height="240"
          viewBox="0 0 280 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Merge-point glow */}
          <motion.ellipse
            cx="140"
            cy="120"
            rx="50"
            ry="70"
            fill="var(--accent-primary)"
            style={{ filter: "blur(18px)" }}
            animate={inView ? { opacity: 0.25 } : { opacity: 0 }}
            transition={mergeTransition}
          />

          {/* Document A (left) */}
          <motion.g
            animate={inView ? { x: 52, y: 10 } : { x: 0, y: 0 }}
            transition={mergeTransition}
          >
            <rect
              x="24" y="50" width="72" height="96" rx="6"
              fill="var(--bg-secondary)"
              stroke="var(--border-primary)" strokeWidth="1.5"
            />
            <path d="M80 50 L96 50 L96 66 Z" fill="var(--border-primary)" opacity="0.3" />
            <path d="M80 50 L80 66 L96 66" fill="none" stroke="var(--border-primary)" strokeWidth="1" opacity="0.5" />
            <rect x="24" y="50" width="72" height="8" rx="6" fill="var(--accent-primary)" opacity="0.25" />
            <rect x="24" y="50" width="72" height="2" rx="1" fill="var(--accent-primary)" opacity="0.5" />
            <rect x="34" y="68" width="40" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="34" y="76" width="50" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
            <rect x="34" y="84" width="35" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.25" />
            <rect x="34" y="92" width="45" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.2" />
            <motion.text
              x="60" y="122" textAnchor="middle" fontSize="13" fontWeight="600"
              fill="var(--text-secondary)"
              animate={inView ? { opacity: 0 } : { opacity: 1 }}
              transition={mergeTransition}
            >
              A
            </motion.text>
          </motion.g>

          {/* Document B (center) */}
          <g>
            <rect
              x="104" y="38" width="72" height="96" rx="6"
              fill="var(--bg-secondary)"
              stroke="var(--border-primary)" strokeWidth="1.5"
            />
            <path d="M160 38 L176 38 L176 54 Z" fill="var(--border-primary)" opacity="0.3" />
            <path d="M160 38 L160 54 L176 54" fill="none" stroke="var(--border-primary)" strokeWidth="1" opacity="0.5" />
            <rect x="104" y="38" width="72" height="8" rx="6" fill="var(--accent-primary)" opacity="0.35" />
            <rect x="104" y="38" width="72" height="2" rx="1" fill="var(--accent-primary)" opacity="0.6" />
            <rect x="114" y="56" width="44" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="114" y="64" width="50" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
            <rect x="114" y="72" width="38" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.25" />
            <rect x="114" y="80" width="48" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.2" />
            <motion.text
              x="140" y="112" textAnchor="middle" fontSize="13" fontWeight="600"
              fill="var(--text-secondary)"
              animate={inView ? { opacity: 0 } : { opacity: 1 }}
              transition={mergeTransition}
            >
              B
            </motion.text>
          </g>

          {/* Document C (right) */}
          <motion.g
            animate={inView ? { x: -52, y: -10 } : { x: 0, y: 0 }}
            transition={mergeTransition}
          >
            <rect
              x="184" y="50" width="72" height="96" rx="6"
              fill="var(--bg-secondary)"
              stroke="var(--border-primary)" strokeWidth="1.5"
            />
            <path d="M240 50 L256 50 L256 66 Z" fill="var(--border-primary)" opacity="0.3" />
            <path d="M240 50 L240 66 L256 66" fill="none" stroke="var(--border-primary)" strokeWidth="1" opacity="0.5" />
            <rect x="184" y="50" width="72" height="8" rx="6" fill="var(--accent-primary)" opacity="0.2" />
            <rect x="184" y="50" width="72" height="2" rx="1" fill="var(--accent-primary)" opacity="0.45" />
            <rect x="194" y="68" width="42" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="194" y="76" width="50" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
            <rect x="194" y="84" width="36" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.25" />
            <rect x="194" y="92" width="46" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.2" />
            <motion.text
              x="220" y="122" textAnchor="middle" fontSize="13" fontWeight="600"
              fill="var(--text-secondary)"
              animate={inView ? { opacity: 0 } : { opacity: 1 }}
              transition={mergeTransition}
            >
              C
            </motion.text>
          </motion.g>

          {/* Merged label */}
          <motion.text
            x="140" y="175" textAnchor="middle" fontSize="14" fontWeight="700"
            fill="var(--accent-primary)"
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={mergeTransition}
          >
            A + B + C
          </motion.text>
        </svg>
      </div>
    </motion.div>
  );
}
