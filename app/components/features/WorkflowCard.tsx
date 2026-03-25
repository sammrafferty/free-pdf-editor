"use client";

export default function WorkflowCard() {
  return (
    <div
      className="group"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-primary)",
        borderRadius: 16,
        padding: 32,
        cursor: "default",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Text */}
        <div>
          <h3
            style={{
              color: "var(--text-primary)",
              fontSize: 24,
              fontWeight: 700,
              margin: "0 0 12px 0",
              lineHeight: 1.2,
            }}
          >
            Drag, Drop, Done
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 15,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            No signups, no installs, no waiting. Drop your file, pick your tool,
            and download the result in seconds.
          </p>
        </div>

        {/* SVG — full width (static) */}
        <div style={{ width: "100%" }}>
          <svg
            viewBox="0 0 420 240"
            width="100%"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", width: "100%", height: "auto" }}
            aria-label="Three-step workflow illustration: Drop, Process, Download"
          >
            {/* ── Connecting arrows (visible) ── */}
            <line x1="148" y1="110" x2="190" y2="110" stroke="var(--accent-primary)" strokeWidth="1.5" strokeDasharray="6 4" />
            <line x1="268" y1="110" x2="310" y2="110" stroke="var(--accent-primary)" strokeWidth="1.5" strokeDasharray="6 4" />

            <defs>
              <marker id="wf-arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6" fill="none" stroke="var(--accent-primary)" strokeWidth="1" />
              </marker>
            </defs>

            {/* ══════════ Step 1: Drop ══════════ */}
            <g>
              <circle cx="90" cy="52" r="12" fill="none" stroke="var(--accent-primary)" strokeWidth="1.2" />
              <text x="90" y="56" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--accent-primary)">1</text>

              <rect x="68" y="80" width="36" height="46" rx="4" stroke="var(--accent-primary)" strokeWidth="1.5" fill="none" />
              <line x1="76" y1="93" x2="96" y2="93" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
              <line x1="76" y1="100" x2="92" y2="100" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
              <line x1="76" y1="107" x2="94" y2="107" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />

              <path d="M118,78 L118,104 L124,98 L130,110 L134,108 L128,96 L136,96 Z" stroke="var(--accent-primary)" strokeWidth="1.3" fill="none" strokeLinejoin="round" />

              <text x="90" y="148" textAnchor="middle" fontSize="12" fontWeight="500" fill="var(--accent-primary)">Drop</text>
            </g>

            {/* ══════════ Step 2: Process ══════════ */}
            <g>
              <circle cx="228" cy="52" r="12" fill="none" stroke="var(--accent-primary)" strokeWidth="1.2" />
              <text x="228" y="56" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--accent-primary)">2</text>

              <rect x="210" y="80" width="36" height="46" rx="4" stroke="var(--accent-primary)" strokeWidth="1.5" fill="none" />

              <circle cx="238" cy="94" r="10" stroke="var(--accent-primary)" strokeWidth="1.3" fill="var(--bg-secondary)" strokeDasharray="4 2" />
              <path d="M234,90 A5,5 0 1,1 242,94" stroke="var(--accent-primary)" strokeWidth="1.2" fill="none" />

              <text x="228" y="148" textAnchor="middle" fontSize="12" fontWeight="500" fill="var(--accent-primary)">Process</text>
            </g>

            {/* ══════════ Step 3: Download ══════════ */}
            <g>
              <circle cx="352" cy="52" r="12" fill="none" stroke="var(--accent-primary)" strokeWidth="1.2" />
              <text x="352" y="56" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--accent-primary)">3</text>

              <line x1="352" y1="78" x2="352" y2="96" stroke="var(--accent-primary)" strokeWidth="1.8" />
              <polyline points="344,90 352,98 360,90" stroke="var(--accent-primary)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />

              <rect x="334" y="102" width="36" height="28" rx="4" stroke="var(--accent-primary)" strokeWidth="1.5" fill="none" />
              <polyline points="344,115 350,121 362,109" stroke="var(--accent-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

              <text x="352" y="148" textAnchor="middle" fontSize="12" fontWeight="500" fill="var(--accent-primary)">Download</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
