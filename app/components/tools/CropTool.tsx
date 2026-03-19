"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfPagePreview from "@/app/components/PdfPagePreview";
import PdfThumbnailGrid from "@/app/components/PdfThumbnailGrid";

interface CropMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

type Edge = "top" | "bottom" | "left" | "right";

type AspectRatio = "free" | "16:9" | "4:3" | "1:1";

const ASPECT_RATIOS: { label: string; value: AspectRatio; ratio: number | null }[] = [
  { label: "Free", value: "free", ratio: null },
  { label: "16:9", value: "16:9", ratio: 16 / 9 },
  { label: "4:3", value: "4:3", ratio: 4 / 3 },
  { label: "1:1", value: "1:1", ratio: 1 },
];

const DEFAULT_MARGINS: CropMargins = { top: 0, bottom: 0, left: 0, right: 0 };

export default function CropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageDims, setPageDims] = useState<{ width: number; height: number }>({ width: 612, height: 792 });
  const [margins, setMargins] = useState<CropMargins>({ ...DEFAULT_MARGINS });
  const [perPageMargins, setPerPageMargins] = useState<Record<number, CropMargins>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [applyToAll, setApplyToAll] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPulse, setShowPulse] = useState(true);

  const overlayRef = useRef<HTMLDivElement>(null);
  const draggingEdge = useRef<Edge | null>(null);
  const dragStart = useRef<{ x: number; y: number; margins: CropMargins }>({ x: 0, y: 0, margins: { ...DEFAULT_MARGINS } });
  const prevPageRef = useRef(1);

  const MIN_CROP = 10; // minimum 10% of page in each dimension

  // Stop pulse animation after 2 cycles (~2s)
  useEffect(() => {
    if (!file) return;
    setShowPulse(true);
    const timer = setTimeout(() => setShowPulse(false), 2000);
    return () => clearTimeout(timer);
  }, [file]);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const count = pdf.getPageCount();
      if (count === 0) {
        setError("This PDF has no pages.");
        setFile(null);
        setPageCount(0);
        return;
      }
      const firstPage = pdf.getPage(0);
      const { width, height } = firstPage.getSize();
      setFile(f);
      setPageCount(count);
      setPageDims({ width, height });
      setCurrentPage(1);
      setMargins({ ...DEFAULT_MARGINS });
      setPerPageMargins({});
      setAspectRatio("free");
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
      setPageCount(0);
      setPageDims({ width: 612, height: 792 });
      setCurrentPage(1);
      setMargins({ ...DEFAULT_MARGINS });
      setPerPageMargins({});
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

  /** Apply aspect ratio constraint after a drag on `edge` */
  const applyAspectRatio = useCallback(
    (m: CropMargins, edge: Edge, ratioValue: number | null): CropMargins => {
      if (!ratioValue) return m;
      // Visible area in percentage units, but need real dimensions for ratio
      const visW = (100 - m.left - m.right) / 100 * pageDims.width;
      const visH = (100 - m.top - m.bottom) / 100 * pageDims.height;
      const currentRatio = visW / visH;

      const next = { ...m };

      if (edge === "left" || edge === "right") {
        // Width changed, adjust height to match ratio
        const targetH = visW / ratioValue;
        const targetHPct = (targetH / pageDims.height) * 100;
        const totalVertMargin = 100 - targetHPct;
        if (totalVertMargin >= 0) {
          // distribute proportionally to existing top/bottom
          const oldVertTotal = next.top + next.bottom;
          if (oldVertTotal > 0) {
            const topRatio = next.top / oldVertTotal;
            next.top = totalVertMargin * topRatio;
            next.bottom = totalVertMargin * (1 - topRatio);
          } else {
            next.top = totalVertMargin / 2;
            next.bottom = totalVertMargin / 2;
          }
        }
      } else {
        // Height changed, adjust width to match ratio
        const targetW = visH * ratioValue;
        const targetWPct = (targetW / pageDims.width) * 100;
        const totalHorizMargin = 100 - targetWPct;
        if (totalHorizMargin >= 0) {
          const oldHorizTotal = next.left + next.right;
          if (oldHorizTotal > 0) {
            const leftRatio = next.left / oldHorizTotal;
            next.left = totalHorizMargin * leftRatio;
            next.right = totalHorizMargin * (1 - leftRatio);
          } else {
            next.left = totalHorizMargin / 2;
            next.right = totalHorizMargin / 2;
          }
        }
      }

      // If ratio is wrong because we hit bounds, adjust the primary axis back
      if (currentRatio !== ratioValue) {
        return clampMargins(next);
      }
      return clampMargins(next);
    },
    [pageDims, clampMargins]
  );

  const getOverlayRect = useCallback(() => {
    return overlayRef.current?.getBoundingClientRect() ?? null;
  }, []);

  const handlePointerDown = useCallback((edge: Edge, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingEdge.current = edge;
    const touch = "touches" in e ? e.touches[0] : null;
    if ("touches" in e && !touch) return;
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
    dragStart.current = { x: clientX, y: clientY, margins: { ...margins } };
  }, [margins]);

  const activeRatioValue = ASPECT_RATIOS.find((r) => r.value === aspectRatio)?.ratio ?? null;

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingEdge.current) return;
    e.preventDefault();
    const rect = getOverlayRect();
    if (!rect) return;
    if (rect.width === 0 || rect.height === 0) return;

    const touch = "touches" in e ? e.touches[0] : null;
    if ("touches" in e && !touch) return;
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;
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
    next = applyAspectRatio(next, edge, activeRatioValue);
    setMargins(next);
  }, [clampMargins, getOverlayRect, applyAspectRatio, activeRatioValue]);

  const handlePointerUp = useCallback(() => {
    draggingEdge.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
    window.addEventListener("touchcancel", handlePointerUp);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
      window.removeEventListener("touchcancel", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Per-page margin switching
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (!applyToAll) {
        // Save current margins for current page
        setPerPageMargins((prev) => ({
          ...prev,
          [prevPageRef.current]: { ...margins },
        }));
        // Load margins for new page (or defaults)
        setMargins((prevMargins) => {
          // We need the latest perPageMargins, but we just set it above with the
          // current page's margins. The newPage margins come from existing state.
          // Use a functional approach: check perPageMargins directly.
          return perPageMargins[newPage] ?? { ...DEFAULT_MARGINS };
        });
      }
      prevPageRef.current = newPage;
      setCurrentPage(newPage);
    },
    [applyToAll, margins, perPageMargins]
  );

  // When toggling applyToAll off, seed per-page with current margins for current page
  const handleApplyToAllChange = useCallback(
    (checked: boolean) => {
      if (!checked) {
        // Switching to per-page mode: save current margins as current page's
        setPerPageMargins((prev) => ({
          ...prev,
          [currentPage]: { ...margins },
        }));
      }
      setApplyToAll(checked);
    },
    [currentPage, margins]
  );

  const handleCopyToAllPages = useCallback(() => {
    if (pageCount === 0) return;
    const newPerPage: Record<number, CropMargins> = {};
    for (let i = 1; i <= pageCount; i++) {
      newPerPage[i] = { ...margins };
    }
    setPerPageMargins(newPerPage);
  }, [margins, pageCount]);

  const toPt = useCallback((pct: number, dimension: number) => {
    return Math.round((pct / 100) * dimension * 10) / 10;
  }, []);

  const hasCrop = margins.top > 0 || margins.bottom > 0 || margins.left > 0 || margins.right > 0;

  // Check if any page has custom margins (for per-page mode)
  const pageHasCustomMargins = useCallback(
    (pageNum: number): boolean => {
      const m = perPageMargins[pageNum];
      if (!m) return false;
      return m.top > 0 || m.bottom > 0 || m.left > 0 || m.right > 0;
    },
    [perPageMargins]
  );

  const handleCrop = async () => {
    if (!file || loading) return;

    // In per-page mode, check if any page has crop
    const anyPageHasCrop = applyToAll
      ? hasCrop
      : Object.values({ ...perPageMargins, [currentPage]: margins }).some(
          (m) => m.top > 0 || m.bottom > 0 || m.left > 0 || m.right > 0
        );

    if (!anyPageHasCrop) {
      setError("Please adjust the crop margins before cropping.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const totalPages = pdf.getPageCount();

      if (applyToAll) {
        // Apply same margins to all pages
        for (let i = 0; i < totalPages; i++) {
          const page = pdf.getPage(i);
          const { width, height } = page.getSize();

          const t = (margins.top / 100) * height;
          const b = (margins.bottom / 100) * height;
          const l = (margins.left / 100) * width;
          const r = (margins.right / 100) * width;

          const cropW = width - l - r;
          const cropH = height - t - b;

          if (cropW < 1 || cropH < 1) {
            setError("Crop margins are too large — no visible area remains.");
            return;
          }

          // pdf-lib setMediaBox expects (x1, y1, x2, y2) — bottom-left and top-right corners
          page.setMediaBox(l, b, l + cropW, b + cropH);
          page.setCropBox(l, b, l + cropW, b + cropH);
        }
      } else {
        // Per-page mode: save current page margins first
        const allMargins = { ...perPageMargins, [currentPage]: { ...margins } };

        for (let i = 0; i < totalPages; i++) {
          const pageNum = i + 1;
          const m = allMargins[pageNum];
          if (!m || (m.top === 0 && m.bottom === 0 && m.left === 0 && m.right === 0)) continue;

          const page = pdf.getPage(i);
          const { width, height } = page.getSize();

          const t = (m.top / 100) * height;
          const b = (m.bottom / 100) * height;
          const l = (m.left / 100) * width;
          const r = (m.right / 100) * width;

          const cropW = width - l - r;
          const cropH = height - t - b;

          if (cropW < 1 || cropH < 1) {
            setError(`Crop margins on page ${pageNum} are too large — no visible area remains.`);
            return;
          }

          page.setMediaBox(l, b, l + cropW, b + cropH);
          page.setCropBox(l, b, l + cropW, b + cropH);
        }
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `cropped_${file.name}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to crop PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPageCount(0);
    setPageDims({ width: 612, height: 792 });
    setCurrentPage(1);
    setMargins({ ...DEFAULT_MARGINS });
    setPerPageMargins({});
    setApplyToAll(true);
    setAspectRatio("free");
    setError("");
    draggingEdge.current = null;
  };

  // Handle aspect ratio selection: snap current crop to selected ratio
  const handleAspectRatioChange = useCallback(
    (ratio: AspectRatio) => {
      setAspectRatio(ratio);
      const ratioObj = ASPECT_RATIOS.find((r) => r.value === ratio);
      if (!ratioObj || !ratioObj.ratio) return;

      // Snap current margins to aspect ratio
      const visW = ((100 - margins.left - margins.right) / 100) * pageDims.width;
      const visH = ((100 - margins.top - margins.bottom) / 100) * pageDims.height;
      const currentR = visW / visH;
      const targetR = ratioObj.ratio;

      const next = { ...margins };
      if (currentR > targetR) {
        // Too wide, increase horizontal margins
        const targetW = visH * targetR;
        const targetWPct = (targetW / pageDims.width) * 100;
        const totalHorizMargin = 100 - targetWPct;
        const oldTotal = next.left + next.right;
        if (oldTotal > 0) {
          const leftShare = next.left / oldTotal;
          next.left = totalHorizMargin * leftShare;
          next.right = totalHorizMargin * (1 - leftShare);
        } else {
          next.left = totalHorizMargin / 2;
          next.right = totalHorizMargin / 2;
        }
      } else if (currentR < targetR) {
        // Too tall, increase vertical margins
        const targetH = visW / targetR;
        const targetHPct = (targetH / pageDims.height) * 100;
        const totalVertMargin = 100 - targetHPct;
        const oldTotal = next.top + next.bottom;
        if (oldTotal > 0) {
          const topShare = next.top / oldTotal;
          next.top = totalVertMargin * topShare;
          next.bottom = totalVertMargin * (1 - topShare);
        } else {
          next.top = totalVertMargin / 2;
          next.bottom = totalVertMargin / 2;
        }
      }
      setMargins(clampMargins(next));
    },
    [margins, pageDims, clampMargins]
  );

  // Thumbnail overlay for per-page mode: show a subtle crop indicator
  const renderThumbnailOverlay = useCallback(
    (pageNum: number) => {
      const m = pageNum === currentPage ? margins : perPageMargins[pageNum];
      if (!m || (m.top === 0 && m.bottom === 0 && m.left === 0 && m.right === 0)) return null;
      return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {/* Top overlay */}
          {m.top > 0 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: `${m.top}%`,
                backgroundColor: "rgba(0, 0, 0, 0.35)",
              }}
            />
          )}
          {/* Bottom overlay */}
          {m.bottom > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: `${m.bottom}%`,
                backgroundColor: "rgba(0, 0, 0, 0.35)",
              }}
            />
          )}
          {/* Left overlay */}
          {m.left > 0 && (
            <div
              style={{
                position: "absolute",
                top: `${m.top}%`,
                left: 0,
                width: `${m.left}%`,
                bottom: `${m.bottom}%`,
                backgroundColor: "rgba(0, 0, 0, 0.35)",
              }}
            />
          )}
          {/* Right overlay */}
          {m.right > 0 && (
            <div
              style={{
                position: "absolute",
                top: `${m.top}%`,
                right: 0,
                width: `${m.right}%`,
                bottom: `${m.bottom}%`,
                backgroundColor: "rgba(0, 0, 0, 0.35)",
              }}
            />
          )}
          {/* Border */}
          <div
            style={{
              position: "absolute",
              top: `${m.top}%`,
              left: `${m.left}%`,
              right: `${m.right}%`,
              bottom: `${m.bottom}%`,
              border: "1px solid #5eead4",
            }}
          />
        </div>
      );
    },
    [currentPage, margins, perPageMargins]
  );

  const handleEdgeStyle = (
    isHorizontal: boolean
  ): React.CSSProperties => ({
    width: isHorizontal ? "60px" : "6px",
    height: isHorizontal ? "6px" : "60px",
    borderRadius: "3px",
    backgroundColor: "#5eead4",
    transition: "transform 0.15s ease, opacity 0.15s ease",
    animation: showPulse ? "cropHandlePulse 1s ease-in-out 2" : "none",
  });

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
      <style>{`
        @keyframes cropHandlePulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .crop-handle-bar:hover {
          transform: scale(1.2) !important;
          opacity: 1 !important;
        }
      `}</style>

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
          top: `calc(${margins.top}% - 12px)`,
          left: `${margins.left}%`,
          right: `${margins.right}%`,
          height: "24px",
          cursor: "ns-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="crop-handle-bar" style={handleEdgeStyle(true)} />
      </div>
      {/* Bottom edge */}
      <div
        onMouseDown={(e) => handlePointerDown("bottom", e)}
        onTouchStart={(e) => handlePointerDown("bottom", e)}
        style={{
          position: "absolute",
          bottom: `calc(${margins.bottom}% - 12px)`,
          left: `${margins.left}%`,
          right: `${margins.right}%`,
          height: "24px",
          cursor: "ns-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="crop-handle-bar" style={handleEdgeStyle(true)} />
      </div>
      {/* Left edge */}
      <div
        onMouseDown={(e) => handlePointerDown("left", e)}
        onTouchStart={(e) => handlePointerDown("left", e)}
        style={{
          position: "absolute",
          left: `calc(${margins.left}% - 12px)`,
          top: `${margins.top}%`,
          bottom: `${margins.bottom}%`,
          width: "24px",
          cursor: "ew-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="crop-handle-bar" style={handleEdgeStyle(false)} />
      </div>
      {/* Right edge */}
      <div
        onMouseDown={(e) => handlePointerDown("right", e)}
        onTouchStart={(e) => handlePointerDown("right", e)}
        style={{
          position: "absolute",
          right: `calc(${margins.right}% - 12px)`,
          top: `${margins.top}%`,
          bottom: `${margins.bottom}%`,
          width: "24px",
          cursor: "ew-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="crop-handle-bar" style={handleEdgeStyle(false)} />
      </div>
    </div>
  );

  // For the thumbnail grid, we use `selected` to highlight the current page
  const selectedPages = new Set([currentPage]);

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

          {/* Aspect ratio buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium theme-text-secondary mr-1">Aspect Ratio:</span>
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.value}
                onClick={() => handleAspectRatioChange(r.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                style={
                  aspectRatio === r.value
                    ? {
                        backgroundColor: "rgba(94, 234, 212, 0.15)",
                        borderColor: "#5eead4",
                        color: "#5eead4",
                      }
                    : {
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-primary)",
                        color: "var(--text-secondary)",
                      }
                }
              >
                {r.label}
              </button>
            ))}
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

              {/* Instruction text */}
              <p className="text-xs theme-text-muted text-center">
                Drag the edges to adjust crop area
              </p>

              {/* Page navigation */}
              {pageCount > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium theme-bg-secondary theme-border border theme-text-secondary disabled:opacity-40 transition-colors"
                  >
                    Prev
                  </button>
                  <span className="text-sm theme-text-secondary">
                    Page {currentPage} / {pageCount}
                  </span>
                  <button
                    onClick={() => handlePageChange(Math.min(pageCount, currentPage + 1))}
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
                    onChange={(e) => handleApplyToAllChange(e.target.checked)}
                    className="w-4 h-4 rounded accent-teal-400"
                  />
                  <span className="text-sm theme-text-secondary">Apply to all pages</span>
                </label>
              )}

              {/* Copy to all pages button (per-page mode) */}
              {pageCount > 1 && !applyToAll && (
                <button
                  onClick={handleCopyToAllPages}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium transition-colors border"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-primary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Copy to all pages
                </button>
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

          {/* Thumbnail grid for per-page mode */}
          {pageCount > 1 && !applyToAll && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold theme-text">Page Thumbnails</h3>
              <PdfThumbnailGrid
                file={file}
                pageCount={pageCount}
                selected={selectedPages}
                onToggle={(pageNum) => handlePageChange(pageNum)}
                renderOverlay={renderThumbnailOverlay}
                columns={6}
                thumbnailScale={0.2}
              />
            </div>
          )}

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleCrop}
            disabled={loading || (!hasCrop && applyToAll)}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading && (hasCrop || !applyToAll) ? { backgroundColor: "#14b8a6" } : {}}
          >
            {loading ? "Cropping..." : "Crop & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
