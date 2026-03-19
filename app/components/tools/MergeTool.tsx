"use client";
import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfPagePreview from "@/app/components/PdfPagePreview";

interface MergeEntry {
  file: File;
  pageCount: number;
}

export default function MergeTool() {
  const [entries, setEntries] = useState<MergeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleFiles = useCallback(async (files: File[]) => {
    setError("");
    const newEntries: MergeEntry[] = [];
    const skipped: string[] = [];
    for (const file of files) {
      try {
        const buf = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buf);
        const pageCount = pdf.getPageCount();
        newEntries.push({ file, pageCount });
      } catch {
        skipped.push(file.name);
      }
    }
    if (skipped.length > 0) {
      setError(
        `Could not read ${skipped.length === 1 ? "file" : "files"}: ${skipped.join(", ")}`
      );
    }
    if (newEntries.length > 0) {
      setEntries((prev) => [...prev, ...newEntries]);
    }
  }, []);

  const removeFile = (i: number) => {
    setError("");
    setEntries((prev) => prev.filter((_, idx) => idx !== i));
  };

  const fmt = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const totalPages = entries.reduce((sum, e) => sum + e.pageCount, 0);

  /* ── Drag-and-drop handlers ── */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex === null) return;
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setEntries((prev) => {
      const a = [...prev];
      const [moved] = a.splice(dragIndex, 1);
      a.splice(dropIndex > dragIndex ? dropIndex - 1 : dropIndex, 0, moved);
      return a;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  /* ── Merge ── */
  const handleMerge = async () => {
    if (entries.length < 2) return;
    setError("");
    setLoading(true);
    try {
      const merged = await PDFDocument.create();
      for (const entry of entries) {
        const buf = await entry.file.arrayBuffer();
        const pdf = await PDFDocument.load(buf);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      downloadBlob(blob, "merged.pdf");
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dropzone onFiles={handleFiles} multiple label="Drop PDFs to merge" />

      {entries.length > 0 && (
        <div className="mt-5 space-y-0">
          {entries.map((entry, i) => (
            <div key={`${entry.file.name}-${entry.file.size}-${i}`}>
              {/* Drop indicator line */}
              {dragOverIndex === i && dragIndex !== null && dragIndex !== i && (
                <div
                  style={{
                    height: 2,
                    background: "#3b82f6",
                    borderRadius: 1,
                    margin: "2px 0",
                  }}
                />
              )}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-3 p-3.5 theme-file-row rounded-xl mb-2"
                style={{
                  opacity: dragIndex === i ? 0.4 : 1,
                  cursor: "grab",
                  transition: "opacity 0.15s ease",
                }}
              >
                {/* Grip icon */}
                <div className="flex-shrink-0 theme-text-muted" style={{ cursor: "grab" }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="9" cy="5" r="1.5" />
                    <circle cx="15" cy="5" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="19" r="1.5" />
                    <circle cx="15" cy="19" r="1.5" />
                  </svg>
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <PdfPagePreview
                    file={entry.file}
                    pageNumber={1}
                    scale={0.2}
                    width={48}
                  />
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">
                    {entry.file.name}
                  </p>
                  <p className="text-xs theme-text-muted">
                    {fmt(entry.file.size)}
                    {entry.pageCount > 0 && (
                      <span> &middot; {entry.pageCount} {entry.pageCount === 1 ? "page" : "pages"}</span>
                    )}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  aria-label={`Remove ${entry.file.name}`}
                  className="w-7 h-7 flex items-center justify-center rounded-md theme-text-muted hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Drop indicator at the very end */}
          {dragOverIndex !== null &&
            dragIndex !== null &&
            dragOverIndex >= entries.length && (
              <div
                style={{
                  height: 2,
                  background: "#3b82f6",
                  borderRadius: 1,
                  margin: "2px 0",
                }}
              />
            )}

          {/* Total page count */}
          <p className="text-xs theme-text-muted text-center pt-2 pb-1">
            Total: {totalPages} {totalPages === 1 ? "page" : "pages"} from{" "}
            {entries.length} {entries.length === 1 ? "file" : "files"}
          </p>

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">{error}</div>
          )}

          <button
            onClick={handleMerge}
            disabled={loading || entries.length < 2}
            className="w-full py-3.5 mt-1 bg-blue-500 hover:bg-blue-600 theme-btn-disabled text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading
              ? "Merging..."
              : `Merge ${entries.length} ${entries.length === 1 ? "PDF" : "PDFs"}`}
          </button>
        </div>
      )}
    </div>
  );
}
