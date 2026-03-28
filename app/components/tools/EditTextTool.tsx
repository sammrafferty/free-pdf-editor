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
  isItalic: boolean;
}

type PageEdits = Record<number, TextEdit[]>;
type PageTextItems = Record<number, ExtractedTextItem[]>;

const COLOR_SWATCHES = [
  { r: 0, g: 0, b: 0, label: "Black", hex: "#000000" },
  { r: 75, g: 85, b: 99, label: "Dark Gray", hex: "#4b5563" },
  { r: 156, g: 163, b: 175, label: "Gray", hex: "#9ca3af" },
  { r: 120, g: 53, b: 15, label: "Brown", hex: "#78350f" },
  { r: 220, g: 38, b: 38, label: "Red", hex: "#dc2626" },
  { r: 234, g: 88, b: 12, label: "Orange", hex: "#ea580c" },
  { r: 22, g: 163, b: 74, label: "Green", hex: "#16a34a" },
  { r: 13, g: 148, b: 136, label: "Teal", hex: "#0d9488" },
  { r: 37, g: 99, b: 235, label: "Blue", hex: "#2563eb" },
  { r: 147, g: 51, b: 234, label: "Purple", hex: "#9333ea" },
];

const FONT_OPTIONS: { value: FontChoice; label: string; css: string }[] = [
  { value: "Helvetica", label: "Sans Serif", css: "Helvetica, Arial, sans-serif" },
  { value: "TimesRoman", label: "Serif", css: "'Times New Roman', Times, serif" },
  { value: "Courier", label: "Monospace", css: "Courier, 'Courier New', monospace" },
];

let _nextId = 0;
function genId() {
  return `et${++_nextId}_${Date.now()}`;
}

// ==================== Font Helpers ====================

function autoSelectFont(fontName: string): FontChoice {
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
  if (isBold && isItalic) return "CourierBoldOblique";
  if (isBold) return "CourierBold";
  if (isItalic) return "CourierOblique";
  return "Courier";
}

function getCssFontFamily(fontChoice: FontChoice): string {
  return FONT_OPTIONS.find((f) => f.value === fontChoice)?.css || "Helvetica, Arial, sans-serif";
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
          if (colorStack.length > 0) currentColor = colorStack.pop()!;
          break;
        case (OPS as Record<string, number>)["setFillRGBColor"]:
          if (args && args.length >= 3)
            currentColor = { r: Math.round(args[0] * 255), g: Math.round(args[1] * 255), b: Math.round(args[2] * 255) };
          break;
        case (OPS as Record<string, number>)["setFillGray"]:
          if (args && args.length >= 1) {
            const gray = Math.round(args[0] * 255);
            currentColor = { r: gray, g: gray, b: gray };
          }
          break;
        case (OPS as Record<string, number>)["setFillCMYKColor"]:
          if (args && args.length >= 4) {
            const c = args[0], m = args[1], y = args[2], k = args[3];
            currentColor = { r: Math.round(255 * (1 - c) * (1 - k)), g: Math.round(255 * (1 - m) * (1 - k)), b: Math.round(255 * (1 - y) * (1 - k)) };
          }
          break;
        case (OPS as Record<string, number>)["setFillColorN"]:
        case (OPS as Record<string, number>)["setFillColor"]:
          if (args && args.length >= 3)
            currentColor = { r: Math.round(args[0] * 255), g: Math.round(args[1] * 255), b: Math.round(args[2] * 255) };
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
  } catch { /* best-effort */ }
  return colorMap;
}

