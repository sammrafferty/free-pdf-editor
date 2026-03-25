"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { springGentle, smoothEase } from "@/app/lib/motion";

const loopEase = smoothEase;

export default function SplitCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  const pageTransition = {
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
        flexDirection: "column",
        gap: 32,
        cursor: "default",
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .split-card-inner {
            flex-direction: row !important;
          }
        }
      `}</style>

      <div
        className="split-card-inner"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
          alignItems: "center",
        }}
      >
        {/* Left side -- text */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <h3
            style={{
              color: "var(--text-primary)",
              fontSize: 24,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Split in Seconds
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 15,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Extract specific pages or break a PDF into multiple files. Select
            your ranges and download instantly.
          </p>
        </div>

        {/* Right side -- illustration */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="280"
            height="240"
            viewBox="0 0 280 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
          >
            {/* Page 1 (left, behind) */}
            <motion.g
              style={{ transformOrigin: "140px 120px" }}
              animate={
                inView
                  ? { x: -30, y: -8, rotate: -8 }
                  : { x: 0, y: 0, rotate: 0 }
              }
              transition={pageTransition}
            >
              <rect
                x="60"
                y="30"
                width="100"
                height="130"
                rx="6"
                fill="var(--bg-secondary)"
                stroke="var(--border-primary)"
                strokeWidth="1.5"
              />
              <line x1="74" y1="58" x2="140" y2="58" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="74" y1="70" x2="130" y2="70" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="74" y1="82" x2="136" y2="82" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="74" y1="94" x2="120" y2="94" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <text
                x="107"
                y="148"
                textAnchor="middle"
                style={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "inherit" }}
              >
                1
              </text>
            </motion.g>

            {/* Page 2 (center, middle) */}
            <g
              style={{ transformOrigin: "140px 120px" }}
            >
              <rect
                x="90"
                y="40"
                width="100"
                height="130"
                rx="6"
                fill="var(--bg-secondary)"
                stroke="var(--border-primary)"
                strokeWidth="1.5"
              />
              <line x1="104" y1="68" x2="170" y2="68" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="104" y1="80" x2="160" y2="80" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="104" y1="92" x2="166" y2="92" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="104" y1="104" x2="148" y2="104" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="104" y1="116" x2="155" y2="116" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <text
                x="140"
                y="158"
                textAnchor="middle"
                style={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "inherit" }}
              >
                2
              </text>
            </g>

            {/* Page 3 (right, front) */}
            <motion.g
              style={{ transformOrigin: "140px 120px" }}
              animate={
                inView
                  ? { x: 30, y: 8, rotate: 8 }
                  : { x: 0, y: 0, rotate: 0 }
              }
              transition={pageTransition}
            >
              <rect
                x="120"
                y="50"
                width="100"
                height="130"
                rx="6"
                fill="var(--bg-secondary)"
                stroke="var(--border-primary)"
                strokeWidth="1.5"
              />
              <line x1="134" y1="78" x2="200" y2="78" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="134" y1="90" x2="190" y2="90" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="134" y1="102" x2="196" y2="102" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              <text
                x="170"
                y="168"
                textAnchor="middle"
                style={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "inherit" }}
              >
                3
              </text>
            </motion.g>

            {/* Split indicator dashed line */}
            <motion.g
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, ease: loopEase }}
            >
              <line
                x1="100"
                y1="195"
                x2="180"
                y2="195"
                stroke="var(--accent-primary)"
                strokeWidth="1"
                strokeDasharray="4 3"
                strokeLinecap="round"
              />
            </motion.g>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
