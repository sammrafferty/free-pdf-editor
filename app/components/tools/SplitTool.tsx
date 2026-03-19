"use client";
import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfThumbnailGrid from "@/app/components/PdfThumbnailGrid";

/** Convert a Set of 1-indexed page numbers into a compact range string, e.g. Set{1,2,3,5} → "1-3, 5" */
function setToRange(s: Set<number>): string {
  const sorted = [...s].sort((a, b) => a - b);
  if (sorted.length === 0) return "";
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(", ");
}

export default function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [range, setRange] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [splitN, setSplitN] = useState(2);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      setFile(f);
      setPageCount(pdf.getPageCount());
      setSelected(new Set());
      setRange("");
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  const parseRange = (r: string, max: number): number[] => {
    const pages: number[] = [];
    const parts = r.split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes("-")) {
        const segments = part.split("-").map(Number);
        const a = segments[0];
        const b = segments[1];
        if (isNaN(a) || isNaN(b)) continue;
        const lo = Math.max(Math.min(a, b), 1);
        const hi = Math.min(Math.max(a, b), max);
        for (let i = lo; i <= hi; i++) pages.push(i);
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= max) pages.push(n);
      }
    }
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  /** Update selected set and sync the range text */
  const updateSelection = useCallback((newSelected: Set<number>) => {
    setSelected(newSelected);
    setRange(setToRange(newSelected));
  }, []);

  /** Toggle a single page in the selection */
  const handleToggle = useCallback((pageNum: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      setRange(setToRange(next));
      return next;
    });
  }, []);

  /** When text input changes, parse and sync to thumbnail selection */
  const handleRangeChange = (value: string) => {
    setRange(value);
    const pages = parseRange(value, pageCount);
    setSelected(new Set(pages));
  };

  /** Quick action: Select All */
  const selectAll = () => {
    const all = new Set<number>();
    for (let i = 1; i <= pageCount; i++) all.add(i);
    updateSelection(all);
  };

  /** Quick action: Select None */
  const selectNone = () => {
    updateSelection(new Set());
  };

  /** Quick action: Select Odd pages */
  const selectOdd = () => {
    const odd = new Set<number>();
    for (let i = 1; i <= pageCount; i += 2) odd.add(i);
    updateSelection(odd);
  };

  /** Quick action: Select Even pages */
  const selectEven = () => {
    const even = new Set<number>();
    for (let i = 2; i <= pageCount; i += 2) even.add(i);
    updateSelection(even);
  };

  /** Quick action: Split every N pages (selects first group) */
  const splitEveryN = () => {
    const group = new Set<number>();
    for (let i = 1; i <= Math.min(splitN, pageCount); i++) group.add(i);
    updateSelection(group);
  };

  const handleSplit = async () => {
    if (!file || !range.trim()) return;
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(buf);
      const pages = parseRange(range, pageCount);
      if (!pages.length) throw new Error("Invalid page range — no valid pages found");

      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(srcPdf, pages.map((p) => p - 1));
      copied.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const safeRange = range.replace(/[^0-9\-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
      downloadBlob(blob, `split_pages_${safeRange}.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!file ? (
        <div>
          <Dropzone onFiles={handleFile} />
          {error && (
            <div className="mt-4 p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* File card */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} pages</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setPageCount(0); setSelected(new Set()); setRange(""); setError(""); }}
              className="theme-text-muted  text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Quick actions */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={selectNone}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              >
                Select None
              </button>
              <button
                onClick={selectOdd}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              >
                Select Odd
              </button>
              <button
                onClick={selectEven}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
              >
                Select Even
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={splitEveryN}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  First
                </button>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={splitN}
                  onChange={(e) => setSplitN(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 px-2 py-1.5 text-xs text-center theme-input rounded-lg theme-text focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                />
                <span className="text-xs theme-text-muted">pages</span>
              </div>
            </div>
          </div>

          {/* Thumbnail grid */}
          <div className="max-h-[420px] overflow-y-auto rounded-xl p-3 theme-card">
            <PdfThumbnailGrid
              file={file}
              pageCount={pageCount}
              selected={selected}
              onToggle={handleToggle}
            />
          </div>

          {/* Selection count */}
          <p className="text-sm font-medium" style={{ color: "#6366f1" }}>
            Selected: {selected.size} of {pageCount} pages
          </p>

          {/* Page range input */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Pages to extract
            </label>
            <input
              type="text"
              value={range}
              onChange={(e) => handleRangeChange(e.target.value)}
              placeholder={`e.g. 1-3, 5, 7-9`}
              className="w-full theme-input rounded-xl px-4 py-3 theme-text placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-white/20 text-sm"
            />
          </div>

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSplit}
            disabled={loading || !range.trim() || selected.size === 0}
            className="w-full py-3.5 bg-indigo-500/100 hover:bg-indigo-600 theme-btn-disabled text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Processing..." : "Extract Pages"}
          </button>
        </div>
      )}
    </div>
  );
}
