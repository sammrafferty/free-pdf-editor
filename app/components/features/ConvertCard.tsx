"use client";

export default function ConvertCard() {
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
        transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .convert2-card-inner {
            flex-direction: column !important;
          }
        }
        .convert2-card-inner {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 32px;
          width: 100%;
        }

        /* ── keyframes ── */
        @keyframes convert2-pdf-fade {
          0%, 18%   { opacity: 1; }
          22%, 100% { opacity: 0.35; }
        }
        @keyframes convert2-word-rise {
          0%, 18%   { opacity: 0.55; }
          22%, 78%  { opacity: 1; }
          90%, 100% { opacity: 0.55; }
        }
        /* continuous dash flow — independent of the 4s cycle */
        @keyframes convert2-arrow-flow {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -20; }
        }
        @keyframes convert2-shimmer-sweep {
          0%, 48%  { transform: translateX(-120%); }
          74%      { transform: translateX(200%); }
          100%     { transform: translateX(-120%); }
        }
        /* one-shot shimmer used on hover */
        @keyframes convert2-shimmer-sweep-hover {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(200%); }
        }

        /* ── in-view: start looping animations ── */
        .in-view .convert2-pdf {
          animation: convert2-pdf-fade 4s ease-in-out infinite;
        }
        .in-view .convert2-word {
          animation: convert2-word-rise 4s ease-in-out infinite;
        }
        /* arrow always flows once in-view */
        .in-view .convert2-arrow {
          animation: convert2-arrow-flow 0.8s linear infinite;
        }
        .in-view .convert2-shimmer {
          animation: convert2-shimmer-sweep 4s ease-in-out infinite;
        }

        /* ── hover overrides ── */
        .group:hover .convert2-pdf {
          opacity: 0.35;
          animation: none;
        }
        .group:hover .convert2-word {
          opacity: 1;
          animation: none;
        }
        /* keep arrow flowing on hover */
        .group:hover .convert2-arrow {
          animation: convert2-arrow-flow 0.8s linear infinite;
        }
        .group:hover .convert2-shimmer {
          animation: convert2-shimmer-sweep-hover 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* base states */
        .convert2-pdf  { opacity: 1; }
        .convert2-word { opacity: 0.55; }
        .convert2-shimmer { transform: translateX(-120%); }
      `}</style>

      <div className="convert2-card-inner">
        {/* Left side — text */}
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
          <h3
            style={{
              color: "var(--text-primary)",
              fontSize: 22,
              fontWeight: 700,
              margin: "0 0 12px 0",
              lineHeight: 1.3,
            }}
          >
            PDF &rarr; Word, Instantly
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 15,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Convert PDF files to editable Word documents. Tables, formatting,
            and images are preserved.
          </p>
        </div>

        {/* Right side — SVG illustration */}
        <div style={{ flex: "0 0 auto" }}>
          <svg
            width="280"
            height="240"
            viewBox="0 0 280 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
          >
            {/* PDF document — left */}
            <g className="convert2-pdf">
              {/* page shadow */}
              <rect x="18" y="34" width="90" height="120" rx="6"
                fill="var(--text-muted)" opacity="0.10" />
              {/* page body */}
              <rect x="14" y="30" width="90" height="120" rx="6"
                fill="var(--bg-secondary)"
                stroke="var(--border-primary)" strokeWidth="1.5" />
              {/* red accent bar */}
              <rect x="14" y="30" width="90" height="18" rx="6"
                fill="var(--accent-primary)" />
              {/* square off bottom corners of accent bar */}
              <rect x="14" y="42" width="90" height="6"
                fill="var(--accent-primary)" />
              {/* PDF label */}
              <text x="59" y="43"
                textAnchor="middle"
                fill="white"
                fontSize="10" fontWeight="700"
                fontFamily="system-ui, sans-serif">
                PDF
              </text>
              {/* content lines */}
              <rect x="26" y="60" width="54" height="4" rx="2"
                fill="var(--text-muted)" opacity="0.35" />
              <rect x="26" y="70" width="66" height="4" rx="2"
                fill="var(--text-muted)" opacity="0.25" />
              <rect x="26" y="80" width="48" height="4" rx="2"
                fill="var(--text-muted)" opacity="0.35" />
              <rect x="26" y="90" width="60" height="4" rx="2"
                fill="var(--text-muted)" opacity="0.25" />
              {/* small table */}
              <rect x="26" y="104" width="66" height="28" rx="3"
                fill="var(--text-muted)" opacity="0.12" />
              <line x1="26" y1="114" x2="92" y2="114"
                stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.25" />
              <line x1="26" y1="122" x2="92" y2="122"
                stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.25" />
              <line x1="52" y1="104" x2="52" y2="132"
                stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.25" />
            </g>

            {/* Arrow — flowing dashes, center */}
            <g>
              <line
                className="convert2-arrow"
                x1="118" y1="90"
                x2="158" y2="90"
                stroke="var(--text-muted)"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.55"
              />
              {/* arrowhead (static) */}
              <polygon
                points="160,90 152,85 152,95"
                fill="var(--text-muted)"
                opacity="0.55"
              />
            </g>

            {/* Word document — right */}
            <g className="convert2-word">
              {/* page shadow */}
              <rect x="178" y="34" width="90" height="120" rx="6"
                fill="var(--text-muted)" opacity="0.10" />
              {/* page body */}
              <rect x="174" y="30" width="90" height="120" rx="6"
                fill="var(--bg-secondary)"
                stroke="var(--border-primary)" strokeWidth="1.5" />
              {/* blue accent bar */}
              <rect x="174" y="30" width="90" height="18" rx="6"
                fill="#4285f4" />
              <rect x="174" y="42" width="90" height="6"
                fill="#4285f4" />
              {/* DOCX label */}
              <text x="219" y="43"
                textAnchor="middle"
                fill="white"
                fontSize="10" fontWeight="700"
                fontFamily="system-ui, sans-serif">
                DOCX
              </text>
              {/* content lines */}
              <rect x="186" y="60" width="54" height="4" rx="2"
                fill="var(--text-muted)" opacity="0.35" />
              <rect x="186" y="70" width="66" height="4" rx="2"
                fill="var(--text-muted)" opacity="0.25" />
              <rect x="186" y="80" width="48" height="4" rx="2"
                fill="var(--text-muted)" opacity="0.35" />
              <rect x="186" y="90" width="60" height="4" rx="2"
                fill="var(--text-muted)" opacity="0.25" />
              {/* small table */}
              <rect x="186" y="104" width="66" height="28" rx="3"
                fill="var(--text-muted)" opacity="0.12" />
              <line x1="186" y1="114" x2="252" y2="114"
                stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.25" />
              <line x1="186" y1="122" x2="252" y2="122"
                stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.25" />
              <line x1="212" y1="104" x2="212" y2="132"
                stroke="var(--text-muted)" strokeWidth="0.8" opacity="0.25" />

              {/* Shimmer overlay — clipped to Word doc */}
              <defs>
                <clipPath id="convert2-word-clip">
                  <rect x="174" y="30" width="90" height="120" rx="6" />
                </clipPath>
              </defs>
              <g clipPath="url(#convert2-word-clip)">
                <rect
                  className="convert2-shimmer"
                  x="174"
                  y="30"
                  width="45"
                  height="120"
                  fill="white"
                  opacity="0.14"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
