"use client";

export default function MergeCard() {
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
        alignItems: "center",
        gap: 32,
        transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow =
          "0 12px 40px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Left side — text */}
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

      {/* Right side — SVG illustration */}
      <div style={{ flexShrink: 0 }}>
        <svg
          width="280"
          height="240"
          viewBox="0 0 280 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <style>{`
            .doc-a,
            .doc-b,
            .doc-c,
            .merged-label,
            .merge-glow {
              transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .doc-a { transform: translate(0, 0); }
            .doc-b { transform: translate(0, 0); }
            .doc-c { transform: translate(0, 0); }
            .merged-label { opacity: 0; }
            .merge-glow { opacity: 0; }

            /* Existing hover CSS — unchanged */
            .group:hover .doc-a { transform: translate(52px, 10px); }
            .group:hover .doc-b { transform: translate(0, 0); }
            .group:hover .doc-c { transform: translate(-52px, -10px); }
            .group:hover .merged-label { opacity: 1; }
            .group:hover .merge-glow { opacity: 1; }

            .label-a,
            .label-b,
            .label-c {
              transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .group:hover .label-a,
            .group:hover .label-b,
            .group:hover .label-c {
              opacity: 0;
            }

            /* Loop keyframes */
            @keyframes merge-loop-docA {
              0%   { transform: translate(0px, 0px); }
              20%  { transform: translate(0px, 0px); }
              40%  { transform: translate(52px, 10px); }
              55%  { transform: translate(52px, 10px); }
              80%  { transform: translate(52px, 10px); }
              100% { transform: translate(0px, 0px); }
            }

            @keyframes merge-loop-docC {
              0%   { transform: translate(0px, 0px); }
              20%  { transform: translate(0px, 0px); }
              40%  { transform: translate(-52px, -10px); }
              55%  { transform: translate(-52px, -10px); }
              80%  { transform: translate(-52px, -10px); }
              100% { transform: translate(0px, 0px); }
            }

            @keyframes merge-loop-glow {
              0%   { opacity: 0; }
              20%  { opacity: 0; }
              40%  { opacity: 1; }
              55%  { opacity: 1; }
              80%  { opacity: 1; }
              100% { opacity: 0; }
            }

            @keyframes merge-loop-labels {
              0%   { opacity: 1; }
              20%  { opacity: 1; }
              35%  { opacity: 0; }
              80%  { opacity: 0; }
              100% { opacity: 1; }
            }

            @keyframes merge-loop-merged-label {
              0%   { opacity: 0; }
              20%  { opacity: 0; }
              40%  { opacity: 1; }
              55%  { opacity: 1; }
              80%  { opacity: 1; }
              100% { opacity: 0; }
            }

            /* In-view loop animations */
            .in-view .merge-doc-a {
              animation: merge-loop-docA 4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
            }
            .in-view .merge-doc-c {
              animation: merge-loop-docC 4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
            }
            .in-view .merge-glow-loop {
              animation: merge-loop-glow 4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
            }
            .in-view .label-a,
            .in-view .label-b,
            .in-view .label-c {
              animation: merge-loop-labels 4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
            }
            .in-view .merge-loop-merged {
              animation: merge-loop-merged-label 4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
            }

            /* Hover overrides loop */
            .group:hover .merge-doc-a,
            .group:hover .merge-doc-c {
              animation: none !important;
            }
            .group:hover .merge-glow-loop {
              animation: none !important;
            }
            .group:hover .label-a,
            .group:hover .label-b,
            .group:hover .label-c {
              animation: none !important;
              opacity: 0 !important;
            }
            .group:hover .merge-loop-merged {
              animation: none !important;
              opacity: 1 !important;
            }
          `}</style>

          {/* Merge-point glow — loop version (separate from hover .merge-glow) */}
          <ellipse
            className="merge-glow-loop"
            cx="140"
            cy="120"
            rx="50"
            ry="70"
            fill="var(--accent-primary)"
            opacity="0"
            style={{ filter: "blur(18px)" }}
          />

          {/* Merge-point glow — hover version */}
          <ellipse
            className="merge-glow"
            cx="140"
            cy="120"
            rx="50"
            ry="70"
            fill="var(--accent-primary)"
            opacity="0"
            style={{ filter: "blur(18px)" }}
          />

          {/* Document A (left) */}
          <g className="doc-a merge-doc-a">
            <rect
              x="24"
              y="50"
              width="72"
              height="96"
              rx="6"
              fill="var(--bg-secondary)"
              stroke="var(--border-primary)"
              strokeWidth="1.5"
            />
            {/* Folded corner */}
            <path
              d="M80 50 L96 50 L96 66 Z"
              fill="var(--border-primary)"
              opacity="0.3"
            />
            <path
              d="M80 50 L80 66 L96 66"
              fill="none"
              stroke="var(--border-primary)"
              strokeWidth="1"
              opacity="0.5"
            />
            {/* Accent strip */}
            <rect
              x="24"
              y="50"
              width="72"
              height="8"
              rx="6"
              fill="var(--accent-primary)"
              opacity="0.25"
            />
            <rect x="24" y="50" width="72" height="2" rx="1" fill="var(--accent-primary)" opacity="0.5" />
            {/* Text lines */}
            <rect x="34" y="68" width="40" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="34" y="76" width="50" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
            <rect x="34" y="84" width="35" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.25" />
            <rect x="34" y="92" width="45" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.2" />
            {/* Label */}
            <text
              className="label-a"
              x="60"
              y="122"
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="var(--text-secondary)"
            >
              A
            </text>
          </g>

          {/* Document B (center) */}
          <g className="doc-b">
            <rect
              x="104"
              y="38"
              width="72"
              height="96"
              rx="6"
              fill="var(--bg-secondary)"
              stroke="var(--border-primary)"
              strokeWidth="1.5"
            />
            <path
              d="M160 38 L176 38 L176 54 Z"
              fill="var(--border-primary)"
              opacity="0.3"
            />
            <path
              d="M160 38 L160 54 L176 54"
              fill="none"
              stroke="var(--border-primary)"
              strokeWidth="1"
              opacity="0.5"
            />
            <rect
              x="104"
              y="38"
              width="72"
              height="8"
              rx="6"
              fill="var(--accent-primary)"
              opacity="0.35"
            />
            <rect x="104" y="38" width="72" height="2" rx="1" fill="var(--accent-primary)" opacity="0.6" />
            <rect x="114" y="56" width="44" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="114" y="64" width="50" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
            <rect x="114" y="72" width="38" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.25" />
            <rect x="114" y="80" width="48" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.2" />
            <text
              className="label-b"
              x="140"
              y="112"
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="var(--text-secondary)"
            >
              B
            </text>
          </g>

          {/* Document C (right) */}
          <g className="doc-c merge-doc-c">
            <rect
              x="184"
              y="50"
              width="72"
              height="96"
              rx="6"
              fill="var(--bg-secondary)"
              stroke="var(--border-primary)"
              strokeWidth="1.5"
            />
            <path
              d="M240 50 L256 50 L256 66 Z"
              fill="var(--border-primary)"
              opacity="0.3"
            />
            <path
              d="M240 50 L240 66 L256 66"
              fill="none"
              stroke="var(--border-primary)"
              strokeWidth="1"
              opacity="0.5"
            />
            <rect
              x="184"
              y="50"
              width="72"
              height="8"
              rx="6"
              fill="var(--accent-primary)"
              opacity="0.2"
            />
            <rect x="184" y="50" width="72" height="2" rx="1" fill="var(--accent-primary)" opacity="0.45" />
            <rect x="194" y="68" width="42" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="194" y="76" width="50" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
            <rect x="194" y="84" width="36" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.25" />
            <rect x="194" y="92" width="46" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.2" />
            <text
              className="label-c"
              x="220"
              y="122"
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="var(--text-secondary)"
            >
              C
            </text>
          </g>

          {/* Merged label — appears on hover */}
          <text
            className="merged-label"
            x="140"
            y="175"
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="var(--accent-primary)"
          >
            A + B + C
          </text>

          {/* Merged label — appears during loop */}
          <text
            className="merge-loop-merged"
            x="140"
            y="175"
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="var(--accent-primary)"
            opacity="0"
          >
            A + B + C
          </text>

          {/* Responsive style for mobile stacking */}
          <style>{`
            @media (max-width: 640px) {
              .group {
                flex-direction: column !important;
              }
            }
          `}</style>
        </svg>
      </div>

      {/* Inline responsive override for flex direction */}
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
