"use client";
import { useState } from "react";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

/* ──────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */

type Status = "idle" | "working" | "done" | "error";

interface ConvertStats {
  sheets: number;
  rows: number;
  columns: number;
  cells: number;
}

interface SheetData {
  name: string;
  rows: string[][];
}

/* ──────────────────────────────────────────────────────────
   Cell + Markdown helpers
   ────────────────────────────────────────────────────────── */

// Normalize any cell value to a display string. With { raw: false } most cells
// already arrive as formatted text, but numbers without a format and Date
// objects (from cellDates: true) can slip through, so coerce them here.
function cellToString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) {
    const hasTime = v.getHours() || v.getMinutes() || v.getSeconds();
    return hasTime ? v.toLocaleString() : v.toLocaleDateString();
  }
  return String(v);
}

// Make a cell safe to drop inside a GitHub-Flavored Markdown table cell:
// escape pipes, fold line breaks into <br>, and collapse runs of whitespace.
function escapeCell(s: string): string {
  return s
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|")
    .replace(/[ \t ]+/g, " ")
    .trim();
}

// Convert one sheet's 2D string array into a GFM table.
function buildSheetMarkdown(rows: string[][]): {
  md: string;
  dataRows: number;
  cols: number;
  cells: number;
} {
  // Find the last column that actually contains data so trailing empty
  // columns (common in exported sheets) are trimmed away.
  let maxCols = 0;
  for (const row of rows) {
    for (let c = row.length - 1; c >= 0; c--) {
      if (row[c] !== "") {
        if (c + 1 > maxCols) maxCols = c + 1;
        break;
      }
    }
  }
  if (maxCols === 0) return { md: "", dataRows: 0, cols: 0, cells: 0 };

  // Pad/truncate every row to the same width and escape each cell.
  const norm = rows
    .map((r) => {
      const out = r.slice(0, maxCols).map(escapeCell);
      while (out.length < maxCols) out.push("");
      return out;
    })
    .filter((r) => r.some((c) => c !== ""));

  if (norm.length === 0) return { md: "", dataRows: 0, cols: 0, cells: 0 };

  const header = norm[0].map((h, i) => h || `Column ${i + 1}`);
  const body = norm.slice(1);

  const lines: string[] = [];
  lines.push(`| ${header.join(" | ")} |`);
  lines.push(`| ${header.map(() => "---").join(" | ")} |`);
  for (const row of body) {
    lines.push(`| ${row.map((c) => c || " ").join(" | ")} |`);
  }

  let cells = 0;
  for (const row of norm) for (const c of row) if (c !== "") cells++;

  return { md: lines.join("\n"), dataRows: body.length, cols: maxCols, cells };
}

function buildMarkdown(sheets: SheetData[]): {
  markdown: string;
  stats: ConvertStats;
} {
  const stats: ConvertStats = { sheets: 0, rows: 0, columns: 0, cells: 0 };
  const sections: string[] = [];
  const multi = sheets.length > 1;

  for (const sheet of sheets) {
    const { md, dataRows, cols, cells } = buildSheetMarkdown(sheet.rows);
    if (!md) continue;
    stats.sheets++;
    stats.rows += dataRows;
    stats.cells += cells;
    if (cols > stats.columns) stats.columns = cols;
    const heading = multi ? `## ${sheet.name}\n\n` : "";
    sections.push(heading + md);
  }

  return { markdown: sections.join("\n\n").trim() + "\n", stats };
}

/* ──────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────── */

const PREVIEW_LIMIT = 60000;

