"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfPagePreview from "@/app/components/PdfPagePreview";

interface CropMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

type Edge = "top" | "bottom" | "left" | "right";

export default function CropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageDims, setPageDims] = useState<{ width: number; height: number }>({ width: 612, height: 792 });
  const [margins, setMargins] = useState<CropMargins>({ top: 0, bottom: 0, left: 0, right: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [applyToAll, setApplyToAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const overlayRef = useRef<HTMLDivElement>(null);
  const draggingEdge = useRef<Edge | null>(null);
  const dragStart = useRef<{ x: number; y: number; margins: CropMargins }>({ x: 0, y: 0, margins: { top: 0, bottom: 0, left: 0, right: 0 } });

  const MIN_CROP = 10; // minimum 10% of page in each dimension

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const count = pdf.getPageCount();
      const firstPage = pdf.getPage(0);
      const { width, height } = firstPage.getSize();
      setFile(f);
      setPageCount(count);
      setPageDims({ width, height });
      setCurrentPage(1);
      setMargins({ top: 0, bottom: 0, left: 0, right: 0 });
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  const clampMargins = useCallback((m: CropMargins): CropMargins => {
    const clamp = (v: number) => Math.max(0, Math.min(v, 100));
    let top = clamp(m.top);
    let bottom = clamp(m.bottom);
    let left = clamp(m.left);
    let right = clamp(m.right);

    // Ensure at least MIN_CROP% remains in each dimension
    if (top + bottom > 100 - MIN_CROP) {
      const excess = top + bottom - (100 - MIN_CROP);
      top -= excess / 2;
      bottom -= excess / 2;
      if (top < 0) { bottom += -top; top = 0; }
      if (bottom < 0) { top += -bottom; bottom = 0; }
    }
    if (left + right > 100 - MIN_CROP) {
      const excess = left + right - (100 - MIN_CROP);
      left -= excess / 2;
      right -= excess / 2;
      if (left < 0) { right += -left; left = 0; }
      if (right < 0) { left += -right; right = 0; }
    }

    return { top, bottom, left, right };
  }, []);

  const getOverlayRect = useCallback(() => {
    return overlayRef.current?.getBoundingClientRect() ?? null;
  }, []);

  const handlePointerDown = useCallback((edge: Edge, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingEdge.current = edge;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = { x: clientX, y: clientY, margins: { ...margins } };
  }, [margins]);

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingEdge.current) return;
    const rect = getOverlayRect();
    if (!rect) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    const prev = dragStart.current.margins;

    let next = { ...prev };
    const edge = draggingEdge.current;

    if (edge === "top") {
      next.top = prev.top + (dy / rect.height) * 100;
    } else if (edge === "bottom") {
      next.bottom = prev.bottom - (dy / rect.height) * 100;
    } else if (edge === "left") {
      next.left = prev.left + (dx / rect.width) * 100;
    } else if (edge === "right") {
      next.right = prev.right - (dx / rect.width) * 100;
    }

    next = clampMargins(next);
    setMargins(next);
  }, [clampMargins, getOverlayRect]);

  const handlePointerUp = useCallback(() => {
    draggingEdge.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const toPt = useCallback((pct: number, dimension: number) => {
    return Math.round((pct / 100) * dimension * 10) / 10;
  }, []);

  const handleCrop = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);

      const startPage = applyToAll ? 0 : currentPage - 1;
      const endPage = applyToAll ? pdf.getPageCount() : currentPage;

      for (let i = startPage; i < endPage; i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();

        const t = (margins.top / 100) * height;
        const b = (margins.bottom / 100) * height;
        const l = (margins.left / 100) * width;
        const r = (margins.right / 100) * width;

        const cropW = width - l - r;
        const cropH = height - t - b;

        if (cropW <= 0 || cropH <= 0) {
          setError("Crop margins are too large — no visible area remains.");
          setLoading(false);
          return;
        }

        page.setMediaBox(l, b, cropW, cropH);
        page.setCropBox(l, b, cropW, cropH);
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `cropped_${file.name}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to crop PDF. Please try again.");
    }
    setLoading(false);
  };

  const handleRemove = () => {
    setFile(null);
    setMargins({ top: 0, bottom: 0, left: 0, right: 0 });
    setError("");
  };

  const cropOverlay = (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "auto",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* Semi-transparent overlay strips */}
      {/* Top strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: `${margins.top}%`,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />
      {/* Bottom strip */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${margins.bottom}%`,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />
      {/* Left strip */}
      <div
        style={{
          position: "absolute",
          top: `${margins.top}%`,
          left: 0,
          width: `${margins.left}%`,
          bottom: `${margins.bottom}%`,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />
      {/* Right strip */}
      <div
        style={{
          position: "absolute",
          top: `${margins.top}%`,
          right: 0,
          width: `${margins.right}%`,
          bottom: `${margins.bottom}%`,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />

      {/* Crop box border */}
      <div
        style={{
          position: "absolute",
          top: `${margins.top}%`,
          left: `${margins.left}%`,
          right: `${margins.right}%`,
          bottom: `${margins.bottom}%`,
          border: "2px solid #5eead4",
          pointerEvents: "none",
        }}
      />

      {/* Draggable edge handles */}
      {/* Top edge */}
      <div
        onMouseDown={(e) => handlePointerDown("top", e)}
        onTouchStart={(e) => handlePointerDown("top", e)}
        style={{
          position: "absolute",
          top: `calc(${margins.top}% - 6px)`,
          left: `${margins.left}%`,
          right: `${margins.right}%`,
          height: "12px",
          cursor: "ns-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "40px", height: "4px", borderRadius: "2px", backgroundColor: "#5eead4" }} />
      </div>
      {/* Bottom edge */}
      <div
        onMouseDown={(e) => handlePointerDown("bottom", e)}
        onTouchStart={(e) => handlePointerDown("bottom", e)}
        style={{
          position: "absolute",
          bottom: `calc(${margins.bottom}% - 6px)`,
          left: `${margins.left}%`,
          right: `${margins.right}%`,
          height: "12px",
          cursor: "ns-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "40px", height: "4px", borderRadius: "2px", backgroundColor: "#5eead4" }} />
      </div>
      {/* Left edge */}
      <div
        onMouseDown={(e) => handlePointerDown("left", e)}
        onTouchStart={(e) => handlePointerDown("left", e)}
        style={{
          position: "absolute",
          left: `calc(${margins.left}% - 6px)`,
          top: `${margins.top}%`,
          bottom: `${margins.bottom}%`,
          width: "12px",
          cursor: "ew-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "4px", height: "40px", borderRadius: "2px", backgroundColor: "#5eead4" }} />
      </div>
      {/* Right edge */}
      <div
        onMouseDown={(e) => handlePointerDown("right", e)}
        onTouchStart={(e) => handlePointerDown("right", e)}
        style={{
          position: "absolute",
          right: `calc(${margins.right}% - 6px)`,
          top: `${margins.top}%`,
          bottom: `${margins.bottom}%`,
          width: "12px",
          cursor: "ew-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "4px", height: "40px", borderRadius: "2px", backgroundColor: "#5eead4" }} />
      </div>
    </div>
  );

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
          {/* File info row */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} page{pageCount !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <button onClick={handleRemove} className="theme-text-muted text-sm font-medium">Remove</button>
          </div>

          {/* Preview + Margins side by side */}
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Page preview with crop overlay */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div style={{ maxWidth: "400px", width: "100%" }}>
                <PdfPagePreview
                  file={file}
                  pageNumber={currentPage}
                  scale={1}
                  width={400}
                  overlay={cropOverlay}
                />
              </div>

              {/* Page navigation */}
              {pageCount > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium theme-bg-secondary theme-border border theme-text-secondary disabled:opacity-40 transition-colors"
                  >
                    Prev
                  </button>
                  <span className="text-sm theme-text-secondary">
                    Page {currentPage} / {pageCount}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                    disabled={currentPage >= pageCount}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium theme-bg-secondary theme-border border theme-text-secondary disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Apply to all toggle */}
              {pageCount > 1 && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyToAll}
                    onChange={(e) => setApplyToAll(e.target.checked)}
                    className="w-4 h-4 rounded accent-teal-400"
                  />
                  <span className="text-sm theme-text-secondary">Apply to all pages</span>
                </label>
              )}
            </div>

            {/* Live margin display */}
            <div className="lg:w-56 space-y-3">
              <h3 className="text-sm font-semibold theme-text">Crop Margins</h3>
              {(["top", "bottom", "left", "right"] as Edge[]).map((edge) => {
                const pct = Math.round(margins[edge] * 10) / 10;
                const dim = edge === "top" || edge === "bottom" ? pageDims.height : pageDims.width;
                const pt = toPt(margins[edge], dim);
                return (
                  <div key={edge} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <span className="text-sm font-medium theme-text capitalize">{edge}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold" style={{ color: "#5eead4" }}>{pct}%</span>
                      <span className="text-xs theme-text-muted ml-2">({pt} pt)</span>
                    </div>
                  </div>
                );
              })}
              <p className="text-xs theme-text-muted">
                Drag the teal handles on the preview to adjust crop area.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleCrop}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading ? { backgroundColor: "#14b8a6" } : {}}
          >
            {loading ? "Cropping..." : "Crop & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
