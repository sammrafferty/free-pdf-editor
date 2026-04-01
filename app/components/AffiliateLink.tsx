"use client";

// Centralized affiliate config — update URLs here when you get affiliate IDs
const AFFILIATES = {
  adobe: {
    label: "Adobe Acrobat Pro",
    url: "https://www.adobe.com/acrobat/free-trial-download.html",
    tagline: "Advanced editing, OCR, e-signatures, and batch processing",
  },
} as const;

interface AffiliateLinkProps {
  /** Which affiliate to show */
  partner?: keyof typeof AFFILIATES;
  /** Optional custom className for outer wrapper */
  className?: string;
}

export default function AffiliateLink({ partner = "adobe", className = "" }: AffiliateLinkProps) {
  const aff = AFFILIATES[partner];

  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border-secondary)",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
            Need more advanced features?
          </p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {aff.label}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {aff.tagline}
          </p>
        </div>
        <a
          href={aff.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 shrink-0"
          style={{
            background: "var(--accent-primary)",
            color: "#fff",
          }}
        >
          Try Free
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
