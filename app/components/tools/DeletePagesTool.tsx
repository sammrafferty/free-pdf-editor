"use client";
import { useState, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfThumbnailGrid from "@/app/components/PdfThumbnailGrid";

export default function DeletePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pagesInput, setPagesInput] = useState("");
  const [markedPages, setMarkedPages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      setFile(f);
      setPageCount(pdf.getPageCount());
      setMarkedPages(new Set());
      setPagesInput("");
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  const parsePages = (input: string, max: number): Set<number> => {
    const pages = new Set<number>();
    for (const part of input.split(",").map((s) => s.trim())) {
      if (!part) continue;
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        if (isNaN(a) || isNaN(b)) continue;
        for (let i = Math.max(a, 1); i <= Math.min(b, max); i++) pages.add(i);
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= max) pages.add(n);
      }
    }
    return pages;
  };

  /** Build a text range string from a set of 1-based page numbers */
  const buildRangeString = (pages: Set<number>): string => {
    if (pages.size === 0) return "";
    const sorted = Array.from(pages).sort((a, b) => a - b);
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
  };

  // Sync text input -> marked pages
  useEffect(() => {
    if (pageCount === 0) return;
    const parsed = parsePages(pagesInput, pageCount);
    setMarkedPages(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesInput, pageCount]);

  const onToggle = useCallback(
    (pageNum: number) => {
      setMarkedPages((prev) => {
        const next = new Set(prev);
        if (next.has(pageNum)) {
          next.delete(pageNum);
        } else {
          next.add(pageNum);
        }
        setPagesInput(buildRangeString(next));
        return next;
      });
    },
    []
  );

  const markAll = () => {
    const all = new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
    setMarkedPages(all);
    setPagesInput(buildRangeString(all));
  };

  const unmarkAll = () => {
    setMarkedPages(new Set());
    setPagesInput("");
  };

  const remaining = pageCount - markedPages.size;
  const allDeleted = markedPages.size > 0 && markedPages.size >= pageCount;

  const renderOverlay = (pageNum: number) => {
    if (!markedPages.has(pageNum)) return null;
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(239, 68, 68, 0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "inherit",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    );
  };

  const handleDelete = async () => {
    if (!file || markedPages.size === 0) return;
    if (allDeleted) {
      setError("Cannot delete all pages. At least one page must remain.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const zeroIndexed = new Set(Array.from(markedPages).map((p) => p - 1));

      const buf = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(buf);
      const newPdf = await PDFDocument.create();
      const keepIndices = Array.from({ length: pageCount }, (_, i) => i).filter(
        (i) => !zeroIndexed.has(i)
      );
      const copied = await newPdf.copyPages(srcPdf, keepIndices);
      copied.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `edited_${file.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete pages");
    }
    setLoading(false);
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
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              onClick={() => { setFile(null); setPageCount(0); setMarkedPages(new Set()); setPagesInput(""); }}
              className="theme-text-muted text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Thumbnail grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium theme-text-secondary">
                Click pages to mark for deletion
              </label>
              <div className="flex gap-2">
                <button
                  onClick={markAll}
                  className="px-3 py-1 text-xs font-medium rounded-lg theme-text-secondary"
                  style={{ border: "1px solid var(--border-primary)" }}
                >
                  Mark All
                </button>
                <button
                  onClick={unmarkAll}
                  className="px-3 py-1 text-xs font-medium rounded-lg theme-text-secondary"
                  style={{ border: "1px solid var(--border-primary)" }}
                >
                  Unmark All
                </button>
              </div>
            </div>
            <PdfThumbnailGrid
              file={file}
              pageCount={pageCount}
              selected={markedPages}
              onToggle={onToggle}
              renderOverlay={renderOverlay}
            />
          </div>

          {/* Text input for power users */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Pages to delete
            </label>
            <input
              type="text"
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              placeholder="e.g. 2, 4-6, 8"
              className="w-full theme-input rounded-xl px-4 py-3 theme-text placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 text-sm"
            />
          </div>

          {/* Deletion counter */}
          {markedPages.size > 0 && (
            <div
              className="p-3 rounded-xl text-sm font-medium text-center"
              style={{
                backgroundColor: allDeleted ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.08)",
                color: allDeleted ? "#ef4444" : "var(--text-secondary)",
                border: allDeleted ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid transparent",
              }}
            >
              {allDeleted
                ? "Cannot delete all pages — at least one page must remain."
                : `Deleting ${markedPages.size} of ${pageCount} pages (${remaining} will remain)`}
            </div>
          )}

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleDelete}
            disabled={loading || markedPages.size === 0 || allDeleted}
            className="w-full py-3.5 bg-red-500/100 hover:bg-red-600 theme-btn-disabled text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Processing..." : "Delete Pages & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
