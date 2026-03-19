"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfPagePreview from "@/app/components/PdfPagePreview";
import PdfThumbnailGrid from "@/app/components/PdfThumbnailGrid";

// ==================== Types & Constants ====================

interface RedactRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SigPos {
  x: number;
  y: number;
  width: number;
  height: number;
}

type RedactStyle = "solid" | "crosshatch" | "pixelate";

const COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#ffffff", label: "White" },
  { value: "#6b7280", label: "Gray" },
  { value: "#64748b", label: "Slate" },
];

const STYLES: { value: RedactStyle; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "crosshatch", label: "Crosshatch" },
  { value: "pixelate", label: "Pixelate" },
];

let _nextId = 0;
function genId() {
  return `r${++_nextId}_${Date.now()}`;
}

function computeResize(startPos: SigPos, corner: string, dx: number, dy: number): SigPos {
  const minSize = 2;
  const p = { ...startPos };
  if (corner === "se") {
    p.width = Math.max(minSize, Math.min(100 - startPos.x, startPos.width + dx));
    p.height = Math.max(minSize, Math.min(100 - startPos.y, startPos.height + dy));
  } else if (corner === "sw") {
    const newW = Math.max(minSize, Math.min(startPos.x + startPos.width, startPos.width - dx));
    p.x = startPos.x + startPos.width - newW;
    p.width = newW;
    p.height = Math.max(minSize, Math.min(100 - startPos.y, startPos.height + dy));
  } else if (corner === "ne") {
    p.width = Math.max(minSize, Math.min(100 - startPos.x, startPos.width + dx));
    const newH = Math.max(minSize, Math.min(startPos.y + startPos.height, startPos.height - dy));
    p.y = startPos.y + startPos.height - newH;
    p.height = newH;
  } else if (corner === "nw") {
    const newW = Math.max(minSize, Math.min(startPos.x + startPos.width, startPos.width - dx));
    p.x = startPos.x + startPos.width - newW;
    p.width = newW;
    const newH = Math.max(minSize, Math.min(startPos.y + startPos.height, startPos.height - dy));
    p.y = startPos.y + startPos.height - newH;
    p.height = newH;
  }
  return p;
}

