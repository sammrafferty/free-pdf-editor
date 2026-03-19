"use client";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfPagePreview from "../PdfPagePreview";

type Position = "center" | "diagonal" | "tiled";
type WatermarkMode = "text" | "image";
type FontChoice = "Helvetica" | "TimesRoman" | "Courier";

interface WatermarkPos {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  scale: number; // percentage scale (100 = base size)
}

const COLOR_SWATCHES: { label: string; hex: string; r: number; g: number; b: number }[] = [
  { label: "Black", hex: "#000000", r: 0, g: 0, b: 0 },
  { label: "Dark Gray", hex: "#666666", r: 0x66 / 255, g: 0x66 / 255, b: 0x66 / 255 },
  { label: "Light Gray", hex: "#999999", r: 0x99 / 255, g: 0x99 / 255, b: 0x99 / 255 },
  { label: "White", hex: "#ffffff", r: 1, g: 1, b: 1 },
  { label: "Red", hex: "#dc2626", r: 0xdc / 255, g: 0x26 / 255, b: 0x26 / 255 },
  { label: "Blue", hex: "#2563eb", r: 0x25 / 255, g: 0x63 / 255, b: 0xeb / 255 },
  { label: "Green", hex: "#16a34a", r: 0x16 / 255, g: 0xa3 / 255, b: 0x4a / 255 },
  { label: "Orange", hex: "#ea580c", r: 0xea / 255, g: 0x58 / 255, b: 0x0c / 255 },
];

const FONT_MAP: Record<FontChoice, typeof StandardFonts[keyof typeof StandardFonts]> = {
  Helvetica: StandardFonts.Helvetica,
  TimesRoman: StandardFonts.TimesRoman,
  Courier: StandardFonts.Courier,
};

// Default letter-size page dimensions (in PDF points)
const DEFAULT_PAGE_WIDTH = 612;
const DEFAULT_PAGE_HEIGHT = 792;

function calcDiagonalAngle(width: number, height: number): number {
  return (Math.atan2(height, width) * 180) / Math.PI;
}

function getFontFamily(fontChoice: FontChoice): string {
  if (fontChoice === "Courier") return "Courier, monospace";
  if (fontChoice === "TimesRoman") return "Times New Roman, serif";
  return "Helvetica, Arial, sans-serif";
}

