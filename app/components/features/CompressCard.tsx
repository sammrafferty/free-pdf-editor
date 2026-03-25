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
        cursor: "default",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .compress2-card-inner { flex-direction: column !important; }
        }
      `}</style>

      {/* Left — text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.3 }}>
          Compress Without Compromise
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.6, margin: 0 }}>
          Reduce PDF file size by up to 90% while maintaining visual quality. Perfect for email and sharing.
        </p>
      </div>

      {/* Right — illustration (static: shows compressed result) */}
      <div className="compress2-card-inner" style={{ flexShrink: 0 }}>
        <svg
          width="240"
          height="180"
          viewBox="0 0 240 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
          aria-hidden="true"
        >
          {/* BEFORE label */}
          <text x="47" y="14" textAnchor="middle" fontSize="9" fontWeight="600"
            fill="var(--text-muted)" fontFamily="system-ui, sans-serif" opacity="0.6"
            letterSpacing="1">BEFORE</text>

          {/* Left doc — large original (shown compressed) */}
          <g style={{ transformOrigin: "47px 70px", transform: "scaleY(0.82)" }}>
            <rect x="9" y="20" width="76" height="100" rx="6"
              fill="var(--bg-tertiary, var(--bg-secondary))"
              stroke="var(--border-primary)" strokeWidth="1.5" />
            <path d="M73 20 L85 32 L73 32 Z" fill="var(--border-primary)" opacity="0.3" />
            <rect x="20" y="36" width="44" height="4" rx="2" fill="var(--text-muted)" opacity="0.4" />
            <rect x="20" y="48" width="36" height="4" rx="2" fill="var(--text-muted)" opacity="0.3" />
            <rect x="20" y="60" width="40" height="4" rx="2" fill="var(--text-muted)" opacity="0.4" />
            <rect x="20" y="72" width="30" height="4" rx="2" fill="var(--text-muted)" opacity="0.3" />
            <rect x="20" y="84" width="42" height="4" rx="2" fill="var(--text-muted)" opacity="0.4" />
            <rect x="20" y="96" width="28" height="4" rx="2" fill="var(--text-muted)" opacity="0.3" />
          </g>

          {/* "680 KB" badge (compressed) */}
          <g>
            <rect x="9" y="128" width="60" height="22" rx="6" fill="#4ade80" />
            <text x="39" y="143" textAnchor="middle" fill="white"
              fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">680 KB</text>
          </g>

          {/* Static center arrow */}
          <line x1="98" y1="70" x2="142" y2="70"
            stroke="var(--text-muted)" strokeWidth="1.5" opacity="0.45" />
          <polygon points="142,64 154,70 142,76"
            fill="var(--text-muted)" opacity="0.45" />

          {/* AFTER label */}
          <text x="191" y="24" textAnchor="middle" fontSize="9" fontWeight="600"
            fill="var(--text-muted)" fontFamily="system-ui, sans-serif" opacity="0.6"
            letterSpacing="1">AFTER</text>

          {/* Right doc — smaller compressed result */}
          <g>
            <rect x="162" y="30" width="58" height="78" rx="5"
              fill="var(--bg-tertiary, var(--bg-secondary))"
              stroke="#4ade80" strokeWidth="1.5" />
            <rect x="172" y="44" width="30" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="172" y="52" width="24" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
            <rect x="172" y="60" width="28" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="172" y="68" width="20" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
            <rect x="172" y="76" width="26" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.4" />
            <rect x="162" y="116" width="58" height="20" rx="5" fill="#4ade80" />
            <text x="191" y="130" textAnchor="middle" fill="white"
              fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif">680 KB</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