export default function ExcelToMarkdownTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetCount, setSheetCount] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [statusText, setStatusText] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [stats, setStats] = useState<ConvertStats | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setFile(null);
    setSheetCount(0);
    setStatus("idle");
    setStatusText("");
    setMarkdown("");
    setStats(null);
    setError("");
    setCopied(false);
  };

  const handleFile = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFile(f);
    setError("");
    setMarkdown("");
    setStats(null);
    setCopied(false);
    setStatus("working");
    setStatusText("Reading spreadsheet...");

    try {
      const XLSX = await import("xlsx");
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });

      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        setStatus("error");
        setError("This file contains no sheets.");
        return;
      }
      setSheetCount(wb.SheetNames.length);

      const sheets: SheetData[] = [];
      for (const sn of wb.SheetNames) {
        setStatusText(`Reading sheet: ${sn}...`);
        const ws = wb.Sheets[sn];
        if (!ws) continue;
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(ws, {
          header: 1,
          defval: "",
          blankrows: false,
          raw: false,
        });
        const rows = jsonData.map((r) => (r as unknown[]).map(cellToString));
        sheets.push({ name: sn, rows });
      }

      setStatusText("Building Markdown...");
      const { markdown: md, stats: s } = buildMarkdown(sheets);

      if (s.sheets === 0 || !md.trim()) {
        setStatus("error");
        setError(
          "No data found in this spreadsheet. The sheets appear to be empty."
        );
        return;
      }

      setMarkdown(md);
      setStats(s);
      setStatus("done");

      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      downloadBlob(blob, f.name.replace(/\.(xlsx|xlsm|xls|csv)$/i, "") + ".md");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("password") || msg.includes("encrypted")) {
        setError(
          "This spreadsheet is password-protected. Please remove the password first."
        );
      } else {
        setError(
          "Could not convert this file. It may be corrupted or in an unsupported format."
        );
      }
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!file || !markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    downloadBlob(blob, file.name.replace(/\.(xlsx|xlsm|xls|csv)$/i, "") + ".md");
  };

  const handleCopy = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy to clipboard. Use the Download button instead.");
    }
  };

  const accentColor = "#16a34a";
  const bgTint = "var(--bg-tertiary)";
  const previewTruncated = markdown.length > PREVIEW_LIMIT;

  if (!file) {
    return (
      <Dropzone
        onFiles={handleFile}
        label="Drop a spreadsheet to convert to Markdown (.xlsx, .xls, .csv)"
        accept={{
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
          "application/vnd.ms-excel": [".xls"],
          "text/csv": [".csv"],
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* File info */}
      <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: bgTint }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </div>
          <div>
            <p className="font-medium theme-text text-sm">{file.name}</p>
            <p className="text-xs theme-text-muted">
              {sheetCount > 0 && (
                <>
                  {sheetCount} sheet{sheetCount !== 1 ? "s" : ""} &middot;{" "}
                </>
              )}
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </div>
        <button
          onClick={reset}
          disabled={status === "working"}
          className="theme-text-muted text-sm font-medium"
        >
          Remove
        </button>
      </div>

      {/* Progress */}
      {status === "working" && (
        <div
          className="p-4 rounded-xl border theme-border"
          style={{ backgroundColor: bgTint }}
        >
          <div className="flex items-center gap-2">
            <div className="processing-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="text-sm font-medium" style={{ color: accentColor }}>
              {statusText}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {status === "done" && markdown && (
        <>
          <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
            <p className="text-sm text-green-700">
              Done! Your Markdown file has been downloaded
              {stats && <> — {describeStats(stats)}</>}.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 text-white rounded-xl font-semibold text-sm transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              Download .md
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 py-3 rounded-xl font-semibold text-sm theme-bg-secondary theme-border border theme-text-secondary transition-colors"
            >
              {copied ? "Copied!" : "Copy Markdown"}
            </button>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Preview
            </label>
            <pre
              className="text-xs leading-relaxed rounded-xl border theme-border p-4 overflow-auto whitespace-pre-wrap break-words"
              style={{
                backgroundColor: bgTint,
                color: "var(--text-secondary)",
                maxHeight: 360,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              }}
            >
              {previewTruncated ? markdown.slice(0, PREVIEW_LIMIT) : markdown}
              {previewTruncated && (
                <span className="theme-text-muted">
                  {"\n\n… preview truncated. Download the file for the full Markdown."}
                </span>
              )}
            </pre>
          </div>
        </>
      )}

      {/* Info note */}
      <p className="text-xs theme-text-muted text-center leading-relaxed">
        Conversion runs entirely in your browser — your spreadsheet never leaves
        your device. Each sheet becomes a GitHub-Flavored Markdown table, with
        multiple sheets separated by headings. Works with .xlsx, .xls, and .csv
        files.
      </p>
    </div>
  );
}

function describeStats(stats: ConvertStats): string {
  const parts: string[] = [];
  if (stats.sheets > 0)
    parts.push(`${stats.sheets} sheet${stats.sheets !== 1 ? "s" : ""}`);
  if (stats.rows > 0)
    parts.push(`${stats.rows} row${stats.rows !== 1 ? "s" : ""}`);
  if (stats.columns > 0)
    parts.push(`${stats.columns} column${stats.columns !== 1 ? "s" : ""}`);
  if (parts.length === 0) return "no data detected";
  return parts.join(", ");
}
