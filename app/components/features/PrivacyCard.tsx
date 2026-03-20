"use client";

export default function PrivacyCard() {
  return (
    <div
      className="group"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-primary)",
        borderRadius: 16,
        padding: 32,
        display: "flex",
        flexDirection: "row",
        gap: 32,
        alignItems: "center",
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "default",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <style>{`
        @media (max-width: 768px) {
          .privacy2-layout { flex-direction: column !important; }
        }

        /* ── Shackle closes ── */
        .privacy2-shackle {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes privacy2-shackle-close {
          0%, 18%  { transform: translateY(-12px); }
          25%, 92% { transform: translateY(0px); }
          100%     { transform: translateY(-12px); }
        }
        .in-view .privacy2-shackle {
          animation: privacy2-shackle-close 5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .group:hover .privacy2-shackle {
          transform: translateY(0px);
          animation: none;
        }

        /* ── Lock body glow ── */
        .privacy2-lock-body {
          transition: filter 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      stroke 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes privacy2-lock-glow {
          0%, 22%  { filter: none; stroke: var(--text-muted); }
          30%, 92% { filter: drop-shadow(0 0 8px #4ade80) drop-shadow(0 0 3px #4ade80); stroke: #4ade80; }
          100%     { filter: none; stroke: var(--text-muted); }
        }
        .in-view .privacy2-lock-body {
          animation: privacy2-lock-glow 5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .group:hover .privacy2-lock-body {
          filter: drop-shadow(0 0 8px #4ade80) drop-shadow(0 0 3px #4ade80);
          stroke: #4ade80 !important;
          animation: none;
        }

        /* ── Checkmark draws in ── */
        .privacy2-checkmark {
          stroke-dasharray: 35;
          stroke-dashoffset: 35;
          opacity: 0;
          transition: stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.3s ease;
        }
        @keyframes privacy2-check-draw {
          0%, 28%  { stroke-dashoffset: 35; opacity: 0; }
          40%, 88% { stroke-dashoffset: 0;  opacity: 1; }
          96%, 100%{ stroke-dashoffset: 35; opacity: 0; }
        }
        .in-view .privacy2-checkmark {
          animation: privacy2-check-draw 5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .group:hover .privacy2-checkmark {
          stroke-dashoffset: 0;
          opacity: 1;
          animation: none;
        }

        /* ── Background glow ellipse ── */
        .privacy2-glow {
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        @keyframes privacy2-glow-pulse {
          0%, 24%  { opacity: 0; }
          32%, 88% { opacity: 0.18; }
          96%, 100%{ opacity: 0; }
        }
        .in-view .privacy2-glow {
          animation: privacy2-glow-pulse 5s ease-in-out infinite;
        }
        .group:hover .privacy2-glow {
          opacity: 0.18;
          animation: none;
        }

        /* ── Keyhole hides, checkmark shown — keyhole dims on lock ── */
        .privacy2-keyhole {
          transition: opacity 0.5s ease;
        }
        @keyframes privacy2-keyhole-hide {
          0%, 24%  { opacity: 0.5; }
          32%, 96% { opacity: 0; }
          100%     { opacity: 0.5; }
        }
        .in-view .privacy2-keyhole {
          animation: privacy2-keyhole-hide 5s ease-in-out infinite;
        }
        .group:hover .privacy2-keyhole {
          opacity: 0;
          animation: none;
        }
      `}</style>

      {/* Left — text */}
      <div className="privacy2-layout" style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ color: "var(--text-primary)", fontSize: 22, fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.3 }}>
          Your Files Never Leave
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          All processing happens in your browser. Files are never uploaded to any server. Close the tab and everything is gone.
        </p>
      </div>

      {/* Right — SVG illustration */}
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
          {/* Dashed boundary circle labeled "Your Browser" */}
          <circle
            cx="110"
            cy="96"
            r="78"
            stroke="var(--text-muted)"
            strokeWidth="1"
            strokeDasharray="5 4"
            fill="none"
            opacity="0.35"
          />
          <text
            x="110"
            y="188"
            textAnchor="middle"
            fontSize="9"
            fill="var(--text-muted)"
            fontFamily="system-ui, sans-serif"
            opacity="0.5"
          >
            Your Browser
          </text>

          {/* Decorative faint doc — left */}
          <rect x="28" y="76" width="24" height="30" rx="3" fill="none" stroke="var(--text-muted)" strokeWidth="1" opacity="0.2" />
          <rect x="33" y="83" width="14" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />
          <rect x="33" y="88" width="10" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />
          <rect x="33" y="93" width="12" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />

          {/* Decorative faint doc — right */}
          <rect x="168" y="76" width="24" height="30" rx="3" fill="none" stroke="var(--text-muted)" strokeWidth="1" opacity="0.2" />
          <rect x="173" y="83" width="14" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />
          <rect x="173" y="88" width="10" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />
          <rect x="173" y="93" width="12" height="2" rx="1" fill="var(--text-muted)" opacity="0.15" />

          {/* Glow ellipse behind lock */}
          <ellipse
            className="privacy2-glow"
            cx="110"
            cy="105"
            rx="36"
            ry="30"
            fill="#4ade80"
            filter="url(#privacy2-blur)"
          />
          <defs>
            <filter id="privacy2-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>

          {/* Lock body */}
          <rect
            className="privacy2-lock-body"
            x="82"
            y="102"
            width="56"
            height="50"
            rx="8"
            fill="var(--bg-tertiary, var(--bg-secondary))"
            stroke="var(--text-muted)"
            strokeWidth="2"
          />

          {/* Shackle (U-shape) — animates translateY */}
          <g className="privacy2-shackle" style={{ transformOrigin: "110px 104px" }}>
            <path
              d="M94 104 L94 82 Q110 64 126 82 L126 104"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Keyhole (visible when unlocked) */}
          <g className="privacy2-keyhole">
            <circle cx="110" cy="120" r="6" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" />
            <rect x="107.5" y="124" width="5" height="9" rx="1" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" />
          </g>

          {/* Checkmark (visible when locked) */}
          <path
            className="privacy2-checkmark"
            d="M96 126 L106 136 L126 112"
            fill="none"
            stroke="#4ade80"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
