"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { loadPdfDocument, downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfPagePreview from "../PdfPagePreview";
import PdfThumbnailGrid from "../PdfThumbnailGrid";

// ==================== Types & Constants ====================

interface ExtractedTextItem {
  id: string;
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  isBold: boolean;
  isItalic: boolean;
  color: { r: number; g: number; b: number };
  bgColor: { r: number; g: number; b: number };
  pctX: number;
  pctY: number;
  pctWidth: number;
  pctHeight: number;
}

type FontChoice = "Helvetica" | "TimesRoman" | "Courier";

interface TextEdit {
  id: string;
  originalItem: ExtractedTextItem;
  newText: string;
  fontChoice: FontChoice;
  fontSize: number;
  color: { r: number; g: number; b: number };
  isBold: boolean;
}

type PageEdits = Record<number, TextEdit[]>;
type PageTextItems = Record<number, ExtractedTextItem[]>;

const COLOR_SWATCHES = [
  { r: 0, g: 0, b: 0, label: "Black", hex: "#000000" },
  { r: 37, g: 99, b: 235, label: "Blue", hex: "#2563eb" },
  { r: 220, g: 38, b: 38, label: "Red", hex: "#dc2626" },
  { r: 107, g: 114, b: 128, label: "Gray", hex: "#6b7280" },
];

let _nextId = 0;
function genId() {
  return `et${++_nextId}_${Date.now()}`;
}

// ==================== Font Helpers ====================

function autoSelectFont(
  fontName: string,
  isBold: boolean,
  isItalic: boolean,
): FontChoice {
  const name = (fontName || "").toLowerCase();
  if (/times|serif|georgia|garamond|palatino|book\s?antiqua/i.test(name))
    return "TimesRoman";
  if (/courier|mono|consola|fixed|menlo|fira\s?code/i.test(name))
    return "Courier";
  return "Helvetica";
}

function getStandardFontKey(
  fontChoice: FontChoice,
  isBold: boolean,
  isItalic?: boolean,
): keyof typeof StandardFonts {
  if (fontChoice === "Helvetica") {
    if (isBold && isItalic) return "HelveticaBoldOblique";
    if (isBold) return "HelveticaBold";
    if (isItalic) return "HelveticaOblique";
    return "Helvetica";
  }
  if (fontChoice === "TimesRoman") {
    if (isBold && isItalic) return "TimesRomanBoldItalic";
    if (isBold) return "TimesRomanBold";
    if (isItalic) return "TimesRomanItalic";
    return "TimesRoman";
  }
  // Courier
  if (isBold && isItalic) return "CourierBoldOblique";
  if (isBold) return "CourierBold";
  if (isItalic) return "CourierOblique";
  return "Courier";
}

function getCssFontFamily(fontChoice: FontChoice): string {
  if (fontChoice === "Courier") return "Courier, 'Courier New', monospace";
  if (fontChoice === "TimesRoman") return "'Times New Roman', Times, serif";
  return "Helvetica, Arial, sans-serif";
}

// ==================== Text Extraction Helpers ====================

