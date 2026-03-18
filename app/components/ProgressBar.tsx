"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  status?: string;
  color?: string;
}

export default function ProgressBar({ current, total, status, color }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const fill = color || "var(--accent-primary)";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        {status && <span style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>{status}</span>}
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "auto" }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "var(--progress-track)" }}>
        <div style={{ height: 6, borderRadius: 3, width: `${pct}%`, background: fill, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}