export default function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);

  // Mode
  const [mode, setMode] = useState<WatermarkMode>("text");

  // Text options
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.2);
  const [position, setPosition] = useState<Position>("diagonal");
  const [colorIdx, setColorIdx] = useState(1); // Dark Gray default
  const [fontChoice, setFontChoice] = useState<FontChoice>("Helvetica");

  // Draggable position for center/diagonal modes (percentages)
  const [watermarkPos, setWatermarkPos] = useState<WatermarkPos>({ x: 50, y: 50, scale: 100 });

  // Rotation angle for diagonal mode
  const [autoAngle, setAutoAngle] = useState(true);
  const [manualAngle, setManualAngle] = useState(0);

  // Tiled spacing
  const [tileSpacing, setTileSpacing] = useState(100);

  // Image options
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState(50); // percentage of page width
  const [imagePosition, setImagePosition] = useState<"center" | "tiled">("center");
  const [imageOpacity, setImageOpacity] = useState(0.2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track object URL for cleanup to prevent memory leaks
  const imagePreviewUrlRef = useRef<string | null>(null);

  // Drag state ref
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    type: "move" | "resize";
    corner?: string;
    startMouseX: number;
    startMouseY: number;
    startPos: WatermarkPos;
    containerW: number;
    containerH: number;
  } | null>(null);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrlRef.current);
      }
    };
  }, []);

  const selectedColor = COLOR_SWATCHES[colorIdx];

  // Compute the diagonal angle used for both preview and PDF
  const autoAngleValue = calcDiagonalAngle(DEFAULT_PAGE_WIDTH, DEFAULT_PAGE_HEIGHT);
  const diagonalAngle = autoAngle ? autoAngleValue : manualAngle;

  const revokeImagePreview = useCallback(() => {
    if (imagePreviewUrlRef.current) {
      URL.revokeObjectURL(imagePreviewUrlRef.current);
      imagePreviewUrlRef.current = null;
    }
  }, []);

  const handleFile = useCallback(async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      setFile(f);
      setPageCount(pdf.getPageCount());
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
      setPageCount(0);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.toLowerCase();
    if (!ext.endsWith(".png") && !ext.endsWith(".jpg") && !ext.endsWith(".jpeg")) {
      setError("Please upload a PNG or JPG image.");
      return;
    }
    setError("");
    setImageFile(f);
    // Revoke previous URL before creating a new one
    revokeImagePreview();
    const url = URL.createObjectURL(f);
    imagePreviewUrlRef.current = url;
    setImagePreviewUrl(url);
  };

  // ---------- Drag-to-position ----------
  const getEventClientPos = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    if ("changedTouches" in e && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, type: "move" | "resize", corner?: string) => {
    e.stopPropagation();
    e.preventDefault();
    const container = overlayRef.current?.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const native = e.nativeEvent;
    const pos = getEventClientPos(native as MouseEvent | TouchEvent);

    dragState.current = {
      type,
      corner,
      startMouseX: pos.clientX,
      startMouseY: pos.clientY,
      startPos: { ...watermarkPos },
      containerW: rect.width,
      containerH: rect.height,
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

      if (ds.type === "move") {
        const newX = Math.max(0, Math.min(100, ds.startPos.x + dx));
        const newY = Math.max(0, Math.min(100, ds.startPos.y + dy));
        setWatermarkPos((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (ds.type === "resize") {
        // Scale based on diagonal mouse movement (positive = bigger)
        const diagDelta = (dx + dy) * 0.5;
        const newScale = Math.max(20, Math.min(300, ds.startPos.scale + diagDelta));
        setWatermarkPos((prev) => ({ ...prev, scale: newScale }));
      }
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

  // Sync font size with scale
  const scaledFontSize = Math.max(12, Math.min(200, Math.round(fontSize * (watermarkPos.scale / 100))));

  // When scale changes via resize handle, update fontSize to match
  // (font size input stays synced)
  const effectiveFontSize = scaledFontSize;

  const handleWatermark = async () => {
    if (!file || loading) return;
    if (mode === "text" && !text.trim()) {
      setError("Please enter watermark text.");
      return;
    }
    if (mode === "image" && !imageFile) return;

    // Clamp fontSize to valid range
    const clampedFontSize = Math.max(12, Math.min(200, effectiveFontSize || 48));
    // Clamp opacity to valid range (0-1)
    const clampedOpacity = Math.max(0, Math.min(1, opacity));

    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);

      if (mode === "text") {
        const watermarkText = text.trim();
        const font = await pdf.embedFont(FONT_MAP[fontChoice]);
        const color = rgb(selectedColor.r, selectedColor.g, selectedColor.b);

        for (let i = 0; i < pdf.getPageCount(); i++) {
          const page = pdf.getPage(i);
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(watermarkText, clampedFontSize);
          const textHeight = font.heightAtSize(clampedFontSize);

          if (position === "tiled") {
            const angle = 45;
            const radians = (angle * Math.PI) / 180;
            const spacingPx = Math.max(50, Math.min(300, tileSpacing));
            const cols = Math.ceil(width / (textWidth * Math.cos(radians) + spacingPx));
            const rows = Math.ceil(height / (clampedFontSize + spacingPx));
            const spacingX = width / Math.max(cols, 1);
            const spacingY = height / Math.max(rows, 1);

            for (let row = -1; row <= rows + 1; row++) {
              for (let col = -1; col <= cols + 1; col++) {
                const x = col * spacingX + (row % 2 === 0 ? 0 : spacingX / 2);
                const y = row * spacingY;
                page.drawText(watermarkText, {
                  x,
                  y,
                  size: clampedFontSize,
                  font,
                  color,
                  opacity: clampedOpacity,
                  rotate: degrees(angle),
                });
              }
            }
          } else if (position === "diagonal") {
            const angleDeg = autoAngle ? calcDiagonalAngle(width, height) : manualAngle;
            const angleRad = (angleDeg * Math.PI) / 180;

            // Map percentage position to PDF coordinates
            const pdfX = (watermarkPos.x / 100) * width;
            const pdfY = height - (watermarkPos.y / 100) * height;

            // Center the text at the position, accounting for rotation
            const x = pdfX - (textWidth / 2) * Math.cos(angleRad) + (textHeight / 2) * Math.sin(angleRad);
            const y = pdfY - (textWidth / 2) * Math.sin(angleRad) - (textHeight / 2) * Math.cos(angleRad);
            page.drawText(watermarkText, {
              x,
              y,
              size: clampedFontSize,
              font,
              color,
              opacity: clampedOpacity,
              rotate: degrees(angleDeg),
            });
          } else {
            // Center mode - use draggable position
            const pdfX = (watermarkPos.x / 100) * width;
            const pdfY = height - (watermarkPos.y / 100) * height;
            page.drawText(watermarkText, {
              x: pdfX - textWidth / 2,
              y: pdfY - textHeight / 2,
              size: clampedFontSize,
              font,
              color,
              opacity: clampedOpacity,
            });
          }
        }
      } else {
        // Image watermark
        if (!imageFile) throw new Error("No image selected");
        const imgBytes = new Uint8Array(await imageFile.arrayBuffer());
        const isPng = imageFile.name.toLowerCase().endsWith(".png");
        const img = isPng ? await pdf.embedPng(imgBytes) : await pdf.embedJpg(imgBytes);

        if (img.width === 0 || img.height === 0) {
          throw new Error("Image has invalid dimensions.");
        }

        const clampedImageOpacity = Math.max(0, Math.min(1, imageOpacity));

        for (let i = 0; i < pdf.getPageCount(); i++) {
          const page = pdf.getPage(i);
          const { width, height } = page.getSize();
          const imgWidth = width * (Math.max(1, Math.min(100, imageSize)) / 100);
          const imgHeight = imgWidth * (img.height / img.width);

          if (imagePosition === "tiled") {
            const spacingPx = Math.max(50, Math.min(300, tileSpacing));
            const cols = Math.ceil(width / (imgWidth + spacingPx)) + 1;
            const rows = Math.ceil(height / (imgHeight + spacingPx)) + 1;
            const spacingX = width / Math.max(cols, 1);
            const spacingY = height / Math.max(rows, 1);

            for (let row = 0; row < rows + 1; row++) {
              for (let col = 0; col < cols + 1; col++) {
                const x = col * spacingX;
                const y = row * spacingY;
                page.drawImage(img, {
                  x: x - imgWidth / 2,
                  y: y - imgHeight / 2,
                  width: imgWidth,
                  height: imgHeight,
                  opacity: clampedImageOpacity,
                });
              }
            }
          } else {
            // Center mode - use draggable position
            const pdfX = (watermarkPos.x / 100) * width;
            const pdfY = height - (watermarkPos.y / 100) * height;
            page.drawImage(img, {
              x: pdfX - imgWidth / 2,
              y: pdfY - imgHeight / 2,
              width: imgWidth,
              height: imgHeight,
              opacity: clampedImageOpacity,
            });
          }
        }
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `watermarked_${file.name}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to add watermark. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Corner handle for resize
  const renderCornerHandle = (corner: string, cursor: string) => (
    <div
      key={corner}
      onMouseDown={(e) => handleDragStart(e, "resize", corner)}
      onTouchStart={(e) => handleDragStart(e, "resize", corner)}
      style={{
        position: "absolute",
        width: 10,
        height: 10,
        backgroundColor: "#67e8f9",
        border: "2px solid #fff",
        borderRadius: 2,
        cursor,
        zIndex: 10,
        pointerEvents: "auto",
        ...(corner.includes("n") ? { top: -5 } : { bottom: -5 }),
        ...(corner.includes("w") ? { left: -5 } : { right: -5 }),
      }}
    />
  );

  const previewOverlay = useMemo(() => {
    // Preview container is 220px wide; approximate page aspect ratio
    const previewWidth = 220;
    const previewHeight = previewWidth * (DEFAULT_PAGE_HEIGHT / DEFAULT_PAGE_WIDTH);

    if (mode === "image" && imagePreviewUrl) {
      const imgStyle: React.CSSProperties =
        imagePosition === "tiled"
          ? { width: `${imageSize / 2}%`, opacity: imageOpacity }
          : { width: `${imageSize}%`, opacity: imageOpacity };

      if (imagePosition === "tiled") {
        const gapPct = `${(tileSpacing / DEFAULT_PAGE_WIDTH) * 100}%`;
        return (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: gapPct,
              padding: "4%",
              overflow: "hidden",
            }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={imagePreviewUrl} alt="" style={imgStyle} draggable={false} />
            ))}
          </div>
        );
      }

      // Center image mode - draggable
      return (
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            left: `${watermarkPos.x}%`,
            top: `${watermarkPos.y}%`,
            transform: "translate(-50%, -50%)",
            cursor: "move",
            touchAction: "none",
            pointerEvents: "auto",
          }}
          onMouseDown={(e) => handleDragStart(e, "move")}
          onTouchStart={(e) => handleDragStart(e, "move")}
        >
          <div style={{ position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreviewUrl}
              alt=""
              draggable={false}
              style={{
                ...imgStyle,
                width: `${(imageSize / 100) * previewWidth}px`,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
            {renderCornerHandle("nw", "nwse-resize")}
            {renderCornerHandle("ne", "nesw-resize")}
            {renderCornerHandle("sw", "nesw-resize")}
            {renderCornerHandle("se", "nwse-resize")}
          </div>
        </div>
      );
    }

    // Text preview overlay
    const previewAngle = diagonalAngle;
    // Scale font size relative to preview dimensions
    // PDF page is ~612pt wide, preview is ~220px, so scale = 220/612 * (scale/100)
    const scaleFactor = previewWidth / DEFAULT_PAGE_WIDTH;
    const previewFontSize = Math.max(6, effectiveFontSize * scaleFactor);

    if (position === "tiled") {
      const gapPct = (tileSpacing / DEFAULT_PAGE_WIDTH) * 100;
      const cellPct = gapPct > 0 ? gapPct : 35;
      const tileFontSize = Math.max(6, fontSize * scaleFactor);
      const tiles: { left: number; top: number }[] = [];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          tiles.push({
            left: 5 + col * cellPct,
            top: 5 + row * cellPct,
          });
        }
      }
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          {tiles.map((t, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${t.left}%`,
                top: `${t.top}%`,
                transform: "rotate(-45deg)",
                color: selectedColor.hex,
                opacity,
                fontSize: `${tileFontSize}px`,
                fontFamily: getFontFamily(fontChoice),
                fontWeight: "bold",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              {text}
            </span>
          ))}
        </div>
      );
    }

    // Center/diagonal mode - draggable overlay
    const rotation = position === "diagonal" ? `rotate(-${previewAngle.toFixed(1)}deg)` : "";
    const transform = `translate(-50%, -50%) ${rotation}`;

    return (
      <div
        ref={overlayRef}
        style={{
          position: "absolute",
          left: `${watermarkPos.x}%`,
          top: `${watermarkPos.y}%`,
          transform,
          cursor: "move",
          touchAction: "none",
          pointerEvents: "auto",
        }}
        onMouseDown={(e) => handleDragStart(e, "move")}
        onTouchStart={(e) => handleDragStart(e, "move")}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <span
            style={{
              color: selectedColor.hex,
              opacity,
              fontSize: `${previewFontSize}px`,
              fontFamily: getFontFamily(fontChoice),
              fontWeight: "bold",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {text}
          </span>
          {renderCornerHandle("nw", "nwse-resize")}
          {renderCornerHandle("ne", "nesw-resize")}
          {renderCornerHandle("sw", "nesw-resize")}
          {renderCornerHandle("se", "nwse-resize")}
        </div>
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, text, fontSize, opacity, position, selectedColor, fontChoice, imagePreviewUrl, imagePosition, imageSize, imageOpacity, diagonalAngle, tileSpacing, watermarkPos, effectiveFontSize]);

  const canApply =
    mode === "text" ? !!text.trim() : !!imageFile;

  // Determine if tiled position is active (for showing tile spacing slider)
  const isTiled = mode === "text" ? position === "tiled" : imagePosition === "tiled";

  // Determine if draggable mode is active (for hint text)
  const isDraggable = mode === "text"
    ? position === "center" || position === "diagonal"
    : imagePosition === "center";

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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} pages</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setImageFile(null); revokeImagePreview(); setImagePreviewUrl(null); setError(""); setPageCount(0); }} className="theme-text-muted text-sm font-medium">Remove</button>
          </div>

          {/* Preview with draggable watermark */}
          <div>
            {isDraggable && (
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Drag to position watermark
              </label>
            )}
            <div className="flex justify-center">
              <PdfPagePreview
                file={file}
                pageNumber={1}
                width={220}
                overlay={previewOverlay}
              />
            </div>
          </div>

          {/* Mode toggle: Text vs Image */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Watermark type</label>
            <div className="flex gap-2">
              {(["text", "image"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    mode === m ? "text-white border-cyan-400" : "theme-bg-secondary theme-border theme-text-secondary hover:border-cyan-300"
                  }`}
                  style={mode === m ? { backgroundColor: "#67e8f9", color: "#000" } : {}}
                >
                  {m === "text" ? "Text" : "Image"}
                </button>
              ))}
            </div>
          </div>

          {mode === "text" ? (
            <>
              {/* Watermark text */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Watermark text</label>
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400" />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Color</label>
                <div className="flex gap-2.5 flex-wrap">
                  {COLOR_SWATCHES.map((c, i) => (
                    <button
                      key={c.hex}
                      onClick={() => setColorIdx(i)}
                      title={c.label}
                      className="rounded-full transition-transform"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: c.hex,
                        border: colorIdx === i ? "3px solid #67e8f9" : c.hex === "#ffffff" ? "2px solid var(--border-primary)" : "2px solid transparent",
                        transform: colorIdx === i ? "scale(1.15)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Font selection */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Font</label>
                <div className="flex gap-2">
                  {(["Helvetica", "TimesRoman", "Courier"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFontChoice(f)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                        fontChoice === f ? "text-black border-cyan-400" : "theme-bg-secondary theme-border theme-text-secondary hover:border-cyan-300"
                      }`}
                      style={{
                        ...(fontChoice === f ? { backgroundColor: "#67e8f9" } : {}),
                        fontFamily: getFontFamily(f),
                      }}
                    >
                      {f === "TimesRoman" ? "Times" : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size & opacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Font size</label>
                  <input type="number" value={fontSize} onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v)) setFontSize(v); }} onBlur={() => setFontSize(Math.max(12, Math.min(200, fontSize || 48)))} min={12} max={200} className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Opacity ({Math.round(opacity * 100)}%)</label>
                  <input type="range" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} min={0.05} max={1} step={0.05} className="w-full mt-3 accent-cyan-400" />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Position</label>
                <div className="flex gap-2">
                  {(["center", "diagonal", "tiled"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPosition(p); if (p !== "tiled") setWatermarkPos({ x: 50, y: 50, scale: 100 }); }}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        position === p ? "text-black border-cyan-400" : "theme-bg-secondary theme-border theme-text-secondary hover:border-cyan-300"
                      }`}
                      style={position === p ? { backgroundColor: "#67e8f9" } : {}}
                    >
                      {p === "center" ? "Center" : p === "diagonal" ? "Diagonal" : "Tiled"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation angle (diagonal mode only) */}
              {position === "diagonal" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium theme-text-secondary">Rotation angle ({Math.round(diagonalAngle)}°)</label>
                    <label className="flex items-center gap-2 text-sm theme-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoAngle}
                        onChange={(e) => {
                          setAutoAngle(e.target.checked);
                          if (e.target.checked) {
                            setManualAngle(Math.round(autoAngleValue));
                          }
                        }}
                        className="accent-cyan-400"
                      />
                      Auto angle
                    </label>
                  </div>
                  <input
                    type="range"
                    value={autoAngle ? Math.round(autoAngleValue) : manualAngle}
                    onChange={(e) => setManualAngle(Number(e.target.value))}
                    disabled={autoAngle}
                    min={-90}
                    max={90}
                    step={1}
                    className="w-full accent-cyan-400 disabled:opacity-50"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Watermark image (PNG or JPG)</label>
                <label
                  className="flex items-center justify-center w-full py-4 rounded-xl border-2 border-dashed theme-border cursor-pointer hover:border-cyan-300 transition-colors"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imageFile ? (
                    <div className="flex items-center gap-3">
                      {imagePreviewUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imagePreviewUrl} alt="Preview" style={{ maxHeight: 40, maxWidth: 60, borderRadius: 4 }} />
                      )}
                      <span className="text-sm theme-text">{imageFile.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm theme-text-muted">Click to upload image</span>
                  )}
                </label>
              </div>

              {/* Image size slider */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Size ({imageSize}% of page width)</label>
                <input type="range" value={imageSize} onChange={(e) => setImageSize(Number(e.target.value))} min={10} max={100} step={1} className="w-full accent-cyan-400" />
              </div>

              {/* Image opacity */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Opacity ({Math.round(imageOpacity * 100)}%)</label>
                <input type="range" value={imageOpacity} onChange={(e) => setImageOpacity(Number(e.target.value))} min={0.05} max={1} step={0.05} className="w-full accent-cyan-400" />
              </div>

              {/* Image position */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Position</label>
                <div className="flex gap-2">
                  {(["center", "tiled"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setImagePosition(p); if (p === "center") setWatermarkPos({ x: 50, y: 50, scale: 100 }); }}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                        imagePosition === p ? "text-black border-cyan-400" : "theme-bg-secondary theme-border theme-text-secondary hover:border-cyan-300"
                      }`}
                      style={imagePosition === p ? { backgroundColor: "#67e8f9" } : {}}
                    >
                      {p === "center" ? "Center" : "Tiled"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tile spacing (visible when tiled is selected) */}
          {isTiled && (
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">Tile spacing ({tileSpacing}px)</label>
              <input
                type="range"
                value={tileSpacing}
                onChange={(e) => setTileSpacing(Number(e.target.value))}
                min={50}
                max={300}
                step={1}
                className="w-full accent-cyan-400"
              />
            </div>
          )}

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleWatermark}
            disabled={loading || !canApply}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading && canApply ? { backgroundColor: "#67e8f9", color: "#000" } : {}}
          >
            {loading ? "Adding watermark..." : "Add Watermark & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