function pixelateRegion(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  const pixelSize = Math.max(6, Math.floor(Math.min(rw, rh) / 10));
  const imgData = ctx.getImageData(rx, ry, rw, rh);
  const data = imgData.data;
  const w = imgData.width;
  const h = imgData.height;

  for (let by = 0; by < h; by += pixelSize) {
    for (let bx = 0; bx < w; bx += pixelSize) {
      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      const maxY = Math.min(by + pixelSize, h);
      const maxX = Math.min(bx + pixelSize, w);
      for (let py = by; py < maxY; py++) {
        for (let px = bx; px < maxX; px++) {
          const i = (py * w + px) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      for (let py = by; py < maxY; py++) {
        for (let px = bx; px < maxX; px++) {
          const i = (py * w + px) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(imgData, rx, ry);
}

function lightenColor(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `rgb(${r},${g},${b})`;
}

// ==================== Component ====================

export default function RedactTool() {
  // --- File state ---
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  // --- Page & regions ---
  const [activePage, setActivePage] = useState(1);
  const [pageRegions, setPageRegions] = useState<Record<number, RedactRegion[]>>({});
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);

  // --- Drawing state ---
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const drawingOverlayRef = useRef<HTMLDivElement>(null);

  // --- Options ---
  const [redactColor, setRedactColor] = useState("#000000");
  const [customColor, setCustomColor] = useState("#ef4444");
  const [redactStyle, setRedactStyle] = useState<RedactStyle>("solid");
  const [outputQuality, setOutputQuality] = useState<"high" | "max">("high");
  const [showOptions, setShowOptions] = useState(false);

  // --- Drag/resize ---
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    type: "move" | "resize";
    corner?: string;
    startMouseX: number;
    startMouseY: number;
    startPos: SigPos;
    containerW: number;
    containerH: number;
    regionId: string;
    pageNum: number;
  } | null>(null);

  // ==================== File handling ====================
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
        return;
      }
      setFile(f);
      setPageCount(count);
      setActivePage(1);
      setPageRegions({});
      setEditingRegionId(null);
      setProgress(0);
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  // ==================== Drawing ====================
  const getPositionPercent = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const el = drawingOverlayRef.current;
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
    setEditingRegionId(null);
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

    if (width >= 1 && height >= 1) {
      const region: RedactRegion = { id: genId(), x, y, width, height };
      setPageRegions((prev) => ({
        ...prev,
        [activePage]: [...(prev[activePage] || []), region],
      }));
      setEditingRegionId(region.id);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    handlePointerDown(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => handlePointerMove(e.clientX, e.clientY);
  const onMouseUp = () => handlePointerUp();
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handlePointerUp();
  };

  // ==================== Region management ====================
  const removeRegion = useCallback((regionId: string) => {
    setPageRegions((prev) => {
      const next = { ...prev };
      for (const p of Object.keys(next)) {
        const filtered = next[Number(p)].filter((r) => r.id !== regionId);
        if (filtered.length === 0) {
          delete next[Number(p)];
        } else {
          next[Number(p)] = filtered;
        }
      }
      return next;
    });
    setEditingRegionId((prev) => (prev === regionId ? null : prev));
  }, []);

  const undoLast = () => {
    const regs = pageRegions[activePage];
    if (!regs || regs.length === 0) return;
    removeRegion(regs[regs.length - 1].id);
  };

  const clearPage = () => {
    setPageRegions((prev) => {
      const next = { ...prev };
      delete next[activePage];
      return next;
    });
    setEditingRegionId(null);
  };

  const clearAll = () => {
    setPageRegions({});
    setEditingRegionId(null);
  };

  const applyToAllPages = () => {
    const current = pageRegions[activePage];
    if (!current || current.length === 0) return;
    setPageRegions((prev) => {
      const next = { ...prev };
      for (let p = 1; p <= pageCount; p++) {
        if (p === activePage) continue;
        const copies = current.map((r) => ({ ...r, id: genId() }));
        next[p] = [...(next[p] || []), ...copies];
      }
      return next;
    });
  };

  // ==================== Drag/resize ====================
  const getEventClientPos = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    if ("changedTouches" in e && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
  };

  const handleRegionDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    type: "move" | "resize",
    regionId: string,
    corner?: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const container = previewContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const native = e.nativeEvent;
    const pos = getEventClientPos(native as MouseEvent | TouchEvent);

    const region = (pageRegions[activePage] || []).find((r) => r.id === regionId);
    if (!region) return;

    dragState.current = {
      type,
      corner,
      startMouseX: pos.clientX,
      startMouseY: pos.clientY,
      startPos: { x: region.x, y: region.y, width: region.width, height: region.height },
      containerW: rect.width,
      containerH: rect.height,
      regionId,
      pageNum: activePage,
    };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragState.current) return;
      e.preventDefault();
      const pos = getEventClientPos(e);
      const ds = dragState.current;
      const dx = ((pos.clientX - ds.startMouseX) / ds.containerW) * 100;
      const dy = ((pos.clientY - ds.startMouseY) / ds.containerH) * 100;

      let newPos: SigPos;
      if (ds.type === "move") {
        newPos = {
          ...ds.startPos,
          x: Math.max(0, Math.min(100 - ds.startPos.width, ds.startPos.x + dx)),
          y: Math.max(0, Math.min(100 - ds.startPos.height, ds.startPos.y + dy)),
        };
      } else {
        newPos = computeResize(ds.startPos, ds.corner!, dx, dy);
      }

      setPageRegions((prev) => {
        const regs = [...(prev[ds.pageNum] || [])];
        const idx = regs.findIndex((r) => r.id === ds.regionId);
        if (idx >= 0) regs[idx] = { ...regs[idx], ...newPos };
        return { ...prev, [ds.pageNum]: regs };
      });
    };

    const handleUp = () => {
      dragState.current = null;
    };

    window.addEventListener("mousemove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, []);

  // Keyboard: Delete/Backspace removes selected region
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && editingRegionId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        removeRegion(editingRegionId);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [editingRegionId, removeRegion]);

  // ==================== Redact & Download ====================
  const handleRedact = async () => {
    if (!file) return;
    const pagesWithRegions = Object.keys(pageRegions)
      .map(Number)
      .filter((p) => pageRegions[p]?.length > 0);
    if (pagesWithRegions.length === 0) {
      setError("No redaction regions drawn. Draw rectangles on pages to redact areas.");
      return;
    }
    setLoading(true);
    setError("");
    setProgress(0);

    try {
      const buf = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;

      const redactedPageNums = new Set(pagesWithRegions);
      const newPdf = await PDFDocument.create();
      const origPdf = await PDFDocument.load(buf);

      for (let i = 0; i < doc.numPages; i++) {
        const pageNum = i + 1;
        setProgress(Math.round((i / doc.numPages) * 100));

        if (redactedPageNums.has(pageNum)) {
          const pdfPage = await doc.getPage(pageNum);
          const scale = 3;
          const viewport = pdfPage.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Could not create canvas context.");

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await pdfPage.render({ canvasContext: ctx, viewport, canvas } as any).promise;

          const regions = pageRegions[pageNum] || [];
          for (const region of regions) {
            const rx = (region.x / 100) * viewport.width;
            const ry = (region.y / 100) * viewport.height;
            const rw = (region.width / 100) * viewport.width;
            const rh = (region.height / 100) * viewport.height;

            if (redactStyle === "pixelate") {
              pixelateRegion(ctx, Math.round(rx), Math.round(ry), Math.round(rw), Math.round(rh));
            } else {
              ctx.fillStyle = redactColor;
              ctx.fillRect(rx, ry, rw, rh);
              if (redactStyle === "crosshatch") {
                ctx.save();
                ctx.beginPath();
                ctx.rect(rx, ry, rw, rh);
                ctx.clip();
                ctx.strokeStyle = lightenColor(redactColor, 40);
                ctx.lineWidth = 2;
                const maxDim = Math.max(rw, rh);
                for (let d = -maxDim; d < maxDim * 2; d += 10) {
                  ctx.moveTo(rx + d, ry);
                  ctx.lineTo(rx + d - rh, ry + rh);
                }
                ctx.stroke();
                ctx.restore();
              }
            }
          }

          const origPage = origPdf.getPage(i);
          const { width: origW, height: origH } = origPage.getSize();
          const page = newPdf.addPage([origW, origH]);

          if (outputQuality === "max") {
            const imgDataUrl = canvas.toDataURL("image/png");
            const imgBytes = Uint8Array.from(atob(imgDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
            const img = await newPdf.embedPng(imgBytes);
            page.drawImage(img, { x: 0, y: 0, width: origW, height: origH });
          } else {
            const imgDataUrl = canvas.toDataURL("image/jpeg", 0.95);
            const imgBytes = Uint8Array.from(atob(imgDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
            const img = await newPdf.embedJpg(imgBytes);
            page.drawImage(img, { x: 0, y: 0, width: origW, height: origH });
          }
        } else {
          const [copied] = await newPdf.copyPages(origPdf, [i]);
          newPdf.addPage(copied);
        }
      }

      setProgress(100);
      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `redacted_${file.name}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to redact PDF. Please try again.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // ==================== Computed values ====================
  const totalRegionCount = Object.values(pageRegions).reduce((sum, regs) => sum + regs.length, 0);
  const pagesWithRegionsCount = Object.keys(pageRegions).filter(
    (p) => pageRegions[Number(p)]?.length > 0,
  ).length;
  const currentPageRegs = pageRegions[activePage] || [];
  const hasRegions = totalRegionCount > 0;
  const activeColor = redactColor;

  // In-progress drawing rectangle
  const drawRect =
    isDrawing && drawStart && drawCurrent
      ? {
          x: Math.min(drawStart.x, drawCurrent.x),
          y: Math.min(drawStart.y, drawCurrent.y),
          width: Math.abs(drawCurrent.x - drawStart.x),
          height: Math.abs(drawCurrent.y - drawStart.y),
        }
      : null;

  // ==================== Render helpers ====================
  const renderCornerHandle = (corner: string, cursor: string, regionId: string) => (
    <div
      key={corner}
      onMouseDown={(e) => handleRegionDragStart(e, "resize", regionId, corner)}
      onTouchStart={(e) => handleRegionDragStart(e, "resize", regionId, corner)}
      style={{
        position: "absolute",
        width: 12,
        height: 12,
        backgroundColor: "#64748b",
        border: "2px solid #fff",
        borderRadius: 2,
        cursor,
        zIndex: 10,
        pointerEvents: "auto",
        ...(corner.includes("n") ? { top: -6 } : { bottom: -6 }),
        ...(corner.includes("w") ? { left: -6 } : { right: -6 }),
      }}
    />
  );

  // Crosshatch SVG pattern for preview
  const crosshatchPattern = (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={lightenColor(activeColor, 40)} strokeWidth="1.5" />
        </pattern>
      </defs>
    </svg>
  );

  const renderThumbnailOverlay = useCallback(
    (pageNum: number) => {
      const regs = pageRegions[pageNum];
      if (!regs || regs.length === 0) return null;
      return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {regs.map((r) => (
            <div
              key={r.id}
              style={{
                position: "absolute",
                left: `${r.x}%`,
                top: `${r.y}%`,
                width: `${r.width}%`,
                height: `${r.height}%`,
                backgroundColor: redactStyle === "pixelate" ? "rgba(100,116,139,0.35)" : activeColor,
                opacity: redactStyle === "pixelate" ? 1 : 0.7,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: "#64748b",
              color: "#fff",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: "0.65rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {regs.length}
          </div>
        </div>
      );
    },
    [pageRegions, activeColor, redactStyle],
  );

  // Region style for preview (solid/crosshatch/pixelate indication)
  const getRegionPreviewStyle = (isEditing: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      boxSizing: "border-box",
      border: isEditing ? "2px dashed #64748b" : "1px solid rgba(100,116,139,0.5)",
      position: "relative",
    };
    if (redactStyle === "pixelate") {
      return {
        ...base,
        backgroundColor: "rgba(100,116,139,0.25)",
        backgroundImage: `repeating-conic-gradient(rgba(100,116,139,0.3) 0% 25%, transparent 0% 50%)`,
        backgroundSize: "12px 12px",
      };
    }
    return {
      ...base,
      backgroundColor: activeColor,
      opacity: 0.8,
    };
  };

  // Large preview overlay with placed regions + drawing layer
  const previewOverlay = (
    <div ref={previewContainerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      {crosshatchPattern}
      {/* Placed regions */}
      {currentPageRegs.map((r) => {
        const isEditing = editingRegionId === r.id;
        return (
          <div
            key={r.id}
            style={{
              position: "absolute",
              left: `${r.x}%`,
              top: `${r.y}%`,
              width: `${r.width}%`,
              height: `${r.height}%`,
              pointerEvents: "auto",
              cursor: isEditing ? "move" : "pointer",
              touchAction: "none",
              zIndex: isEditing ? 5 : 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setEditingRegionId(isEditing ? null : r.id);
            }}
            onMouseDown={(e) => {
              if (isEditing) {
                e.stopPropagation();
                handleRegionDragStart(e, "move", r.id);
              }
            }}
            onTouchStart={(e) => {
              if (isEditing) {
                e.stopPropagation();
                handleRegionDragStart(e, "move", r.id);
              }
            }}
          >
            <div style={{ width: "100%", height: "100%", ...getRegionPreviewStyle(isEditing) }}>
              {redactStyle === "crosshatch" && (
                <svg
                  width="100%"
                  height="100%"
                  style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
                >
                  <rect width="100%" height="100%" fill="url(#crosshatch)" />
                </svg>
              )}
              {isEditing && (
                <>
                  {renderCornerHandle("nw", "nwse-resize", r.id)}
                  {renderCornerHandle("ne", "nesw-resize", r.id)}
                  {renderCornerHandle("sw", "nesw-resize", r.id)}
                  {renderCornerHandle("se", "nwse-resize", r.id)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRegion(r.id);
                    }}
                    style={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      border: "2px solid #fff",
                      fontSize: "11px",
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 20,
                      pointerEvents: "auto",
                    }}
                  >
                    &times;
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Drawing layer (behind placed regions via z-index) */}
      <div
        ref={drawingOverlayRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "auto",
          cursor: "crosshair",
          zIndex: 1,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {drawRect && (
          <div
            style={{
              position: "absolute",
              left: `${drawRect.x}%`,
              top: `${drawRect.y}%`,
              width: `${drawRect.width}%`,
              height: `${drawRect.height}%`,
              border: "2px dashed #64748b",
              backgroundColor: "rgba(100, 116, 139, 0.25)",
              pointerEvents: "none",
              boxSizing: "border-box",
            }}
          />
        )}
      </div>
    </div>
  );

  // ==================== Render ====================
  return (
    <div>
      {!file ? (
        <div>
          <Dropzone onFiles={handleFile} />
          {error && (
            <div className="mt-4 p-3 theme-error rounded-xl text-sm">{error}</div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* File card */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">
                  {pageCount} page{pageCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPageCount(0);
                setActivePage(1);
                setPageRegions({});
                setEditingRegionId(null);
                setError("");
                setProgress(0);
              }}
              className="theme-text-muted text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Warning */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-700">
              Redacted pages are flattened to images to ensure underlying text is permanently removed
              and cannot be recovered.
            </p>
          </div>

          {/* ========== Options Panel ========== */}
          <div>
            <button
              onClick={() => setShowOptions((p) => !p)}
              className="flex items-center gap-2 text-sm font-semibold theme-text-secondary mb-2 w-full"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                style={{
                  transform: showOptions ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s",
                }}
              >
                <path d="M4 2l4 4-4 4z" />
              </svg>
              Redaction Options
            </button>

            {showOptions && (
              <div
                className="space-y-4 p-4 rounded-xl"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                {/* Color */}
                <div>
                  <label className="block text-xs font-medium theme-text-secondary mb-2">
                    Redaction Color
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setRedactColor(c.value)}
                        title={c.label}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          backgroundColor: c.value,
                          border:
                            redactColor === c.value
                              ? "3px solid #64748b"
                              : c.value === "#ffffff"
                                ? "2px solid var(--border-primary)"
                                : "2px solid transparent",
                          cursor: "pointer",
                          transition: "border-color 0.15s",
                          boxShadow:
                            redactColor === c.value ? "0 0 0 2px rgba(100,116,139,0.3)" : "none",
                        }}
                      />
                    ))}
                    <div className="flex items-center gap-1.5 ml-1">
                      <button
                        onClick={() => setRedactColor(customColor)}
                        title="Custom color"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          backgroundColor: customColor,
                          border:
                            redactColor === customColor && !COLORS.some((c) => c.value === redactColor)
                              ? "3px solid #64748b"
                              : "2px solid var(--border-primary)",
                          cursor: "pointer",
                          transition: "border-color 0.15s",
                          boxShadow:
                            redactColor === customColor && !COLORS.some((c) => c.value === redactColor)
                              ? "0 0 0 2px rgba(100,116,139,0.3)"
                              : "none",
                        }}
                      />
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setRedactColor(e.target.value);
                        }}
                        className="w-6 h-6 rounded cursor-pointer"
                        style={{ padding: 0, border: "none", background: "none" }}
                        title="Pick custom color"
                      />
                    </div>
                  </div>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-xs font-medium theme-text-secondary mb-2">
                    Redaction Style
                  </label>
                  <div className="flex gap-2">
                    {STYLES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setRedactStyle(s.value)}
                        className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                        style={
                          redactStyle === s.value
                            ? { backgroundColor: "#64748b", color: "#fff" }
                            : {
                                backgroundColor: "var(--bg-tertiary)",
                                color: "var(--text-secondary)",
                              }
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-xs font-medium theme-text-secondary mb-2">
                    Output Quality
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOutputQuality("high")}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                      style={
                        outputQuality === "high"
                          ? { backgroundColor: "#64748b", color: "#fff" }
                          : {
                              backgroundColor: "var(--bg-tertiary)",
                              color: "var(--text-secondary)",
                            }
                      }
                    >
                      High (JPEG)
                    </button>
                    <button
                      onClick={() => setOutputQuality("max")}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                      style={
                        outputQuality === "max"
                          ? { backgroundColor: "#64748b", color: "#fff" }
                          : {
                              backgroundColor: "var(--bg-tertiary)",
                              color: "var(--text-secondary)",
                            }
                      }
                    >
                      Maximum (PNG)
                    </button>
                  </div>
                  <p className="text-xs theme-text-muted mt-1">
                    {outputQuality === "max"
                      ? "Lossless quality, larger file size"
                      : "Great quality, smaller file size"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ========== Thumbnail Grid ========== */}
          {pageCount > 1 && (
            <div>
              <label className="block text-sm font-semibold theme-text-secondary mb-2">
                Pages
                <span className="font-normal theme-text-muted">
                  {" "}&mdash; click to select page, then draw redactions below
                </span>
              </label>
              <PdfThumbnailGrid
                file={file}
                pageCount={pageCount}
                selected={new Set([activePage])}
                onToggle={(p) => {
                  setActivePage(p);
                  setEditingRegionId(null);
                }}
                renderOverlay={renderThumbnailOverlay}
                columns={4}
                thumbnailScale={0.25}
              />
            </div>
          )}

          {/* ========== Active Page Preview ========== */}
          {file && (
            <div>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <label className="text-sm font-semibold theme-text-secondary">
                  Page {activePage}
                  {currentPageRegs.length > 0 && (
                    <span className="font-normal theme-text-muted">
                      {" "}&mdash; {currentPageRegs.length} region
                      {currentPageRegs.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {pageCount === 1 && (
                    <span className="font-normal theme-text-muted"> of 1</span>
                  )}
                </label>
                {/* Page nav for single-column or quick access */}
                {pageCount > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActivePage(Math.max(1, activePage - 1));
                        setEditingRegionId(null);
                      }}
                      disabled={activePage === 1}
                      className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color: activePage === 1 ? "var(--text-muted)" : "var(--text-secondary)",
                      }}
                    >
                      &larr;
                    </button>
                    <span className="text-xs theme-text-muted px-1">
                      {activePage}/{pageCount}
                    </span>
                    <button
                      onClick={() => {
                        setActivePage(Math.min(pageCount, activePage + 1));
                        setEditingRegionId(null);
                      }}
                      disabled={activePage === pageCount}
                      className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color:
                          activePage === pageCount ? "var(--text-muted)" : "var(--text-secondary)",
                      }}
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {currentPageRegs.length > 0 && (
                  <>
                    {pageCount > 1 && (
                      <button
                        onClick={applyToAllPages}
                        className="py-2 px-4 rounded-xl text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-primary)",
                        }}
                      >
                        Apply to All Pages
                      </button>
                    )}
                    <button
                      onClick={undoLast}
                      className="py-2 px-4 rounded-xl text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-primary)",
                      }}
                    >
                      Undo Last
                    </button>
                    <button
                      onClick={clearPage}
                      className="py-2 px-4 rounded-xl text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-primary)",
                      }}
                    >
                      Clear Page
                    </button>
                  </>
                )}
              </div>

              {/* Large preview */}
              <div className="flex justify-center" onClick={() => setEditingRegionId(null)}>
                <PdfPagePreview
                  file={file}
                  pageNumber={activePage}
                  width={500}
                  overlay={previewOverlay}
                  className="shadow-lg select-none"
                />
              </div>

              {/* Hints */}
              {currentPageRegs.length === 0 && (
                <p className="text-xs theme-text-muted mt-2 text-center">
                  Click and drag on the page to draw redaction regions
                </p>
              )}
              {editingRegionId && (
                <p className="text-xs theme-text-muted mt-2 text-center">
                  Drag to move &middot; Use corners to resize &middot; Press Delete to remove
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">{error}</div>
          )}

          {/* ========== Download ========== */}
          <div>
            <button
              onClick={handleRedact}
              disabled={loading || !hasRegions}
              className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
              style={!loading && hasRegions ? { backgroundColor: "#64748b" } : {}}
            >
              {loading
                ? `Redacting... ${progress}%`
                : hasRegions
                  ? `Redact & Download (${totalRegionCount} region${totalRegionCount !== 1 ? "s" : ""} on ${pagesWithRegionsCount} page${pagesWithRegionsCount !== 1 ? "s" : ""})`
                  : "Redact & Download"}
            </button>
            {loading && (
              <div
                className="w-full h-1 rounded-full mt-2 overflow-hidden"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: "#64748b",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}
            {hasRegions && !loading && (
              <button
                onClick={clearAll}
                className="w-full mt-2 text-xs theme-text-muted font-medium text-center py-1"
              >
                Clear All Regions
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