async function extractTextColors(
  page: import("pdfjs-dist").PDFPageProxy,
): Promise<Map<number, { r: number; g: number; b: number }>> {
  const colorMap = new Map<number, { r: number; g: number; b: number }>();
  try {
    const pdfjsLib = await import("pdfjs-dist");
    const ops = await page.getOperatorList();
    const OPS = pdfjsLib.OPS;

    let currentColor = { r: 0, g: 0, b: 0 };
    const colorStack: { r: number; g: number; b: number }[] = [];
    let textItemIndex = 0;

    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      const args = ops.argsArray[i];

      switch (fn) {
        case OPS.save:
          colorStack.push({ ...currentColor });
          break;
        case OPS.restore:
          if (colorStack.length > 0) {
            currentColor = colorStack.pop()!;
          }
          break;
        case (OPS as Record<string, number>)["setFillRGBColor"]:
          if (args && args.length >= 3) {
            currentColor = {
              r: Math.round(args[0] * 255),
              g: Math.round(args[1] * 255),
              b: Math.round(args[2] * 255),
            };
          }
          break;
        case (OPS as Record<string, number>)["setFillGray"]:
          if (args && args.length >= 1) {
            const gray = Math.round(args[0] * 255);
            currentColor = { r: gray, g: gray, b: gray };
          }
          break;
        case (OPS as Record<string, number>)["setFillCMYKColor"]:
          if (args && args.length >= 4) {
            const c = args[0],
              m = args[1],
              y = args[2],
              k = args[3];
            currentColor = {
              r: Math.round(255 * (1 - c) * (1 - k)),
              g: Math.round(255 * (1 - m) * (1 - k)),
              b: Math.round(255 * (1 - y) * (1 - k)),
            };
          }
          break;
        case (OPS as Record<string, number>)["setFillColorN"]:
        case (OPS as Record<string, number>)["setFillColor"]:
          if (args && args.length >= 3) {
            currentColor = {
              r: Math.round(args[0] * 255),
              g: Math.round(args[1] * 255),
              b: Math.round(args[2] * 255),
            };
          }
          break;
        case OPS.showText:
        case OPS.showSpacedText:
        case (OPS as Record<string, number>)["nextLineShowText"]:
        case (OPS as Record<string, number>)["nextLineSetSpacingShowText"]:
          colorMap.set(textItemIndex, { ...currentColor });
          textItemIndex++;
          break;
      }
    }
  } catch {
    // Color extraction is best-effort
  }
  return colorMap;
}

function mergeAdjacentItems(
  items: ExtractedTextItem[],
  pageWidth: number,
  pageHeight: number,
): ExtractedTextItem[] {
  if (items.length === 0) return [];

  // Sort by y descending (top of page first in visual), then x ascending
  const sorted = [...items].sort((a, b) => {
    const yDiff = Math.abs(a.y - b.y);
    if (yDiff > Math.max(a.fontSize, b.fontSize) * 0.5) return b.y - a.y;
    return a.x - b.x;
  });

  const merged: ExtractedTextItem[] = [];
  let current = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    const sameLine =
      Math.abs(item.y - current.y) <
      Math.max(current.fontSize, item.fontSize) * 0.5;
    const gap = item.x - (current.x + current.width);
    const closeEnough = gap < current.fontSize * 1.5 && gap >= -2;

    if (sameLine && closeEnough) {
      const space = gap > current.fontSize * 0.15 ? " " : "";
      current = {
        ...current,
        str: current.str + space + item.str,
        width: item.x + item.width - current.x,
        height: Math.max(current.height, item.height),
        fontSize: Math.max(current.fontSize, item.fontSize),
        pctWidth: ((item.x + item.width - current.x) / pageWidth) * 100,
        pctHeight:
          (Math.max(current.height, item.height) / pageHeight) * 100,
        isBold: current.isBold || item.isBold,
      };
    } else {
      if (current.str.trim().length >= 1) merged.push(current);
      current = { ...item };
    }
  }
  if (current.str.trim().length >= 1) merged.push(current);

  return merged;
}

// ==================== Component ====================

