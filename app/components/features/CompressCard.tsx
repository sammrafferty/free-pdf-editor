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
          .compress-card-layout {
            flex-direction: column !important;
          }
        }
        .compress-doc-large {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .group:hover .compress-doc-large {
          transform: scale(0.92);
        }
        .compress-badge-before {
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 1;
        }
        .group:hover .compress-badge-before {
          opacity: 0;
        }
        .compress-badge-after {
          transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
        }
        .group:hover .compress-badge-after {
          opacity: 1;
        }
        .compress-arrow {
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .group:hover .compress-arrow {
          transform: translateY(6px);
        }
        .compress-quality-fill {
          transition: filter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .group:hover .compress-quality-fill {
          filter: brightness(1.3);
        }
        @keyframes compress-pulse-green {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .group:hover .compress-quality-fill {
          animation: compress-pulse-green 1s ease-in-out 1;
        }
      `}</style>

      {/* Left side - text */}
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

      {/* Right side - illustration */}
      <div
        className="compress-card-layout"
        style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
      >
        <svg
          width="260"
          height="240"
          viewBox="0 0 260 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          {/* Large document (before) */}
          <g className="compress-doc-large" style={{ transformOrigin: "80px 70px" }}>
            {/* Document body */}
            <rect
              x="40"
              y="16"
              width="80"
              height="100"
              rx="6"
              fill="var(--bg-tertiary, var(--bg-secondary))"
              stroke="var(--border-primary)"
              strokeWidth="1.5"
            />
            {/* Document lines */}
            <rect x="54" y="36" width="52" height="4" rx="2" fill="var(--text-muted)" opacity="0.4" />
            <rect x="54" y="48" width="44" height="4" rx="2" fill="var(--text-muted)" opacity="0.3" />
            <rect x="54" y="60" width="48" height="4" rx="2" fill="var(--text-muted)" opacity="0.4" />
            <rect x="54" y="72" width="36" height="4" rx="2" fill="var(--text-muted)" opacity="0.3" />
            <rect x="54" y="84" width="50" height="4" rx="2" fill="var(--text-muted)" opacity="0.4" />
            {/* Corner fold */}
            <path d="M104 16 L120 32 L104 32 Z" fill="var(--border-primary)" opacity="0.3" />

            {/* File size badge - 4.2 MB (visible by default) */}
            <g className="compress-badge-before">
              <rect x="88" y="92" width="52" height="22" rx="6" fill="var(--accent-primary)" />
              <text
                x="114"
                y="107"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                4.2 MB
              </text>
            </g>

            {/* File size badge - 680 KB (visible on hover) */}
            <g className="compress-badge-after">
              <rect x="88" y="92" width="52" height="22" rx="6" fill="#4ade80" />
              <text
                x="114"
                y="107"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                680 KB
              </text>
            </g>
          </g>

          {/* Compression arrow */}
          <g className="compress-arrow" style={{ transformOrigin: "80px 140px" }}>
            <path
              d="M80 126 L80 152"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M72 146 L80 156 L88 146"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Compression lines */}
            <line x1="68" y1="134" x2="92" y2="134" stroke="var(--text-muted)" strokeWidth="1" opacity="0.4" />
            <line x1="72" y1="140" x2="88" y2="140" stroke="var(--text-muted)" strokeWidth="1" opacity="0.3" />
          </g>

          {/* Small document (after) */}
          <g>
            {/* Document body - slightly smaller */}
            <rect
              x="50"
              y="166"
              width="60"
              height="72"
              rx="5"
              fill="var(--bg-tertiary, var(--bg-secondary))"
              stroke="#4ade80"
              strokeWidth="1.5"
            />
            {/* Document lines */}
            <rect x="60" y="180" width="40" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="60" y="189" width="32" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
            <rect x="60" y="198" width="36" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="60" y="207" width="28" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />

            {/* File size badge */}
            <rect x="80" y="218" width="48" height="20" rx="5" fill="#4ade80" />
            <text
              x="104"
              y="232"
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              680 KB
            </text>
          </g>

          {/* Quality meter section */}
          <g>
            {/* Label */}
            <text
              x="178"
              y="106"
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="10"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              Quality
            </text>

            {/* Meter background */}
            <rect
              x="152"
              y="114"
              width="52"
              height="100"
              rx="6"
              fill="var(--bg-tertiary, var(--bg-secondary))"
              stroke="var(--border-primary)"
              strokeWidth="1"
            />

            {/* Meter fill (full / green) */}
            <rect
              className="compress-quality-fill"
              x="158"
              y="120"
              width="40"
              height="88"
              rx="4"
              fill="#4ade80"
              opacity="0.85"
            />

            {/* Meter graduation lines */}
            <line x1="158" y1="142" x2="198" y2="142" stroke="white" strokeWidth="0.5" opacity="0.3" />
            <line x1="158" y1="164" x2="198" y2="164" stroke="white" strokeWidth="0.5" opacity="0.3" />
            <line x1="158" y1="186" x2="198" y2="186" stroke="white" strokeWidth="0.5" opacity="0.3" />

            {/* 100% label */}
            <text
              x="178"
              y="226"
              textAnchor="middle"
              fill="#4ade80"
              fontSize="12"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              100%
            </text>

            {/* Checkmark */}
            <circle cx="228" cy="164" r="16" fill="#4ade80" opacity="0.15" />
            <path
              d="M220 164 L225 169 L236 158"
              stroke="#4ade80"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
