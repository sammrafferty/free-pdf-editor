"use client";

export default function CompressCard() {
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
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .compress2-card-layout {
            flex-direction: column !important;
          }
        }

        /* ── looping animations (triggered by .in-view on parent section) ── */
        @keyframes compress2-squish {
          0%, 22%  { transform: scaleY(1); }
          28%, 82% { transform: scaleY(0.88); }
          90%, 100% { transform: scaleY(1); }
        }
        @keyframes compress2-badge-hide {
          0%, 22%  { opacity: 1; }
          28%, 100% { opacity: 0; }
        }
        @keyframes compress2-badge-show {
          0%, 22%  { opacity: 0; }
          28%, 82% { opacity: 1; }
          90%, 100% { opacity: 0; }
        }
        @keyframes compress2-arrow-left {
          0%, 22%  { transform: translateX(0); }
          28%, 82% { transform: translateX(8px); }
          90%, 100% { transform: translateX(0); }
        }
        @keyframes compress2-arrow-right {
          0%, 22%  { transform: translateX(0); }
          28%, 82% { transform: translateX(-8px); }
          90%, 100% { transform: translateX(0); }
        }
        @keyframes compress2-result-rise {
          0%, 22%  { opacity: 0.45; }
          62%, 82% { opacity: 1; }
          90%, 100% { opacity: 0.45; }
        }

        /* doc-before: scaleY from its vertical centre */
        .compress2-doc-before {
          transform-origin: 65px 80px;
        }
        .in-view .compress2-doc-before {
          animation: compress2-squish 3.5s ease-in-out infinite;
        }
        .in-view .compress2-badge-large {
          animation: compress2-badge-hide 3.5s ease-in-out infinite;
        }
        .in-view .compress2-badge-small {
          animation: compress2-badge-show 3.5s ease-in-out infinite;
        }
        .in-view .compress2-arrow-left {
          animation: compress2-arrow-left 3.5s ease-in-out infinite;
        }
        .in-view .compress2-arrow-right {
          animation: compress2-arrow-right 3.5s ease-in-out infinite;
        }
        .in-view .compress2-result {
          animation: compress2-result-rise 3.5s ease-in-out infinite;
        }

        /* ── hover overrides (instant, no loop) ── */
        .group:hover .compress2-doc-before {
          animation: none;
          transform: scaleY(0.88);
        }
        .group:hover .compress2-badge-large {
          animation: none;
          opacity: 0;
        }
        .group:hover .compress2-badge-small {
          animation: none;
          opacity: 1;
        }
        .group:hover .compress2-arrow-left {
          animation: none;
          transform: translateX(8px);
        }
        .group:hover .compress2-arrow-right {
          animation: none;
          transform: translateX(-8px);
        }
        .group:hover .compress2-result {
          animation: none;
          opacity: 1;
        }

        /* base opacity for result doc (so animation starts correctly) */
        .compress2-result {
          opacity: 0.45;
        }
        /* base opacity for badges */
        .compress2-badge-large { opacity: 1; }
        .compress2-badge-small { opacity: 0; }
      `}</style>

      {/* Left side — text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            color: "var(--text-primary)",
            fontSize: 24,
            fontWeight: 700,
            margin: "0 0 12px 0",
            lineHeight: 1.3,
          }}
        >
          Compress Without Compromise
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 16,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Reduce PDF file size by up to 90% while maintaining visual quality.
          Perfect for email and sharing.
        </p>
      </div>

      {/* Right side — illustration */}
      <div
        className="compress2-card-layout"
        style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
      >
        <svg
          width="300"
          height="200"
          viewBox="0 0 300 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          {/* ── Left document: original (large) ── */}
          <g className="compress2-doc-before">
            {/* page shadow */}
            <rect x="23" y="23" width="90" height="122" rx="6"
              fill="var(--text-muted)" opacity="0.08" />
            {/* page body */}
            <rect x="20" y="20" width="90" height="120" rx="6"
              fill="var(--bg-tertiary, var(--bg-secondary))"
              stroke="var(--border-primary)" strokeWidth="1.5" />
            {/* corner fold */}
            <path d="M98 20 L110 32 L98 32 Z"
              fill="var(--border-primary)" opacity="0.3" />
            {/* content lines */}
            <rect x="32" y="38" width="50" height="4" rx="2"
              fill="var(--text-muted)" opacity="0.4" />
            <rect x="32" y="50" width="42" height="4" rx="2"
              fill="var(--text-muted)" opacity="0.3" />
            <rect x="32" y="62" width="46" height="4" rx="2"
              fill="var(--text-muted)" opacity="0.4" />
            <rect x="32" y="74" width="34" height="4" rx="2"
              fill="var(--text-muted)" opacity="0.3" />
            <rect x="32" y="86" width="48" height="4" rx="2"
              fill="var(--text-muted)" opacity="0.4" />
            <rect x="32" y="98" width="38" height="4" rx="2"
              fill="var(--text-muted)" opacity="0.3" />

            {/* "4.2 MB" badge — fades out */}
            <g className="compress2-badge-large">
              <rect x="20" y="148" width="60" height="22" rx="6"
                fill="var(--accent-primary)" />
              <text x="50" y="163"
                textAnchor="middle"
                fill="white"
                fontSize="11" fontWeight="700"
                fontFamily="system-ui, sans-serif">
                4.2 MB
              </text>
            </g>

            {/* "680 KB" badge — fades in (green) */}
            <g className="compress2-badge-small">
              <rect x="20" y="148" width="60" height="22" rx="6"
                fill="#4ade80" />
              <text x="50" y="163"
                textAnchor="middle"
                fill="white"
                fontSize="11" fontWeight="700"
                fontFamily="system-ui, sans-serif">
                680 KB
              </text>
            </g>
          </g>

          {/* ── Centre: compression chevrons ── */}
          {/* left chevron (points right, moves right when compressing) */}
          <g className="compress2-arrow-left"
            style={{ transformOrigin: "147px 90px" }}>
            <path d="M140 78 L152 90 L140 102"
              stroke="var(--text-muted)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.6" />
          </g>

          {/* right chevron (points left, moves left when compressing) */}
          <g className="compress2-arrow-right"
            style={{ transformOrigin: "153px 90px" }}>
            <path d="M160 78 L148 90 L160 102"
              stroke="var(--text-muted)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.6" />
          </g>

          {/* ── Right document: compressed result ── */}
          <g className="compress2-result">
            {/* page shadow */}
            <rect x="193" y="38" width="72" height="97" rx="5"
              fill="var(--text-muted)" opacity="0.08" />
            {/* page body */}
            <rect x="190" y="35" width="70" height="95" rx="5"
              fill="var(--bg-tertiary, var(--bg-secondary))"
              stroke="#4ade80"
              strokeWidth="1.5" />
            {/* content lines */}
            <rect x="200" y="50" width="38" height="3" rx="1.5"
              fill="var(--text-muted)" opacity="0.4" />
            <rect x="200" y="59" width="30" height="3" rx="1.5"
              fill="var(--text-muted)" opacity="0.3" />
            <rect x="200" y="68" width="34" height="3" rx="1.5"
              fill="var(--text-muted)" opacity="0.4" />
            <rect x="200" y="77" width="26" height="3" rx="1.5"
              fill="var(--text-muted)" opacity="0.3" />
            <rect x="200" y="86" width="36" height="3" rx="1.5"
              fill="var(--text-muted)" opacity="0.4" />
            {/* "680 KB" result badge */}
            <rect x="190" y="140" width="56" height="20" rx="5"
              fill="#4ade80" />
            <text x="218" y="154"
              textAnchor="middle"
              fill="white"
              fontSize="10" fontWeight="700"
              fontFamily="system-ui, sans-serif">
              680 KB
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