export default function EditTextTool() {
  // --- File state ---
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  // --- Page navigation ---
  const [activePage, setActivePage] = useState(1);

  // --- Text extraction ---
  const [pageTextItems, setPageTextItems] = useState<PageTextItems>({});
  const [extracting, setExtracting] = useState(false);

  // --- Editing ---
  const [pageEdits, setPageEdits] = useState<PageEdits>({});
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // --- Container dimensions for font size calc ---
  const [containerDims, setContainerDims] = useState({ w: 500, h: 647 });
  const containerRef = useRef<HTMLDivElement>(null);

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
      setPageTextItems({});
      setPageEdits({});
      setActiveEditId(null);
      setProgress(0);
    } catch {
      setError(
        "Could not read this PDF. It may be corrupted or password-protected.",
      );
      setFile(null);
    }
  };

  // ==================== Text extraction ====================
  const extractPageText = useCallback(
    async (pageNum: number) => {
      if (!file || pageTextItems[pageNum]) return;
      setExtracting(true);
      try {
        const doc = await loadPdfDocument(file);
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });
        const pageWidth = viewport.width;
        const pageHeight = viewport.height;

        // Extract text colors
        const colorMap = await extractTextColors(page);

        // Extract text items
        const textContent = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const styles = (textContent as any).styles as
          | Record<string, { fontFamily?: string }>
          | undefined;

        const rawItems: ExtractedTextItem[] = [];
        let textOpIndex = 0;

        for (const rawItem of textContent.items) {
          if (!("str" in rawItem)) continue;
          const ti = rawItem as {
            str: string;
            transform: number[];
            fontName: string;
            hasEOL: boolean;
            width: number;
            height: number;
          };

          // Count operator index for all items (including empty) to stay in sync with color map
          const currentOpIndex = textOpIndex;
          textOpIndex++;

          if (!ti.str.trim()) continue;

          const tx = ti.transform;
          const fontSize =
            Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]) ||
            Math.abs(tx[0]) ||
            12;
          const x = tx[4];
          const y = tx[5];
          const width = ti.width || fontSize * ti.str.length * 0.5;
          const height = ti.height || fontSize;

          const fontName = ti.fontName || "";
          const fontFamily = styles?.[fontName]?.fontFamily || "";
          const nameToCheck = fontName + " " + fontFamily;

          const isBold =
            /bold|black|heavy|demi|semibold/i.test(nameToCheck) ||
            /[-_]B($|[-_])/i.test(fontName) ||
            /,Bold/i.test(fontName);
          const isItalic =
            /italic|oblique|slant/i.test(nameToCheck) ||
            /[-_]I($|[-_])/i.test(fontName) ||
            /,Italic/i.test(fontName);

          const color = colorMap.get(currentOpIndex) || { r: 0, g: 0, b: 0 };

          const pctX = (x / pageWidth) * 100;
          const pctY = ((pageHeight - y - height) / pageHeight) * 100;
          const pctWidth = (width / pageWidth) * 100;
          const pctHeight = (height / pageHeight) * 100;

          rawItems.push({
            id: genId(),
            str: ti.str,
            x,
            y,
            width,
            height,
            fontSize: Math.round(fontSize * 10) / 10,
            fontName,
            isBold,
            isItalic,
            color,
            bgColor: { r: 255, g: 255, b: 255 }, // default, updated below
            pctX,
            pctY,
            pctWidth,
            pctHeight,
          });
        }

        // Merge adjacent items on the same line
        const items = mergeAdjacentItems(rawItems, pageWidth, pageHeight);

        // Background color sampling: render at low scale and sample pixels
        try {
          const samplingScale = 0.5;
          const samplingViewport = page.getViewport({
            scale: samplingScale,
          });
          const samplingCanvas = document.createElement("canvas");
          samplingCanvas.width = samplingViewport.width;
          samplingCanvas.height = samplingViewport.height;
          const samplingCtx = samplingCanvas.getContext("2d");
          if (samplingCtx) {
            samplingCtx.fillStyle = "#ffffff";
            samplingCtx.fillRect(
              0,
              0,
              samplingCanvas.width,
              samplingCanvas.height,
            );
            await page.render({
              canvasContext: samplingCtx,
              viewport: samplingViewport,
              canvas: samplingCanvas,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any).promise;

            for (const item of items) {
              // Sample just above the text top edge (in canvas coords)
              const samplePdfY = item.y + item.height + 3;
              const canvasX = Math.round(
                ((item.x + item.width / 2) / pageWidth) *
                  samplingCanvas.width,
              );
              const canvasY = Math.round(
                ((pageHeight - samplePdfY) / pageHeight) *
                  samplingCanvas.height,
              );
              const cx = Math.max(
                0,
                Math.min(samplingCanvas.width - 1, canvasX),
              );
              const cy = Math.max(
                0,
                Math.min(samplingCanvas.height - 1, canvasY),
              );
              const pixel = samplingCtx.getImageData(cx, cy, 1, 1).data;
              item.bgColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
            }
          }
        } catch {
          // Background sampling is best-effort
        }

        setPageTextItems((prev) => ({ ...prev, [pageNum]: items }));
      } catch (e) {
        console.error("Text extraction failed:", e);
      } finally {
        setExtracting(false);
      }
    },
    [file, pageTextItems],
  );

  // Auto-extract when page changes
  useEffect(() => {
    if (file && activePage > 0) {
      extractPageText(activePage);
    }
  }, [file, activePage, extractPageText]);

  // Measure container for font size calculations
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setContainerDims({ w: rect.width, h: rect.height });
        }
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activePage, file]);

  // ==================== Edit management ====================
  const addOrUpdateEdit = useCallback(
    (
      item: ExtractedTextItem,
      newText: string,
      options?: {
        fontChoice?: FontChoice;
        isBold?: boolean;
        fontSize?: number;
        color?: { r: number; g: number; b: number };
      },
    ) => {
      setPageEdits((prev) => {
        const edits = prev[activePage] || [];
        const existingIdx = edits.findIndex((e) => e.id === item.id);

        const base =
          existingIdx >= 0
            ? edits[existingIdx]
            : {
                fontChoice: autoSelectFont(
                  item.fontName,
                  item.isBold,
                  item.isItalic,
                ),
                fontSize: item.fontSize,
                color: item.color,
                isBold: item.isBold,
              };

        const edit: TextEdit = {
          id: item.id,
          originalItem: item,
          newText,
          fontChoice: options?.fontChoice ?? base.fontChoice,
          fontSize: options?.fontSize ?? base.fontSize,
          color: options?.color ?? base.color,
          isBold: options?.isBold ?? base.isBold,
        };

        if (existingIdx >= 0) {
          const updated = [...edits];
          updated[existingIdx] = edit;
          return { ...prev, [activePage]: updated };
        }
        return { ...prev, [activePage]: [...edits, edit] };
      });
    },
    [activePage],
  );

  const removeEdit = useCallback((editId: string) => {
    setPageEdits((prev) => {
      const next = { ...prev };
      for (const p of Object.keys(next)) {
        const filtered = next[Number(p)].filter((e) => e.id !== editId);
        if (filtered.length === 0) {
          delete next[Number(p)];
        } else {
          next[Number(p)] = filtered;
        }
      }
      return next;
    });
  }, []);

  const undoLastEdit = () => {
    const edits = pageEdits[activePage];
    if (!edits || edits.length === 0) return;
    removeEdit(edits[edits.length - 1].id);
  };

  const clearPageEdits = () => {
    setPageEdits((prev) => {
      const next = { ...prev };
      delete next[activePage];
      return next;
    });
    setActiveEditId(null);
  };

  const clearAllEdits = () => {
    setPageEdits({});
    setActiveEditId(null);
  };

  // ==================== Keyboard shortcuts ====================
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape" && activeEditId) {
        setActiveEditId(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeEditId]);

  // ==================== PDF Output ====================
  const handleApply = async () => {
    if (!file) return;
    const pagesWithEdits = Object.keys(pageEdits)
      .map(Number)
      .filter((p) => pageEdits[p]?.length > 0);

    if (pagesWithEdits.length === 0) {
      setError("No edits to apply. Click on text in the PDF to edit it.");
      return;
    }

    setLoading(true);
    setError("");
    setProgress(0);

    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);

      // Font cache to avoid re-embedding
      const fontCache: Record<
        string,
        Awaited<ReturnType<typeof pdf.embedFont>>
      > = {};
      const embedFont = async (key: keyof typeof StandardFonts) => {
        if (!fontCache[key]) {
          fontCache[key] = await pdf.embedFont(StandardFonts[key]);
        }
        return fontCache[key];
      };

      for (let i = 0; i < pagesWithEdits.length; i++) {
        const pageNum = pagesWithEdits[i];
        setProgress(Math.round((i / pagesWithEdits.length) * 90));

        const page = pdf.getPage(pageNum - 1);
        const edits = pageEdits[pageNum];

        // Phase 1: Draw all whiteout rectangles
        for (const edit of edits) {
          const item = edit.originalItem;
          const fontKey = getStandardFontKey(
            edit.fontChoice,
            edit.isBold,
            item.isItalic,
          );
          const font = await embedFont(fontKey);
          const newTextWidth = font.widthOfTextAtSize(
            edit.newText,
            edit.fontSize,
          );

          const padding = Math.max(2, edit.fontSize * 0.15);
          const descent = edit.fontSize * 0.3;
          const coverWidth =
            Math.max(item.width, newTextWidth) + padding * 2;
          const coverHeight = edit.fontSize * 1.3 + padding * 2;

          page.drawRectangle({
            x: item.x - padding,
            y: item.y - descent - padding,
            width: coverWidth,
            height: coverHeight,
            color: rgb(
              item.bgColor.r / 255,
              item.bgColor.g / 255,
              item.bgColor.b / 255,
            ),
            borderWidth: 0,
          });
        }

        // Phase 2: Draw all new text
        for (const edit of edits) {
          const item = edit.originalItem;
          const fontKey = getStandardFontKey(
            edit.fontChoice,
            edit.isBold,
            item.isItalic,
          );
          const font = await embedFont(fontKey);

          page.drawText(edit.newText, {
            x: item.x,
            y: item.y,
            size: edit.fontSize,
            font,
            color: rgb(
              edit.color.r / 255,
              edit.color.g / 255,
              edit.color.b / 255,
            ),
          });
        }
      }

      setProgress(95);
      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      downloadBlob(blob, `edited_${file.name}`);
      setProgress(100);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Failed to apply edits. Please try again.",
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // ==================== Computed values ====================
  const currentItems = pageTextItems[activePage] || [];
  const currentEdits = pageEdits[activePage] || [];
  const totalEditCount = Object.values(pageEdits).reduce(
    (sum, e) => sum + e.length,
    0,
  );
  const pagesWithEditsCount = Object.keys(pageEdits).filter(
    (p) => pageEdits[Number(p)]?.length > 0,
  ).length;
  const hasEdits = totalEditCount > 0;

  // ==================== Overlay rendering ====================
  const previewOverlay = (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
      onClick={() => setActiveEditId(null)}
    >
      {/* Text item highlights */}
      {currentItems.map((item) => {
        const edit = currentEdits.find((e) => e.id === item.id);
        const isActive = activeEditId === item.id;
        const isHovered = hoveredItemId === item.id;
        const isEdited = !!edit;

        if (isActive) return null;

        const pixelH =
          (Math.max(item.pctHeight, 1.2) / 100) * containerDims.h;
        const previewFontSize = Math.max(8, pixelH * 0.75);

        return (
          <div
            key={item.id}
            style={{
              position: "absolute",
              left: `${item.pctX}%`,
              top: `${item.pctY}%`,
              width: `${Math.max(item.pctWidth, 2)}%`,
              height: `${Math.max(item.pctHeight, 1.2)}%`,
              pointerEvents: "auto",
              cursor: "text",
              border: isHovered
                ? "1.5px solid rgba(59,130,246,0.5)"
                : isEdited
                  ? "1.5px solid rgba(245,158,11,0.5)"
                  : "1.5px solid transparent",
              backgroundColor: isHovered
                ? "rgba(59,130,246,0.08)"
                : "transparent",
              borderRadius: "2px",
              transition: "border-color 0.15s, background-color 0.15s",
              zIndex: isHovered || isEdited ? 3 : 2,
              overflow: "hidden",
            }}
            onMouseEnter={() => setHoveredItemId(item.id)}
            onMouseLeave={() => setHoveredItemId(null)}
            onClick={(e) => {
              e.stopPropagation();
              setActiveEditId(item.id);
            }}
          >
            {isEdited && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: `rgb(${item.bgColor.r},${item.bgColor.g},${item.bgColor.b})`,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 1px",
                }}
              >
                <span
                  style={{
                    fontSize: `${previewFontSize}px`,
                    fontFamily: getCssFontFamily(edit.fontChoice),
                    fontWeight: edit.isBold ? "bold" : "normal",
                    color: `rgb(${edit.color.r},${edit.color.g},${edit.color.b})`,
                    whiteSpace: "nowrap",
                    lineHeight: 1,
                  }}
                >
                  {edit.newText}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Active input field + floating toolbar */}
      {activeEditId &&
        (() => {
          const item = currentItems.find((i) => i.id === activeEditId);
          if (!item) return null;
          const edit = currentEdits.find((e) => e.id === item.id);
          const currentText = edit?.newText ?? item.str;
          const fontChoice =
            edit?.fontChoice ??
            autoSelectFont(item.fontName, item.isBold, item.isItalic);
          const isBold = edit?.isBold ?? item.isBold;
          const fontSize = edit?.fontSize ?? item.fontSize;
          const color = edit?.color ?? item.color;

          const pixelH =
            (Math.max(item.pctHeight, 1.2) / 100) * containerDims.h;
          const inputFontSize = Math.max(10, pixelH * 0.75);

          const toolbarAbove = item.pctY > 10;

          return (
            <>
              {/* Input */}
              <input
                key={`input-${activeEditId}`}
                autoFocus
                value={currentText}
                onChange={(e) =>
                  addOrUpdateEdit(item, e.target.value, {
                    fontChoice,
                    isBold,
                    fontSize,
                    color,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // If text unchanged, remove edit
                    if (currentText === item.str && edit) {
                      removeEdit(item.id);
                    }
                    setActiveEditId(null);
                  }
                  if (e.key === "Escape") {
                    if (edit) removeEdit(item.id);
                    setActiveEditId(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: `${item.pctX}%`,
                  top: `${item.pctY}%`,
                  width: `${Math.max(item.pctWidth + 8, 20)}%`,
                  height: `${Math.max(item.pctHeight, 2.5)}%`,
                  minHeight: "22px",
                  fontSize: `${inputFontSize}px`,
                  fontFamily: getCssFontFamily(fontChoice),
                  fontWeight: isBold ? "bold" : "normal",
                  color: `rgb(${color.r},${color.g},${color.b})`,
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: "2px solid var(--accent-primary)",
                  borderRadius: "3px",
                  padding: "0 3px",
                  outline: "none",
                  zIndex: 50,
                  pointerEvents: "auto",
                  boxSizing: "border-box",
                  lineHeight: "1.1",
                }}
              />

              {/* Floating toolbar */}
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  left: `${Math.min(item.pctX, 55)}%`,
                  ...(toolbarAbove
                    ? { top: `${item.pctY - 5.5}%` }
                    : { top: `${item.pctY + item.pctHeight + 1}%` }),
                  zIndex: 100,
                  pointerEvents: "auto",
                }}
              >
                <div
                  className="flex items-center gap-1 p-1.5 rounded-lg shadow-lg flex-wrap"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border-primary)",
                    fontSize: "11px",
                    maxWidth: "280px",
                  }}
                >
                  {/* Font buttons */}
                  {(
                    [
                      ["Helvetica", "Sans"],
                      ["TimesRoman", "Serif"],
                      ["Courier", "Mono"],
                    ] as [FontChoice, string][]
                  ).map(([f, label]) => (
                    <button
                      key={f}
                      onClick={() =>
                        addOrUpdateEdit(item, currentText, {
                          fontChoice: f,
                          isBold,
                          fontSize,
                          color,
                        })
                      }
                      style={{
                        padding: "2px 5px",
                        borderRadius: "4px",
                        fontFamily: getCssFontFamily(f),
                        fontSize: "10px",
                        backgroundColor:
                          fontChoice === f
                            ? "#f59e0b"
                            : "var(--bg-tertiary)",
                        color:
                          fontChoice === f ? "#fff" : "var(--text-secondary)",
                        border: "none",
                        cursor: "pointer",
                        lineHeight: "1.4",
                      }}
                    >
                      {label}
                    </button>
                  ))}

                  <div
                    style={{
                      width: 1,
                      height: 14,
                      backgroundColor: "var(--border-primary)",
                      margin: "0 1px",
                    }}
                  />

                  {/* Size controls */}
                  <button
                    onClick={() =>
                      addOrUpdateEdit(item, currentText, {
                        fontChoice,
                        isBold,
                        fontSize: Math.max(4, fontSize - 1),
                        color,
                      })
                    }
                    style={{
                      padding: "1px 4px",
                      borderRadius: "4px",
                      backgroundColor: "var(--bg-tertiary)",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                      lineHeight: "1.2",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      color: "var(--text-muted)",
                      minWidth: 20,
                      textAlign: "center",
                      fontSize: "10px",
                    }}
                  >
                    {Math.round(fontSize)}
                  </span>
                  <button
                    onClick={() =>
                      addOrUpdateEdit(item, currentText, {
                        fontChoice,
                        isBold,
                        fontSize: Math.min(72, fontSize + 1),
                        color,
                      })
                    }
                    style={{
                      padding: "1px 4px",
                      borderRadius: "4px",
                      backgroundColor: "var(--bg-tertiary)",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                      lineHeight: "1.2",
                    }}
                  >
                    +
                  </button>

                  <div
                    style={{
                      width: 1,
                      height: 14,
                      backgroundColor: "var(--border-primary)",
                      margin: "0 1px",
                    }}
                  />

                  {/* Bold toggle */}
                  <button
                    onClick={() =>
                      addOrUpdateEdit(item, currentText, {
                        fontChoice,
                        isBold: !isBold,
                        fontSize,
                        color,
                      })
                    }
                    style={{
                      padding: "1px 5px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      fontSize: "11px",
                      backgroundColor: isBold
                        ? "#f59e0b"
                        : "var(--bg-tertiary)",
                      color: isBold ? "#fff" : "var(--text-secondary)",
                      border: "none",
                      cursor: "pointer",
                      lineHeight: "1.4",
                    }}
                  >
                    B
                  </button>

                  {/* Color swatches */}
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c.label}
                      onClick={() =>
                        addOrUpdateEdit(item, currentText, {
                          fontChoice,
                          isBold,
                          fontSize,
                          color: { r: c.r, g: c.g, b: c.b },
                        })
                      }
                      title={c.label}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        backgroundColor: c.hex,
                        border:
                          color.r === c.r &&
                          color.g === c.g &&
                          color.b === c.b
                            ? "2px solid #f59e0b"
                            : "1.5px solid var(--border-primary)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />
                  ))}

                  {/* Reset */}
                  {edit && (
                    <>
                      <div
                        style={{
                          width: 1,
                          height: 14,
                          backgroundColor: "var(--border-primary)",
                          margin: "0 1px",
                        }}
                      />
                      <button
                        onClick={() => {
                          removeEdit(item.id);
                          setActiveEditId(null);
                        }}
                        style={{
                          padding: "1px 5px",
                          borderRadius: "4px",
                          backgroundColor: "var(--bg-tertiary)",
                          color: "var(--text-muted)",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "10px",
                          lineHeight: "1.4",
                        }}
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          );
        })()}

      {/* Extracting overlay */}
      {extracting && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.08)",
            zIndex: 200,
            pointerEvents: "none",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <div
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              border: "1px solid var(--border-primary)",
            }}
          >
            Detecting text...
          </div>
        </div>
      )}

      {/* No text detected message */}
      {!extracting &&
        currentItems.length === 0 &&
        pageTextItems[activePage] !== undefined && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                border: "1px solid var(--border-primary)",
                textAlign: "center",
                maxWidth: "80%",
              }}
            >
              No selectable text found on this page.
              <br />
              <span style={{ fontSize: "0.7rem" }}>
                Scanned PDFs or image-based pages cannot be edited.
              </span>
            </div>
          </div>
        )}
    </div>
  );

  // ==================== Thumbnail overlay ====================
  const renderThumbnailOverlay = useCallback(
    (pageNum: number) => {
      const edits = pageEdits[pageNum];
      if (!edits || edits.length === 0) return null;
      return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: "#f59e0b",
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
            {edits.length}
          </div>
        </div>
      );
    },
    [pageEdits],
  );

  // ==================== Render ====================
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
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
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
                setPageTextItems({});
                setPageEdits({});
                setActiveEditId(null);
                setError("");
                setProgress(0);
              }}
              className="theme-text-muted text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Info banner */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-700">
              Click on any text in the PDF to edit it. Edited text uses standard
              fonts (Helvetica, Times, Courier) which may differ slightly from
              the original.
            </p>
          </div>

          {/* Thumbnail grid */}
          {pageCount > 1 && (
            <div>
              <label className="block text-sm font-semibold theme-text-secondary mb-2">
                Pages
                <span className="font-normal theme-text-muted">
                  {" "}
                  &mdash; click to select page, then click text below to edit
                </span>
              </label>
              <PdfThumbnailGrid
                file={file}
                pageCount={pageCount}
                selected={new Set([activePage])}
                onToggle={(p) => {
                  setActivePage(p);
                  setActiveEditId(null);
                }}
                renderOverlay={renderThumbnailOverlay}
                columns={4}
                thumbnailScale={0.25}
              />
            </div>
          )}

          {/* Active page preview */}
          {file && (
            <div>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <label className="text-sm font-semibold theme-text-secondary">
                  Page {activePage}
                  {currentEdits.length > 0 && (
                    <span className="font-normal theme-text-muted">
                      {" "}
                      &mdash; {currentEdits.length} edit
                      {currentEdits.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {pageCount === 1 && (
                    <span className="font-normal theme-text-muted"> of 1</span>
                  )}
                </label>

                {pageCount > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setActivePage(Math.max(1, activePage - 1));
                        setActiveEditId(null);
                      }}
                      disabled={activePage === 1}
                      className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color:
                          activePage === 1
                            ? "var(--text-muted)"
                            : "var(--text-secondary)",
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
                        setActiveEditId(null);
                      }}
                      disabled={activePage === pageCount}
                      className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color:
                          activePage === pageCount
                            ? "var(--text-muted)"
                            : "var(--text-secondary)",
                      }}
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-3 flex-wrap">
                {currentEdits.length > 0 && (
                  <>
                    <button
                      onClick={undoLastEdit}
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
                      onClick={clearPageEdits}
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
              <div
                className="flex justify-center"
                onClick={() => setActiveEditId(null)}
              >
                <PdfPagePreview
                  file={file}
                  pageNumber={activePage}
                  width={500}
                  scale={1.5}
                  overlay={previewOverlay}
                  className="shadow-lg select-none"
                />
              </div>

              {/* Hints */}
              {!extracting && currentItems.length > 0 && currentEdits.length === 0 && (
                <p className="text-xs theme-text-muted mt-2 text-center">
                  Hover over text to see clickable areas &middot; Click to edit
                </p>
              )}
              {activeEditId && (
                <p className="text-xs theme-text-muted mt-2 text-center">
                  Type to edit &middot; Enter to confirm &middot; Escape to
                  cancel
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">{error}</div>
          )}

          {/* Download button */}
          <div>
            <button
              onClick={handleApply}
              disabled={loading || !hasEdits}
              className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
              style={!loading && hasEdits ? { backgroundColor: "#f59e0b" } : {}}
            >
              {loading
                ? `Applying edits... ${progress}%`
                : hasEdits
                  ? `Apply Edits & Download (${totalEditCount} edit${totalEditCount !== 1 ? "s" : ""} on ${pagesWithEditsCount} page${pagesWithEditsCount !== 1 ? "s" : ""})`
                  : "Apply Edits & Download"}
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
                    backgroundColor: "#f59e0b",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            )}
            {hasEdits && !loading && (
              <button
                onClick={clearAllEdits}
                className="w-full mt-2 text-xs theme-text-muted font-medium text-center py-1"
              >
                Clear All Edits
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
