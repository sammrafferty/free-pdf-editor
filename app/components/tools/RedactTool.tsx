"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfPagePreview from "@/app/components/PdfPagePreview";

interface RedactRegion {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function RedactTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [regions, setRegions] = useState<RedactRegion[]>([]);
  const [selectedRegionIdx, setSelectedRegionIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      setFile(f);
      setPageCount(pdf.getPageCount());
      setCurrentPage(1);
      setRegions([]);
      setSelectedRegionIdx(null);
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  const removeRegion = useCallback((idx: number) => {
    setRegions((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRegionIdx(null);
  }, []);

  // Keyboard delete for selected region
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedRegionIdx !== null && (e.key === "Delete" || e.key === "Backspace")) {
        // Don't delete if focus is on an input or button
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
        e.preventDefault();
        removeRegion(selectedRegionIdx);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRegionIdx, removeRegion]);

  // Get mouse/touch position as percentage of overlay
  const getPositionPercent = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const el = overlayRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const pos = getPositionPercent(clientX, clientY);
    if (!pos) return;
    setIsDrawing(true);
    setDrawStart(pos);
    setDrawCurrent(pos);
    setSelectedRegionIdx(null);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDrawing) return;
    const pos = getPositionPercent(clientX, clientY);
    if (pos) setDrawCurrent(pos);
  };

  const handlePointerUp = () => {
    if (!isDrawing || !drawStart || !drawCurrent) {
      setIsDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
      return;
    }

    const x = Math.min(drawStart.x, drawCurrent.x);
    const y = Math.min(drawStart.y, drawCurrent.y);
    const width = Math.abs(drawCurrent.x - drawStart.x);
    const height = Math.abs(drawCurrent.y - drawStart.y);

    // Only add region if it's big enough (at least 1% in both dimensions)
    if (width >= 1 && height >= 1) {
      setRegions((prev) => [...prev, { page: currentPage, x, y, width, height }]);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  };

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    handlePointerDown(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => handlePointerMove(e.clientX, e.clientY);
  const onMouseUp = () => handlePointerUp();

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerDown(touch.clientX, touch.clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, touch.clientY);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handlePointerUp();
  };

  // Click on a finalized region on the preview to select it
  const handleRegionClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRegionIdx(selectedRegionIdx === idx ? null : idx);
  };

  const currentPageRegions = regions
    .map((r, idx) => ({ ...r, globalIdx: idx }))
    .filter((r) => r.page === currentPage);

  // In-progress rectangle
  const drawRect = isDrawing && drawStart && drawCurrent ? {
    x: Math.min(drawStart.x, drawCurrent.x),
    y: Math.min(drawStart.y, drawCurrent.y),
    width: Math.abs(drawCurrent.x - drawStart.x),
    height: Math.abs(drawCurrent.y - drawStart.y),
  } : null;

  // Build overlay content
  const overlayContent = (
    <div
      ref={overlayRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "auto", cursor: "crosshair" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Finalized regions for current page */}
      {currentPageRegions.map((r) => (
        <div
          key={r.globalIdx}
          onClick={(e) => handleRegionClick(r.globalIdx, e)}
          style={{
            position: "absolute",
            left: `${r.x}%`,
            top: `${r.y}%`,
            width: `${r.width}%`,
            height: `${r.height}%`,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            border: selectedRegionIdx === r.globalIdx ? "2px solid #f59e0b" : "1px solid rgba(0,0,0,0.6)",
            boxSizing: "border-box",
            cursor: "pointer",
          }}
        />
      ))}
      {/* In-progress drawing rectangle */}
      {drawRect && (
        <div
          style={{
            position: "absolute",
            left: `${drawRect.x}%`,
            top: `${drawRect.y}%`,
            width: `${drawRect.width}%`,
            height: `${drawRect.height}%`,
            border: "2px dashed rgba(100, 116, 139, 0.8)",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            pointerEvents: "none",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );

  // Group regions by page for the list
  const regionsByPage = regions.reduce<Record<number, { region: RedactRegion; globalIdx: number }[]>>((acc, r, idx) => {
    if (!acc[r.page]) acc[r.page] = [];
    acc[r.page].push({ region: r, globalIdx: idx });
    return acc;
  }, {});
  const sortedPages = Object.keys(regionsByPage).map(Number).sort((a, b) => a - b);

  const handleRedact = async () => {
    if (!file || regions.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;

      const redactedPageNums = new Set(regions.map((r) => r.page));

      const newPdf = await PDFDocument.create();
      const origPdf = await PDFDocument.load(buf);

      for (let i = 0; i < doc.numPages; i++) {
        const pageNum = i + 1;

        if (redactedPageNums.has(pageNum)) {
          const pdfPage = await doc.getPage(pageNum);
          const scale = 2;
          const viewport = pdfPage.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Could not create canvas context for redaction rendering.");

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await pdfPage.render({ canvasContext: ctx, viewport, canvas } as any).promise;

          const pageRegions = regions.filter((r) => r.page === pageNum);
          ctx.fillStyle = "#000000";
          for (const region of pageRegions) {
            const rx = (region.x / 100) * viewport.width;
            const ry = (region.y / 100) * viewport.height;
            const rw = (region.width / 100) * viewport.width;
            const rh = (region.height / 100) * viewport.height;
            ctx.fillRect(rx, ry, rw, rh);
          }

          const imgDataUrl = canvas.toDataURL("image/jpeg", 0.92);
          const imgBytes = Uint8Array.from(atob(imgDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
          const img = await newPdf.embedJpg(imgBytes);

          const origPage = origPdf.getPage(i);
          const { width: origW, height: origH } = origPage.getSize();
          const page = newPdf.addPage([origW, origH]);
          page.drawImage(img, { x: 0, y: 0, width: origW, height: origH });
        } else {
          const [copied] = await newPdf.copyPages(origPdf, [i]);
          newPdf.addPage(copied);
        }
      }

      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `redacted_${file.name}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to redact PDF. Please try again.");
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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} pages</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setRegions([]); setSelectedRegionIdx(null); setError(""); setPageCount(0); setCurrentPage(1); setLoading(false); }} className="theme-text-muted text-sm font-medium">Remove</button>
          </div>

          {/* Warning */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-700">Redacted pages are flattened to images to ensure underlying text is permanently removed and cannot be recovered.</p>
          </div>

          {/* Page navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: currentPage <= 1 ? "var(--bg-tertiary)" : "#64748b",
                color: currentPage <= 1 ? "var(--text-muted)" : "#fff",
                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
              }}
            >
              &lsaquo; Prev
            </button>
            <span className="text-sm theme-text-secondary font-medium">
              Page {currentPage} of {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage >= pageCount}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: currentPage >= pageCount ? "var(--bg-tertiary)" : "#64748b",
                color: currentPage >= pageCount ? "var(--text-muted)" : "#fff",
                cursor: currentPage >= pageCount ? "not-allowed" : "pointer",
              }}
            >
              Next &rsaquo;
            </button>
          </div>

          {/* Page preview with drawing overlay */}
          <div className="flex justify-center">
            <PdfPagePreview
              file={file}
              pageNumber={currentPage}
              scale={1.5}
              overlay={overlayContent}
              className="select-none"
            />
          </div>

          {/* Instruction text */}
          <p className="text-center text-xs theme-text-muted">
            Click and drag on the page to mark areas for redaction
          </p>

          {/* Region list */}
          {regions.length > 0 && (
            <div>
              <label className="text-sm font-medium theme-text-secondary block mb-3">
                Redaction regions ({regions.length})
              </label>
              <div className="space-y-3">
                {sortedPages.map((pageNum) => (
                  <div key={pageNum} className="space-y-1.5">
                    {regionsByPage[pageNum].map(({ globalIdx }, localIdx) => (
                      <div
                        key={globalIdx}
                        className="flex items-center justify-between p-2.5 theme-file-row rounded-lg"
                        style={{
                          border: selectedRegionIdx === globalIdx ? "1px solid #f59e0b" : "1px solid transparent",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setSelectedRegionIdx(selectedRegionIdx === globalIdx ? null : globalIdx);
                          setCurrentPage(pageNum);
                        }}
                      >
                        <span className="text-xs theme-text-secondary">
                          Page {pageNum} &mdash; Region {localIdx + 1}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeRegion(globalIdx); }}
                          className="text-xs text-red-400 hover:text-red-600 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Redact button */}
          <button
            onClick={handleRedact}
            disabled={loading || regions.length === 0}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading && regions.length > 0 ? { backgroundColor: "#64748b" } : {}}
          >
            {loading ? "Redacting..." : "Redact & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