function mergeAdjacentItems(items: ExtractedTextItem[], pageWidth: number, pageHeight: number): ExtractedTextItem[] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => {
    const yDiff = Math.abs(a.y - b.y);
    if (yDiff > Math.max(a.fontSize, b.fontSize) * 0.5) return b.y - a.y;
    return a.x - b.x;
  });
  const merged: ExtractedTextItem[] = [];
  let current = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    const sameLine = Math.abs(item.y - current.y) < Math.max(current.fontSize, item.fontSize) * 0.5;
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
        pctHeight: (Math.max(current.height, item.height) / pageHeight) * 100,
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
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [pageTextItems, setPageTextItems] = useState<PageTextItems>({});
  const [extracting, setExtracting] = useState(false);
  const [pageEdits, setPageEdits] = useState<PageEdits>({});
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("#000000");
  const [containerDims, setContainerDims] = useState({ w: 500, h: 647 });
  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // ==================== File handling ====================
  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const count = pdf.getPageCount();
      if (count === 0) { setError("This PDF has no pages."); setFile(null); return; }
      setFile(f);
      setPageCount(count);
      setActivePage(1);
      setPageTextItems({});
      setPageEdits({});
      setActiveEditId(null);
      setProgress(0);
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  // ==================== Text extraction ====================
  const extractPageText = useCallback(async (pageNum: number) => {
    if (!file || pageTextItems[pageNum]) return;
    setExtracting(true);
    try {
      const doc = await loadPdfDocument(file);
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const pageWidth = viewport.width;
      const pageHeight = viewport.height;
      const colorMap = await extractTextColors(page);
      const textContent = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const styles = (textContent as any).styles as Record<string, { fontFamily?: string }> | undefined;
      const rawItems: ExtractedTextItem[] = [];
      let textOpIndex = 0;
      for (const rawItem of textContent.items) {
        if (!("str" in rawItem)) continue;
        const ti = rawItem as { str: string; transform: number[]; fontName: string; hasEOL: boolean; width: number; height: number };
        const currentOpIndex = textOpIndex;
        textOpIndex++;
        if (!ti.str.trim()) continue;
        const tx = ti.transform;
        const fontSize = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]) || Math.abs(tx[0]) || 12;
        const x = tx[4];
        const y = tx[5];
        const width = ti.width || fontSize * ti.str.length * 0.5;
        const height = ti.height || fontSize;
        const fontName = ti.fontName || "";
        const fontFamily = styles?.[fontName]?.fontFamily || "";
        const nameToCheck = fontName + " " + fontFamily;
        const isBold = /bold|black|heavy|demi|semibold/i.test(nameToCheck) || /[-_]B($|[-_])/i.test(fontName) || /,Bold/i.test(fontName);
        const isItalic = /italic|oblique|slant/i.test(nameToCheck) || /[-_]I($|[-_])/i.test(fontName) || /,Italic/i.test(fontName);
        const color = colorMap.get(currentOpIndex) || { r: 0, g: 0, b: 0 };
        rawItems.push({
          id: genId(), str: ti.str, x, y, width, height,
          fontSize: Math.round(fontSize * 10) / 10, fontName, isBold, isItalic, color,
          bgColor: { r: 255, g: 255, b: 255 },
          pctX: (x / pageWidth) * 100,
          pctY: ((pageHeight - y - height) / pageHeight) * 100,
          pctWidth: (width / pageWidth) * 100,
          pctHeight: (height / pageHeight) * 100,
        });
      }
      const items = mergeAdjacentItems(rawItems, pageWidth, pageHeight);
      try {
        const sv = page.getViewport({ scale: 0.5 });
        const sc = document.createElement("canvas");
        sc.width = sv.width; sc.height = sv.height;
        const sx = sc.getContext("2d");
        if (sx) {
          sx.fillStyle = "#ffffff";
          sx.fillRect(0, 0, sc.width, sc.height);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await page.render({ canvasContext: sx, viewport: sv, canvas: sc } as any).promise;
          for (const item of items) {
            const samplePdfY = item.y + item.height + 3;
            const cx = Math.max(0, Math.min(sc.width - 1, Math.round(((item.x + item.width / 2) / pageWidth) * sc.width)));
            const cy = Math.max(0, Math.min(sc.height - 1, Math.round(((pageHeight - samplePdfY) / pageHeight) * sc.height)));
            const pixel = sx.getImageData(cx, cy, 1, 1).data;
            item.bgColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
          }
        }
      } catch { /* best-effort */ }
      setPageTextItems((prev) => ({ ...prev, [pageNum]: items }));
    } catch (e) { console.error("Text extraction failed:", e); }
    finally { setExtracting(false); }
  }, [file, pageTextItems]);

  useEffect(() => { if (file && activePage > 0) extractPageText(activePage); }, [file, activePage, extractPageText]);

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) setContainerDims({ w: rect.width, h: rect.height });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activePage, file]);

  // Focus input when active edit changes
  useEffect(() => {
    if (activeEditId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [activeEditId]);

  // ==================== Edit management ====================
  const addOrUpdateEdit = useCallback((
    item: ExtractedTextItem,
    newText: string,
    options?: { fontChoice?: FontChoice; isBold?: boolean; isItalic?: boolean; fontSize?: number; color?: { r: number; g: number; b: number } },
  ) => {
    setPageEdits((prev) => {
      const edits = prev[activePage] || [];
      const existingIdx = edits.findIndex((e) => e.id === item.id);
      const base = existingIdx >= 0 ? edits[existingIdx] : {
        fontChoice: autoSelectFont(item.fontName),
        fontSize: item.fontSize, color: item.color,
        isBold: item.isBold, isItalic: item.isItalic,
      };
      const edit: TextEdit = {
        id: item.id, originalItem: item, newText,
        fontChoice: options?.fontChoice ?? base.fontChoice,
        fontSize: options?.fontSize ?? base.fontSize,
        color: options?.color ?? base.color,
        isBold: options?.isBold ?? base.isBold,
        isItalic: options?.isItalic ?? base.isItalic,
      };
      if (existingIdx >= 0) {
        const updated = [...edits];
        updated[existingIdx] = edit;
        return { ...prev, [activePage]: updated };
      }
      return { ...prev, [activePage]: [...edits, edit] };
    });
  }, [activePage]);

  const removeEdit = useCallback((editId: string) => {
    setPageEdits((prev) => {
      const next = { ...prev };
      for (const p of Object.keys(next)) {
        const filtered = next[Number(p)].filter((e) => e.id !== editId);
        if (filtered.length === 0) delete next[Number(p)];
        else next[Number(p)] = filtered;
      }
      return next;
    });
  }, []);

  const undoLastEdit = () => {
    const edits = pageEdits[activePage];
    if (edits?.length) removeEdit(edits[edits.length - 1].id);
  };

  const clearPageEdits = () => {
    setPageEdits((prev) => { const next = { ...prev }; delete next[activePage]; return next; });
    setActiveEditId(null);
  };

  const clearAllEdits = () => { setPageEdits({}); setActiveEditId(null); };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "Escape" && activeEditId) setActiveEditId(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeEditId]);

  // ==================== PDF Output ====================
  const handleApply = async () => {
    if (!file) return;
    const pagesWithEdits = Object.keys(pageEdits).map(Number).filter((p) => pageEdits[p]?.length > 0);
    if (pagesWithEdits.length === 0) { setError("No edits to apply. Click on text in the PDF to edit it."); return; }
    setLoading(true); setError(""); setProgress(0);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const fontCache: Record<string, Awaited<ReturnType<typeof pdf.embedFont>>> = {};
      const embedFont = async (key: keyof typeof StandardFonts) => {
        if (!fontCache[key]) fontCache[key] = await pdf.embedFont(StandardFonts[key]);
        return fontCache[key];
      };
      for (let i = 0; i < pagesWithEdits.length; i++) {
        const pageNum = pagesWithEdits[i];
        setProgress(Math.round((i / pagesWithEdits.length) * 90));
        const page = pdf.getPage(pageNum - 1);
        const edits = pageEdits[pageNum];
        // Phase 1: whiteout rectangles
        for (const edit of edits) {
          const item = edit.originalItem;
          const fontKey = getStandardFontKey(edit.fontChoice, edit.isBold, edit.isItalic);
          const font = await embedFont(fontKey);
          const newTextWidth = font.widthOfTextAtSize(edit.newText, edit.fontSize);
          const padding = Math.max(2, edit.fontSize * 0.15);
          const descent = edit.fontSize * 0.3;
          page.drawRectangle({
            x: item.x - padding, y: item.y - descent - padding,
            width: Math.max(item.width, newTextWidth) + padding * 2,
            height: edit.fontSize * 1.3 + padding * 2,
            color: rgb(item.bgColor.r / 255, item.bgColor.g / 255, item.bgColor.b / 255),
            borderWidth: 0,
          });
        }
        // Phase 2: new text
        for (const edit of edits) {
          const item = edit.originalItem;
          const fontKey = getStandardFontKey(edit.fontChoice, edit.isBold, edit.isItalic);
          const font = await embedFont(fontKey);
          page.drawText(edit.newText, {
            x: item.x, y: item.y, size: edit.fontSize, font,
            color: rgb(edit.color.r / 255, edit.color.g / 255, edit.color.b / 255),
          });
        }
      }
      setProgress(95);
      const bytes = await pdf.save();
      downloadBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), `edited_${file.name}`);
      setProgress(100);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to apply edits. Please try again.");
    } finally { setLoading(false); setProgress(0); }
  };

  // ==================== Computed values ====================
  const currentItems = pageTextItems[activePage] || [];
  const currentEdits = pageEdits[activePage] || [];
  const totalEditCount = Object.values(pageEdits).reduce((sum, e) => sum + e.length, 0);
  const pagesWithEditsCount = Object.keys(pageEdits).filter((p) => pageEdits[Number(p)]?.length > 0).length;
  const hasEdits = totalEditCount > 0;

  // Active item and edit for the editing panel
  const activeItem = activeEditId ? currentItems.find((i) => i.id === activeEditId) : null;
  const activeEdit = activeItem ? currentEdits.find((e) => e.id === activeItem.id) : null;
  const editText = activeEdit?.newText ?? activeItem?.str ?? "";
  const editFontChoice = activeEdit?.fontChoice ?? (activeItem ? autoSelectFont(activeItem.fontName) : "Helvetica");
  const editBold = activeEdit?.isBold ?? activeItem?.isBold ?? false;
  const editItalic = activeEdit?.isItalic ?? activeItem?.isItalic ?? false;
  const editFontSize = activeEdit?.fontSize ?? activeItem?.fontSize ?? 12;
  const editColor = activeEdit?.color ?? activeItem?.color ?? { r: 0, g: 0, b: 0 };

  // ==================== Overlay ====================
  const previewOverlay = (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}
      onClick={() => setActiveEditId(null)}>

      {currentItems.map((item) => {
        const edit = currentEdits.find((e) => e.id === item.id);
        const isActive = activeEditId === item.id;
        const isHovered = hoveredItemId === item.id;
        const isEdited = !!edit;
        const pixelH = (Math.max(item.pctHeight, 1.5) / 100) * containerDims.h;
        const previewFontSize = Math.max(8, pixelH * 0.75);

        return (
          <div key={item.id}
            style={{
              position: "absolute",
              left: `${item.pctX}%`, top: `${item.pctY}%`,
              width: `${Math.max(item.pctWidth, 3)}%`,
              height: `${Math.max(item.pctHeight, 1.5)}%`,
              pointerEvents: "auto", cursor: "text",
              border: isActive
                ? "2px solid rgba(59,130,246,0.8)"
                : isHovered
                  ? "1.5px solid rgba(59,130,246,0.5)"
                  : isEdited
                    ? "1.5px solid rgba(245,158,11,0.5)"
                    : "1.5px solid transparent",
              backgroundColor: isActive
                ? "rgba(59,130,246,0.1)"
                : isHovered
                  ? "rgba(59,130,246,0.06)"
                  : "transparent",
              borderRadius: "2px",
              transition: "border-color 0.15s, background-color 0.15s",
              zIndex: isActive ? 5 : isHovered || isEdited ? 3 : 2,
              overflow: "hidden",
            }}
            onMouseEnter={() => setHoveredItemId(item.id)}
            onMouseLeave={() => setHoveredItemId(null)}
            onClick={(e) => { e.stopPropagation(); setActiveEditId(item.id); }}
          >
            {isEdited && !isActive && (
              <div style={{
                position: "absolute", inset: 0,
                backgroundColor: `rgb(${item.bgColor.r},${item.bgColor.g},${item.bgColor.b})`,
                display: "flex", alignItems: "center", padding: "0 1px",
              }}>
                <span style={{
                  fontSize: `${previewFontSize}px`,
                  fontFamily: getCssFontFamily(edit.fontChoice),
                  fontWeight: edit.isBold ? "bold" : "normal",
                  fontStyle: edit.isItalic ? "italic" : "normal",
                  color: `rgb(${edit.color.r},${edit.color.g},${edit.color.b})`,
                  whiteSpace: "nowrap", lineHeight: 1,
                }}>
                  {edit.newText}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {extracting && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.08)", zIndex: 200, pointerEvents: "none", borderRadius: "var(--radius-sm)" }}>
          <div style={{ padding: "8px 16px", borderRadius: "8px", backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)", fontSize: "0.8rem", border: "1px solid var(--border-primary)" }}>
            Detecting text...
          </div>
        </div>
      )}

      {!extracting && currentItems.length === 0 && pageTextItems[activePage] !== undefined && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ padding: "12px 20px", borderRadius: "8px", backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)", fontSize: "0.8rem", border: "1px solid var(--border-primary)", textAlign: "center", maxWidth: "80%" }}>
            No selectable text found on this page.<br />
            <span style={{ fontSize: "0.7rem" }}>Scanned PDFs or image-based pages cannot be edited.</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderThumbnailOverlay = useCallback((pageNum: number) => {
    const edits = pageEdits[pageNum];
    if (!edits || edits.length === 0) return null;
    return (
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 4, right: 4, backgroundColor: "#f59e0b", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: "0.65rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {edits.length}
        </div>
      </div>
    );
  }, [pageEdits]);

  // ==================== Render ====================
  return (
    <div>
      {!file ? (
        <div>
          <Dropzone onFiles={handleFile} />
          {error && <div className="mt-4 p-3 theme-error rounded-xl text-sm">{error}</div>}
        </div>
      ) : (
        <div className="space-y-5">
          {/* File card */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} page{pageCount !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setActivePage(1); setPageTextItems({}); setPageEdits({}); setActiveEditId(null); setError(""); setProgress(0); }} className="theme-text-muted text-sm font-medium">Remove</button>
          </div>

          {/* Info banner */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-700">
              Click on any text in the PDF to select it, then use the editing panel below to make changes.
            </p>
          </div>

          {/* Thumbnail grid */}
          {pageCount > 1 && (
            <div>
              <label className="block text-sm font-semibold theme-text-secondary mb-2">
                Pages <span className="font-normal theme-text-muted">&mdash; click to select page</span>
              </label>
              <PdfThumbnailGrid file={file} pageCount={pageCount} selected={new Set([activePage])}
                onToggle={(p) => { setActivePage(p); setActiveEditId(null); }}
                renderOverlay={renderThumbnailOverlay} columns={4} thumbnailScale={0.25} />
            </div>
          )}

          {/* Active page preview */}
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="text-sm font-semibold theme-text-secondary">
                Page {activePage}
                {currentEdits.length > 0 && <span className="font-normal theme-text-muted"> &mdash; {currentEdits.length} edit{currentEdits.length !== 1 ? "s" : ""}</span>}
              </label>
              {pageCount > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => { setActivePage(Math.max(1, activePage - 1)); setActiveEditId(null); }} disabled={activePage === 1}
                    className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={{ backgroundColor: "var(--bg-tertiary)", color: activePage === 1 ? "var(--text-muted)" : "var(--text-secondary)" }}>&larr;</button>
                  <span className="text-xs theme-text-muted px-1">{activePage}/{pageCount}</span>
                  <button onClick={() => { setActivePage(Math.min(pageCount, activePage + 1)); setActiveEditId(null); }} disabled={activePage === pageCount}
                    className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={{ backgroundColor: "var(--bg-tertiary)", color: activePage === pageCount ? "var(--text-muted)" : "var(--text-secondary)" }}>&rarr;</button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {currentEdits.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                <button onClick={undoLastEdit} className="py-2 px-4 rounded-xl text-xs font-medium transition-colors" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>Undo Last</button>
                <button onClick={clearPageEdits} className="py-2 px-4 rounded-xl text-xs font-medium transition-colors" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>Clear Page</button>
              </div>
            )}

            {/* PDF preview */}
            <div className="flex justify-center" onClick={() => setActiveEditId(null)}>
              <PdfPagePreview file={file} pageNumber={activePage} width={500} scale={1.5} overlay={previewOverlay} className="shadow-lg select-none" />
            </div>

            {/* Hints */}
            {!extracting && currentItems.length > 0 && !activeEditId && currentEdits.length === 0 && (
              <p className="text-xs theme-text-muted mt-2 text-center">Click on any text above to start editing</p>
            )}
          </div>

          {/* ==================== EDITING PANEL ==================== */}
          {activeItem && (
            <div className="p-5 rounded-xl space-y-4" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium theme-text-muted mb-0.5">Editing</p>
                  <p className="text-sm theme-text truncate" title={activeItem.str}>
                    &ldquo;{activeItem.str}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {activeEdit && (
                    <button onClick={() => { removeEdit(activeItem.id); }}
                      className="py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
                      style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>
                      Reset
                    </button>
                  )}
                  <button onClick={() => setActiveEditId(null)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors"
                    style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                    &times;
                  </button>
                </div>
              </div>

              {/* Text input */}
              <div>
                <label className="block text-xs font-medium theme-text-muted mb-1.5">Text</label>
                <input
                  ref={editInputRef}
                  value={editText}
                  onChange={(e) => addOrUpdateEdit(activeItem, e.target.value, { fontChoice: editFontChoice, isBold: editBold, isItalic: editItalic, fontSize: editFontSize, color: editColor })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { if (editText === activeItem.str && activeEdit) removeEdit(activeItem.id); setActiveEditId(null); }
                    if (e.key === "Escape") { if (activeEdit) removeEdit(activeItem.id); setActiveEditId(null); }
                  }}
                  className="w-full rounded-lg px-3 py-2.5 outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    border: "1.5px solid var(--border-hover)",
                    color: `rgb(${editColor.r},${editColor.g},${editColor.b})`,
                    fontFamily: getCssFontFamily(editFontChoice),
                    fontWeight: editBold ? "bold" : "normal",
                    fontStyle: editItalic ? "italic" : "normal",
                    fontSize: `${Math.min(Math.max(editFontSize, 12), 24)}px`,
                    minHeight: "42px",
                  }}
                />
              </div>

              {/* Font + Size row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Font selector */}
                <div>
                  <label className="block text-xs font-medium theme-text-muted mb-1.5">Font</label>
                  <div className="flex gap-2">
                    {FONT_OPTIONS.map((f) => (
                      <button key={f.value}
                        onClick={() => addOrUpdateEdit(activeItem, editText, { fontChoice: f.value, isBold: editBold, isItalic: editItalic, fontSize: editFontSize, color: editColor })}
                        className="flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          fontFamily: f.css,
                          fontSize: "13px",
                          backgroundColor: editFontChoice === f.value ? "#f59e0b" : "var(--bg-tertiary)",
                          color: editFontChoice === f.value ? "#fff" : "var(--text-secondary)",
                          border: editFontChoice === f.value ? "1px solid #f59e0b" : "1px solid var(--border-primary)",
                        }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size controls */}
                <div>
                  <label className="block text-xs font-medium theme-text-muted mb-1.5">Size</label>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => addOrUpdateEdit(activeItem, editText, { fontChoice: editFontChoice, isBold: editBold, isItalic: editItalic, fontSize: Math.max(4, editFontSize - 1), color: editColor })}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-medium transition-colors shrink-0"
                      style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>
                      −
                    </button>
                    <input type="number" value={Math.round(editFontSize)} min={4} max={72}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || editFontSize;
                        addOrUpdateEdit(activeItem, editText, { fontChoice: editFontChoice, isBold: editBold, isItalic: editItalic, fontSize: Math.max(4, Math.min(72, v)), color: editColor });
                      }}
                      className="flex-1 text-center rounded-lg py-2 px-1 text-sm font-medium outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", minWidth: 0 }} />
                    <button onClick={() => addOrUpdateEdit(activeItem, editText, { fontChoice: editFontChoice, isBold: editBold, isItalic: editItalic, fontSize: Math.min(72, editFontSize + 1), color: editColor })}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-medium transition-colors shrink-0"
                      style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-primary)" }}>
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Style + Color row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Style toggles */}
                <div>
                  <label className="block text-xs font-medium theme-text-muted mb-1.5">Style</label>
                  <div className="flex gap-2">
                    <button onClick={() => addOrUpdateEdit(activeItem, editText, { fontChoice: editFontChoice, isBold: !editBold, isItalic: editItalic, fontSize: editFontSize, color: editColor })}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors"
                      style={{
                        fontWeight: "bold", fontSize: "15px",
                        backgroundColor: editBold ? "#f59e0b" : "var(--bg-tertiary)",
                        color: editBold ? "#fff" : "var(--text-secondary)",
                        border: editBold ? "1px solid #f59e0b" : "1px solid var(--border-primary)",
                      }}>
                      B
                    </button>
                    <button onClick={() => addOrUpdateEdit(activeItem, editText, { fontChoice: editFontChoice, isBold: editBold, isItalic: !editItalic, fontSize: editFontSize, color: editColor })}
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors"
                      style={{
                        fontStyle: "italic", fontSize: "15px",
                        backgroundColor: editItalic ? "#f59e0b" : "var(--bg-tertiary)",
                        color: editItalic ? "#fff" : "var(--text-secondary)",
                        border: editItalic ? "1px solid #f59e0b" : "1px solid var(--border-primary)",
                      }}>
                      I
                    </button>
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <label className="block text-xs font-medium theme-text-muted mb-1.5">Color</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COLOR_SWATCHES.map((c) => {
                      const isSelected = editColor.r === c.r && editColor.g === c.g && editColor.b === c.b;
                      return (
                        <button key={c.label} title={c.label}
                          onClick={() => addOrUpdateEdit(activeItem, editText, { fontChoice: editFontChoice, isBold: editBold, isItalic: editItalic, fontSize: editFontSize, color: { r: c.r, g: c.g, b: c.b } })}
                          className="transition-transform"
                          style={{
                            width: 24, height: 24, borderRadius: "50%",
                            backgroundColor: c.hex,
                            border: isSelected ? "3px solid #f59e0b" : "2px solid var(--border-primary)",
                            cursor: "pointer", flexShrink: 0,
                            boxShadow: isSelected ? "0 0 0 2px rgba(245,158,11,0.3)" : "none",
                            transform: isSelected ? "scale(1.15)" : "scale(1)",
                          }} />
                      );
                    })}
                    {/* Custom color */}
                    <div className="relative" style={{ width: 24, height: 24, flexShrink: 0 }}>
                      <input type="color" value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          const hex = e.target.value;
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          addOrUpdateEdit(activeItem, editText, { fontChoice: editFontChoice, isBold: editBold, isItalic: editItalic, fontSize: editFontSize, color: { r, g, b } });
                        }}
                        className="absolute inset-0 w-full h-full cursor-pointer rounded-full"
                        style={{ opacity: 0 }} title="Custom color" />
                      <div className="w-full h-full rounded-full flex items-center justify-center pointer-events-none"
                        style={{ border: "2px dashed var(--border-primary)", backgroundColor: "var(--bg-tertiary)" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <div className="p-3 theme-error rounded-xl text-sm">{error}</div>}

          {/* Download button */}
          <div>
            <button onClick={handleApply} disabled={loading || !hasEdits}
              className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
              style={!loading && hasEdits ? { backgroundColor: "#f59e0b" } : {}}>
              {loading ? `Applying edits... ${progress}%`
                : hasEdits ? `Apply Edits & Download (${totalEditCount} edit${totalEditCount !== 1 ? "s" : ""} on ${pagesWithEditsCount} page${pagesWithEditsCount !== 1 ? "s" : ""})`
                : "Apply Edits & Download"}
            </button>
            {loading && (
              <div className="w-full h-1 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: "#f59e0b", transition: "width 0.3s ease" }} />
              </div>
            )}
            {hasEdits && !loading && (
              <button onClick={clearAllEdits} className="w-full mt-2 text-xs theme-text-muted font-medium text-center py-1">Clear All Edits</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
