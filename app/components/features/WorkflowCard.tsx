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
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Left side — text */}
        <div style={{ flex: "0 1 320px", minWidth: 200 }}>
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

        {/* Right side — SVG illustration */}
        <div style={{ flex: "1 1 auto", display: "flex", justifyContent: "center" }}>
          <svg
            viewBox="0 0 420 240"
            width="420"
            height="240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ maxWidth: "100%" }}
            aria-label="Three-step workflow illustration: Drop, Process, Download"
          >
            <style>{`
              .wf-step-icon {
                transition: fill 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                            stroke 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                            opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .wf-step-label {
                transition: fill 0.5s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .wf-arrow {
                transition: stroke 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                            stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1);
              }
              .wf-number {
                transition: fill 0.5s cubic-bezier(0.16, 1, 0.3, 1);
              }

              /* Step 1 highlight */
              .group:hover .wf-s1 {
                stroke: var(--accent-primary);
                transition-delay: 0s;
              }
              .group:hover .wf-n1 {
                fill: var(--accent-primary);
                transition-delay: 0s;
              }
              .group:hover .wf-l1 {
                fill: var(--accent-primary);
                transition-delay: 0s;
              }

              /* Step 2 highlight */
              .group:hover .wf-s2 {
                stroke: var(--accent-primary);
                transition-delay: 0.15s;
              }
              .group:hover .wf-n2 {
                fill: var(--accent-primary);
                transition-delay: 0.15s;
              }
              .group:hover .wf-l2 {
                fill: var(--accent-primary);
                transition-delay: 0.15s;
              }

              /* Step 3 highlight */
              .group:hover .wf-s3 {
                stroke: var(--accent-primary);
                transition-delay: 0.3s;
              }
              .group:hover .wf-n3 {
                fill: var(--accent-primary);
                transition-delay: 0.3s;
              }
              .group:hover .wf-l3 {
                fill: var(--accent-primary);
                transition-delay: 0.3s;
              }

              /* Arrow 1 (between step 1-2) */
              .group:hover .wf-a1 {
                stroke: var(--accent-primary);
                stroke-dashoffset: 0;
                transition-delay: 0.08s;
              }
              /* Arrow 2 (between step 2-3) */
              .group:hover .wf-a2 {
                stroke: var(--accent-primary);
                stroke-dashoffset: 0;
                transition-delay: 0.22s;
              }
            `}</style>

            {/* ── Connecting arrows ── */}
            {/* Arrow 1: step 1 → step 2 */}
            <line
              className="wf-arrow wf-a1"
              x1="148"
              y1="110"
              x2="190"
              y2="110"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              strokeDashoffset="20"
              markerEnd="url(#wf-arrowhead)"
            />
            {/* Arrow 2: step 2 → step 3 */}
            <line
              className="wf-arrow wf-a2"
              x1="268"
              y1="110"
              x2="310"
              y2="110"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              strokeDashoffset="20"
              markerEnd="url(#wf-arrowhead)"
            />

            <defs>
              <marker
                id="wf-arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L8,3 L0,6" fill="none" stroke="var(--text-muted)" strokeWidth="1" />
              </marker>
            </defs>

            {/* ══════════ Step 1: Drop ══════════ */}
            <g>
              {/* Number circle */}
              <circle cx="90" cy="52" r="12" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" className="wf-step-icon wf-s1" />
              <text x="90" y="56" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)" className="wf-number wf-n1">1</text>

              {/* Document shape */}
              <rect
                className="wf-step-icon wf-s1"
                x="68"
                y="80"
                width="36"
                height="46"
                rx="4"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Document lines */}
              <line x1="76" y1="93" x2="96" y2="93" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" className="wf-step-icon wf-s1" />
              <line x1="76" y1="100" x2="92" y2="100" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" className="wf-step-icon wf-s1" />
              <line x1="76" y1="107" x2="94" y2="107" stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" className="wf-step-icon wf-s1" />

              {/* Cursor icon */}
              <path
                className="wf-step-icon wf-s1"
                d="M118,78 L118,104 L124,98 L130,110 L134,108 L128,96 L136,96 Z"
                stroke="var(--text-muted)"
                strokeWidth="1.3"
                fill="none"
                strokeLinejoin="round"
              />

              {/* Label */}
              <text
                className="wf-step-label wf-l1"
                x="90"
                y="148"
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                fill="var(--text-muted)"
              >
                Drop
              </text>
            </g>

            {/* ══════════ Step 2: Process ══════════ */}
            <g>
              {/* Number circle */}
              <circle cx="228" cy="52" r="12" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" className="wf-step-icon wf-s2" />
              <text x="228" y="56" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)" className="wf-number wf-n2">2</text>

              {/* Document shape */}
              <rect
                className="wf-step-icon wf-s2"
                x="210"
                y="80"
                width="36"
                height="46"
                rx="4"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Gear/circular arrow overlay */}
              <circle
                className="wf-step-icon wf-s2"
                cx="238"
                cy="94"
                r="10"
                stroke="var(--text-muted)"
                strokeWidth="1.3"
                fill="var(--bg-secondary)"
                strokeDasharray="4 2"
              />
              {/* Circular arrow inside */}
              <path
                className="wf-step-icon wf-s2"
                d="M234,90 A5,5 0 1,1 242,94"
                stroke="var(--text-muted)"
                strokeWidth="1.2"
                fill="none"
                markerEnd="url(#wf-arrowhead)"
              />

              {/* Label */}
              <text
                className="wf-step-label wf-l2"
                x="228"
                y="148"
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                fill="var(--text-muted)"
              >
                Process
              </text>
            </g>

            {/* ══════════ Step 3: Download ══════════ */}
            <g>
              {/* Number circle */}
              <circle cx="352" cy="52" r="12" fill="none" stroke="var(--text-muted)" strokeWidth="1.2" className="wf-step-icon wf-s3" />
              <text x="352" y="56" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)" className="wf-number wf-n3">3</text>

              {/* Download arrow */}
              <line
                className="wf-step-icon wf-s3"
                x1="352"
                y1="78"
                x2="352"
                y2="96"
                stroke="var(--text-muted)"
                strokeWidth="1.8"
              />
              <polyline
                className="wf-step-icon wf-s3"
                points="344,90 352,98 360,90"
                stroke="var(--text-muted)"
                strokeWidth="1.8"
                fill="none"
                strokeLinejoin="round"
              />

              {/* Completed document below arrow */}
              <rect
                className="wf-step-icon wf-s3"
                x="334"
                y="102"
                width="36"
                height="28"
                rx="4"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Checkmark on document */}
              <polyline
                className="wf-step-icon wf-s3"
                points="344,115 350,121 362,109"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Label */}
              <text
                className="wf-step-label wf-l3"
                x="352"
                y="148"
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                fill="var(--text-muted)"
              >
                Download
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Responsive: stack vertically on small screens */}
      <style>{`
        @media (max-width: 640px) {
          .group > div:first-child {
            flex-direction: column !important;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
