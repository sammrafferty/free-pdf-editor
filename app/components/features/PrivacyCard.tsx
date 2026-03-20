"use client";

import { useState } from "react";

export default function PrivacyCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-primary)",
        borderRadius: 16,
        padding: 32,
        display: "flex",
        flexDirection: "row",
        gap: 32,
        alignItems: "center",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "default",
      }}
    >
      {/* Left side — text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            color: "var(--text-primary)",
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 12px 0",
            lineHeight: 1.3,
          }}
        >
          Your Files Never Leave
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 15,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          All processing happens in your browser. Files are never uploaded to
          any server. Close the tab and everything is gone.
        </p>
      </div>

      {/* Right side — SVG illustration */}
      <div style={{ flexShrink: 0 }}>
        <svg
          width="280"
          height="240"
          viewBox="0 0 280 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          {/* --- Dashed boundary --- */}
          <rect
            x="30"
            y="20"
            width="160"
            height="160"
            rx="12"
            stroke={hovered ? "var(--accent-primary)" : "var(--text-muted)"}
            strokeWidth="1.5"
            strokeDasharray="6 4"
            fill="none"
            style={{
              transition: "stroke 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: hovered
                ? "drop-shadow(0 0 6px var(--accent-primary))"
                : "none",
            }}
          />
          <text
            x="110"
            y="192"
            textAnchor="middle"
            style={{
              fontSize: 10,
              fill: "var(--text-muted)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Your Browser
          </text>

          {/* --- Browser window frame --- */}
          <rect
            x="50"
            y="42"
            width="120"
            height="115"
            rx="8"
            fill="var(--bg-secondary)"
            stroke="var(--border-primary)"
            strokeWidth="1.5"
          />
          {/* Title bar background */}
          <rect
            x="50"
            y="42"
            width="120"
            height="22"
            rx="8"
            fill="var(--bg-secondary)"
            stroke="var(--border-primary)"
            strokeWidth="1.5"
          />
          <rect
            x="50"
            y="56"
            width="120"
            height="8"
            fill="var(--bg-secondary)"
          />
          {/* Traffic light dots */}
          <circle cx="64" cy="53" r="3" fill="#ff5f57" />
          <circle cx="74" cy="53" r="3" fill="#febc2e" />
          <circle cx="84" cy="53" r="3" fill="#28c840" />

          {/* --- Document icon inside browser --- */}
          <rect
            x="75"
            y="78"
            width="32"
            height="40"
            rx="3"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
          />
          {/* Doc fold corner */}
          <path
            d="M97 78 L107 88 L97 88 Z"
            fill="var(--bg-secondary)"
            stroke="var(--text-muted)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Doc lines */}
          <line
            x1="81"
            y1="94"
            x2="101"
            y2="94"
            stroke="var(--text-muted)"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="81"
            y1="100"
            x2="97"
            y2="100"
            stroke="var(--text-muted)"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="81"
            y1="106"
            x2="99"
            y2="106"
            stroke="var(--text-muted)"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* --- Shield / lock icon --- */}
          <g
            style={{
              transition: "filter 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: hovered
                ? "drop-shadow(0 0 8px #4ade80) drop-shadow(0 0 4px #4ade80)"
                : "none",
            }}
          >
            <path
              d="M130 90 L130 80 C130 80 138 74 146 80 L146 90 C146 98 138 104 138 104 C138 104 130 98 130 90Z"
              fill="none"
              stroke="#4ade80"
              strokeWidth="1.8"
              style={{
                transition:
                  "stroke-width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                strokeWidth: hovered ? 2.4 : 1.8,
              }}
            />
            {/* Checkmark inside shield */}
            <path
              d="M134 89 L137 92 L143 84"
              fill="none"
              stroke="#4ade80"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* --- Cloud/server icons outside boundary with X marks --- */}

          {/* Cloud 1 — top right */}
          <g
            style={{
              opacity: hovered ? 0.3 : 0.5,
              transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <path
              d="M222 60 C222 52 230 48 236 52 C238 44 250 44 252 52 C258 52 262 58 258 64 L224 64 C220 64 218 60 222 60Z"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.3"
            />
            {/* X mark */}
            <line
              x1="232"
              y1="50"
              x2="250"
              y2="68"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="250"
              y1="50"
              x2="232"
              y2="68"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Cloud 2 — middle right */}
          <g
            style={{
              opacity: hovered ? 0.3 : 0.5,
              transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <path
              d="M218 120 C218 112 226 108 232 112 C234 104 246 104 248 112 C254 112 258 118 254 124 L220 124 C216 124 214 120 218 120Z"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.3"
            />
            {/* X mark */}
            <line
              x1="228"
              y1="110"
              x2="246"
              y2="128"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="246"
              y1="110"
              x2="228"
              y2="128"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Server icon — bottom right */}
          <g
            style={{
              opacity: hovered ? 0.3 : 0.5,
              transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <rect
              x="228"
              y="170"
              width="32"
              height="12"
              rx="2"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.3"
            />
            <rect
              x="228"
              y="184"
              width="32"
              height="12"
              rx="2"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.3"
            />
            <rect
              x="228"
              y="198"
              width="32"
              height="12"
              rx="2"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.3"
            />
            {/* Server dots */}
            <circle cx="234" cy="176" r="1.5" fill="var(--text-muted)" />
            <circle cx="234" cy="190" r="1.5" fill="var(--text-muted)" />
            <circle cx="234" cy="204" r="1.5" fill="var(--text-muted)" />
            {/* X mark */}
            <line
              x1="232"
              y1="170"
              x2="256"
              y2="210"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="256"
              y1="170"
              x2="232"
              y2="210"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Dashed arrow from browser toward clouds (blocked) */}
          <line
            x1="190"
            y1="100"
            x2="215"
            y2="100"
            stroke="var(--text-muted)"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.4"
          />
        </svg>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 640px) {
          .group {
            flex-direction: column !important;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
