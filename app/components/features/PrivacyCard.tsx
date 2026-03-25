"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { springGentle, smoothEase } from "@/app/lib/motion";

const loopEase = smoothEase;

export default function PrivacyCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  const loopT = {
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
        gap: 32,
        alignItems: "center",
        cursor: "default",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .privacy2-layout { flex-direction: column !important; }
        }
      `}</style>

      {/* Left -- text */}
      <div className="privacy2-layout" style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.3 }}>
          Your Files Never Leave
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          All processing happens in your browser. Files are never uploaded to any server. Close the tab and everything is gone.
        </p>
      </div>

      {/* Right -- SVG illustration */}
      <div style={{ flexShrink: 0 }}>
        <svg
          width="220"
          height="200"
          viewBox="0 0 220 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
          aria-hidden="true"
        >
          {/* Dashed boundary circle */}
          <circle
            cx="110" cy="96" r="78"
            stroke="var(--text-muted)" strokeWidth="1"
            strokeDasharray="5 4" fill="none" opacity="0.35"
          />
          <text
            x="110" y="188" textAnchor="middle" fontSize="9"
            fill="var(--text-muted)" fontFamily="system-ui, sans-serif" opacity="0.5"
          >
            Your Browser
          </text>

          {/* Decorative faint doc -- left */}
          <rect x="28" y="76" width="24" height="30" rx="3" fill="none" stroke="var(--text-muted)" strokeWidth="1" opacity="0.2" />
          <rect x="33" y="83" width="14" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />
          <rect x="33" y="88" width="10" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />
          <rect x="33" y="93" width="12" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />

          {/* Decorative faint doc -- right */}
          <rect x="168" y="76" width="24" height="30" rx="3" fill="none" stroke="var(--text-muted)" strokeWidth="1" opacity="0.2" />
          <rect x="173" y="83" width="14" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />
          <rect x="173" y="88" width="10" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />
          <rect x="173" y="93" width="12" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />

          {/* Glow ellipse behind lock */}
          <defs>
            <filter id="privacy2-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          <motion.ellipse
            cx="110" cy="105" rx="36" ry="30"
            fill="#4ade80"
            filter="url(#privacy2-blur)"
            animate={inView ? { opacity: 0.18 } : { opacity: 0 }}
            transition={loopT}
          />

          {/* Lock body */}
          <motion.rect
            x="82" y="102" width="56" height="50" rx="8"
            fill="var(--bg-tertiary, var(--bg-secondary))"
            stroke="var(--text-muted)" strokeWidth="2"
            animate={
              inView
                ? { filter: "drop-shadow(0 0 8px #4ade80) drop-shadow(0 0 3px #4ade80)", stroke: "#4ade80" }
                : { filter: "none", stroke: "var(--text-muted)" }
            }
            transition={loopT}
          />

          {/* Shackle (U-shape) -- animates translateY */}
          <motion.g
            style={{ transformOrigin: "110px 104px" }}
            animate={inView ? { y: 0 } : { y: -12 }}
            transition={loopT}
          >
            <path
              d="M94 104 L94 82 Q110 64 126 82 L126 104"
              fill="none"
              stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"
            />
          </motion.g>

          {/* Keyhole (visible when unlocked) */}
          <motion.g
            animate={inView ? { opacity: 0 } : { opacity: 0.5 }}
            transition={loopT}
          >
            <circle cx="110" cy="120" r="6" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" />
            <rect x="107.5" y="124" width="5" height="9" rx="1" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" />
          </motion.g>

          {/* Checkmark (visible when locked) */}
          <motion.path
            d="M96 126 L106 136 L126 112"
            fill="none"
            stroke="#4ade80" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="35"
            animate={inView ? { strokeDashoffset: 0, opacity: 1 } : { strokeDashoffset: 35, opacity: 0 }}
            transition={loopT}
          />
        </svg>
      </div>
    </motion.div>
  );
}
