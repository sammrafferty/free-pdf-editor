"use client";

export default function PrivacyCard() {
  return (
    <div
      className="group"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
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

      {/* Right side — SVG padlock illustration */}
      <div style={{ flexShrink: 0 }}>
        <svg
          width="220"
          height="200"
          viewBox="0 0 220 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
          aria-label="Padlock illustration — files stay in your browser"
        >
          <style>{`
            /* ── Looping lock animation (triggered by .in-view on parent section) ── */
            @keyframes privacy2-shackle-close {
              0%, 20%   { transform: translateY(-12px); }
              25%, 95%  { transform: translateY(0); }
              100%      { transform: translateY(-12px); }
            }
            @keyframes privacy2-lock-glow {
              0%, 44%   { filter: none; }
              50%, 95%  { filter: drop-shadow(0 0 8px #4ade80) drop-shadow(0 0 3px #4ade80); }
              100%      { filter: none; }
            }
            @keyframes privacy2-check-draw {
              0%, 44%   { stroke-dashoffset: 30; opacity: 0; }
              55%, 95%  { stroke-dashoffset: 0; opacity: 1; }
              100%      { stroke-dashoffset: 30; opacity: 0; }
            }
            @keyframes privacy2-glow-pulse {
              0%, 44%   { opacity: 0; }
              55%, 95%  { opacity: 0.18; }
              100%      { opacity: 0; }
            }

            .in-view .privacy2-shackle {
              animation: privacy2-shackle-close 4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
            }
            .in-view .privacy2-lock-body {
              animation: privacy2-lock-glow 4s ease-in-out infinite;
            }
            .in-view .privacy2-checkmark {
              animation: privacy2-check-draw 4s ease-in-out infinite;
            }
            .in-view .privacy2-glow {
              animation: privacy2-glow-pulse 4s ease-in-out infinite;
            }

            /* ── Hover: immediately show locked/glowing state ── */
            .group:hover .privacy2-shackle {
              transform: translateY(0);
              animation: none;
            }
            .group:hover .privacy2-lock-body {
              filter: drop-shadow(0 0 8px #4ade80) drop-shadow(0 0 3px #4ade80);
              animation: none;
            }
            .group:hover .privacy2-checkmark {
              stroke-dashoffset: 0;
              opacity: 1;
              animation: none;
            }
            .group:hover .privacy2-glow {
              opacity: 0.18;
              animation: none;
            }
          `}</style>

          {/* Faint dashed boundary circle — "your browser" zone */}
          <circle
            cx="110"
            cy="110"
            r="80"
            stroke="var(--border-primary)"
            strokeWidth="1.2"
            strokeDasharray="5 4"
            fill="none"
            opacity="0.6"
          />
          <text
            x="110"
            y="198"
            textAnchor="middle"
            style={{
              fontSize: 9,
              fill: "var(--text-muted)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Your Browser
          </text>

          {/* Glow ellipse behind lock body */}
          <ellipse
            cx="130"
            cy="130"
            rx="38"
            ry="32"
            fill="#4ade80"
            className="privacy2-glow"
            style={{ opacity: 0 }}
          />

          {/* Decorative faint document — left of lock */}
          <rect
            x="42"
            y="100"
            width="22"
            height="28"
            rx="3"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1"
            opacity="0.25"
          />
          <line x1="47" y1="109" x2="59" y2="109" stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.2" />
          <line x1="47" y1="114" x2="57" y2="114" stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.2" />
          <line x1="47" y1="119" x2="59" y2="119" stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.2" />

          {/* Decorative faint document — right of lock */}
          <rect
            x="158"
            y="108"
            width="22"
            height="28"
            rx="3"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1"
            opacity="0.25"
          />
          <line x1="163" y1="117" x2="175" y2="117" stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.2" />
          <line x1="163" y1="122" x2="173" y2="122" stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.2" />
          <line x1="163" y1="127" x2="175" y2="127" stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.2" />

          {/* Shackle (U-shape above lock body) */}
          <path
            d="M115 100 L115 78 Q130 62 145 78 L145 100"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="privacy2-shackle"
            style={{
              transformOrigin: "130px 100px",
              transform: "translateY(-12px)",
            }}
          />

          {/* Lock body */}
          <rect
            x="100"
            y="100"
            width="60"
            height="55"
            rx="8"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            className="privacy2-lock-body"
          />

          {/* Keyhole — small circle + teardrop */}
          <circle
            cx="130"
            cy="120"
            r="5"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            opacity="0.5"
          />
          <line
            x1="130"
            y1="125"
            x2="130"
            y2="134"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Checkmark (revealed when locked) */}
          <path
            d="M118 127 L127 136 L142 118"
            fill="none"
            stroke="#4ade80"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="30"
            strokeDashoffset="30"
            className="privacy2-checkmark"
            style={{ opacity: 0 }}
          />
        </svg>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 640px) {
          .privacy-card-inner {
            flex-direction: column !important;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
