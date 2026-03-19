"use client";
import { useState, useRef, useMemo } from "react";
import Dropzone from "../Dropzone";

// ── Types ──────────────────────────────────────────────────────────────────

type QualityPreset = "standard" | "high" | "ultra";
type ImageFormat = "jpeg" | "png" | "auto";

interface PresetConfig {
  label: string;
  desc: string;
  scale: number;
  format: ImageFormat;
  jpegQuality: number;
  estimateKbPerSlide: number;
}

const PRESETS: Record<QualityPreset, PresetConfig> = {
  standard: { label: "Standard", desc: "~100 KB/slide", scale: 1, format: "jpeg", jpegQuality: 0.85, estimateKbPerSlide: 100 },
  high:     { label: "High",     desc: "~300 KB/slide", scale: 2, format: "jpeg", jpegQuality: 0.92, estimateKbPerSlide: 300 },
  ultra:    { label: "Ultra",    desc: "~800 KB/slide", scale: 2, format: "png",  jpegQuality: 1,    estimateKbPerSlide: 800 },
};

// ── Text extraction helpers ────────────────────────────────────────────────

interface PdfTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
  dir: string;
}

interface TextLine {
  items: PdfTextItem[];
  y: number;        // PDF y (bottom of text, bottom-left origin)
  x: number;        // leftmost x in PDF points
  maxX: number;     // rightmost x+width
  fontSize: number;  // dominant font size in PDF points
  text: string;
}

interface SlideContent {
  lines: TextLine[];
  titleLine: TextLine | null;
  bodyLines: TextLine[];
  isTitleSlide: boolean;
  isComplexLayout: boolean;
  textCoverageRatio: number;  // 0-1, how much of the page area is text
}

/**
 * Groups raw TextItems into lines based on Y-coordinate proximity.
 * Items on the same visual line share similar Y positions (within fontSize tolerance).
 */
function groupIntoLines(items: PdfTextItem[], pageHeight: number): TextLine[] {
  if (items.length === 0) return [];

  // Sort by Y descending (top of page first in visual order), then X ascending
  const sorted = [...items].sort((a, b) => {
    const ya = pageHeight - a.transform[5];
    const yb = pageHeight - b.transform[5];
    if (Math.abs(ya - yb) > 2) return ya - yb;
    return a.transform[4] - b.transform[4];
  });

  const lines: TextLine[] = [];
  let currentLine: PdfTextItem[] = [sorted[0]];
  let currentY = sorted[0].transform[5];
  let currentFontSize = Math.abs(sorted[0].transform[3]) || Math.abs(sorted[0].transform[0]) || 12;

  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    const itemY = item.transform[5];
    const itemFontSize = Math.abs(item.transform[3]) || Math.abs(item.transform[0]) || 12;
    const tolerance = Math.max(currentFontSize, itemFontSize) * 0.5;

    if (Math.abs(itemY - currentY) <= tolerance) {
      currentLine.push(item);
    } else {
      // Finalize current line
      lines.push(buildLine(currentLine));
      currentLine = [item];
      currentY = itemY;
      currentFontSize = itemFontSize;
    }
  }
  if (currentLine.length > 0) {
    lines.push(buildLine(currentLine));
  }

  return lines;
}

function buildLine(items: PdfTextItem[]): TextLine {
  // Sort items left to right
  items.sort((a, b) => a.transform[4] - b.transform[4]);

  const fontSizes = items.map(it => Math.abs(it.transform[3]) || Math.abs(it.transform[0]) || 12);
  const dominantFontSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length;

  const xs = items.map(it => it.transform[4]);
  const maxXs = items.map(it => it.transform[4] + it.width);

  // Build text with appropriate spacing
  let text = "";
  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      const gap = items[i].transform[4] - (items[i - 1].transform[4] + items[i - 1].width);
      // If gap is larger than ~1 space width, add space
      if (gap > dominantFontSize * 0.15) {
        text += " ";
      }
    }
    text += items[i].str;
  }

  return {
    items,
    y: items[0].transform[5],
    x: Math.min(...xs),
    maxX: Math.max(...maxXs),
    fontSize: dominantFontSize,
    text: text.trim(),
  };
}

/**
 * Analyze page content to detect slide layout type and text coverage.
 */
function analyzeSlideContent(lines: TextLine[], pageWidth: number, pageHeight: number): SlideContent {
  if (lines.length === 0) {
    return { lines, titleLine: null, bodyLines: [], isTitleSlide: false, isComplexLayout: false, textCoverageRatio: 0 };
  }

  // Calculate text coverage ratio
  let textArea = 0;
  for (const line of lines) {
    const lineWidth = line.maxX - line.x;
    const lineHeight = line.fontSize * 1.3;
    textArea += lineWidth * lineHeight;
  }
  const pageArea = pageWidth * pageHeight;
  const textCoverageRatio = Math.min(1, textArea / pageArea);

  // Find the largest font size to identify potential title
  const maxFontSize = Math.max(...lines.map(l => l.fontSize));
  const avgFontSize = lines.reduce((s, l) => s + l.fontSize, 0) / lines.length;

  // Title detection: large font (>= 1.3x average), near top third of page
  let titleLine: TextLine | null = null;
  const bodyLines: TextLine[] = [];

  for (const line of lines) {
    if (!line.text.trim()) continue;
    const visualY = pageHeight - line.y; // distance from top
    const isNearTop = visualY < pageHeight * 0.45;
    const isLargeFont = line.fontSize >= avgFontSize * 1.3 && line.fontSize >= maxFontSize * 0.85;

    if (!titleLine && isNearTop && isLargeFont) {
      titleLine = line;
    } else {
      bodyLines.push(line);
    }
  }

  // Title slide: has a title, few body lines, or body is also large
  const isTitleSlide = titleLine !== null && bodyLines.length <= 3;

  // Complex layout: text scattered across page, overlapping, or very many small items
  const xPositions = lines.map(l => l.x);
  const uniqueXRegions = new Set(xPositions.map(x => Math.round(x / (pageWidth * 0.1)))).size;
  const isComplexLayout = uniqueXRegions > 4 || lines.length > 50;

  return { lines, titleLine, bodyLines, isTitleSlide, isComplexLayout, textCoverageRatio };
}

/**
 * Format notes with proper line breaks and paragraph structure.
 */
function formatNotesText(lines: TextLine[], pageHeight: number): string {
  if (lines.length === 0) return "";

  const parts: string[] = [];
  let prevVisualY = -Infinity;

  for (const line of lines) {
    if (!line.text.trim()) continue;
    const visualY = pageHeight - line.y;

    // Detect paragraph breaks: gap > 1.8x the font size
    if (prevVisualY !== -Infinity) {
      const gap = visualY - prevVisualY;
      if (gap > line.fontSize * 1.8) {
        parts.push(""); // paragraph break
      }
    }
    parts.push(line.text);
    prevVisualY = visualY + line.fontSize;
  }

  return parts.join("\n").trim();
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function PdfToPptxTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [preset, setPreset] = useState<QualityPreset>("high");
  const [imageFormat, setImageFormat] = useState<ImageFormat>("auto");
  const [includeText, setIncludeText] = useState(true);
  const [textOverlay, setTextOverlay] = useState(false);
  const [editableSlides, setEditableSlides] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const convertingRef = useRef(false);

  const estimatedSize = useMemo(() => {
    if (!pageCount) return "";
    const kb = PRESETS[preset].estimateKbPerSlide * pageCount;
    if (kb < 1024) return `~${kb} KB`;
    return `~${(kb / 1024).toFixed(1)} MB`;
  }, [pageCount, preset]);

  const handleFile = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFile(f);
    setError("");
    setStatus("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const buf = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      setPageCount(doc.numPages);
      doc.destroy();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("password") || msg.includes("encrypted")) {
        setError("This PDF is password-protected.");
      } else {
        setError("Could not read this PDF.");
      }
      setFile(null);
      setPageCount(0);
    }
  };

  const handleConvert = async () => {
    if (!file || convertingRef.current) return;
    convertingRef.current = true;
    setLoading(true);
    setProgress(0);
    setStatus("Loading PDF...");
    setError("");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const PptxGenJS = (await import("pptxgenjs")).default;

      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;

      try {
        const pptx = new PptxGenJS();
        const config = PRESETS[preset];
        const scale = config.scale;

        // ── Determine most common page size across all pages ──
        setStatus("Analyzing page dimensions...");
        const pageDims: { w: number; h: number }[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          pageDims.push({ w: Math.round(vp.width * 10) / 10, h: Math.round(vp.height * 10) / 10 });
          page.cleanup();
        }

        // Find the most common dimension pair
        const dimCounts = new Map<string, number>();
        for (const d of pageDims) {
          const key = `${d.w}x${d.h}`;
          dimCounts.set(key, (dimCounts.get(key) || 0) + 1);
        }
        let mostCommonKey = "";
        let mostCommonCount = 0;
        for (const [key, count] of dimCounts) {
          if (count > mostCommonCount) { mostCommonCount = count; mostCommonKey = key; }
        }
        const [commonW, commonH] = mostCommonKey.split("x").map(Number);

        // PDF points are 1/72 inch. Slide width in inches:
        const slideW = commonW / 72;
        const slideH = commonH / 72;

        // Clamp to reasonable bounds (min 4", max 20")
        const finalSlideW = Math.max(4, Math.min(20, slideW));
        const finalSlideH = Math.max(3, Math.min(15, slideH));

        pptx.defineLayout({ name: "Custom", width: finalSlideW, height: finalSlideH });
        pptx.layout = "Custom";

        // ── Process each page ──
        for (let i = 1; i <= doc.numPages; i++) {
          setStatus(`Rendering page ${i} of ${doc.numPages}...`);

          const page = await doc.getPage(i);
          const baseVp = page.getViewport({ scale: 1 });
          const pageW = baseVp.width;   // PDF points
          const pageH = baseVp.height;  // PDF points

          // Get text content if needed by any feature
          const needsText = textOverlay || includeText || editableSlides;
          const textContent = needsText ? await page.getTextContent() : null;

          // Parse text items and group into lines
          let slideContent: SlideContent | null = null;
          let textLines: TextLine[] = [];
          if (textContent) {
            const rawItems: PdfTextItem[] = textContent.items
              .filter((item) => "str" in item && !!(item as unknown as PdfTextItem).str.trim())
              .map(item => item as unknown as PdfTextItem);

            textLines = groupIntoLines(rawItems, pageH);
            slideContent = analyzeSlideContent(textLines, pageW, pageH);
          }

          // ── Determine image format for this page ──
          let useFormat: "image/png" | "image/jpeg";
          const jpegQuality = config.jpegQuality;

          if (imageFormat === "png" || config.format === "png") {
            useFormat = "image/png";
          } else if (imageFormat === "jpeg") {
            useFormat = "image/jpeg";
          } else {
            // Auto mode: use PNG if >60% text coverage (sharper text), else JPEG
            const coverage = slideContent?.textCoverageRatio ?? 0;
            useFormat = coverage > 0.6 ? "image/png" : "image/jpeg";
          }

          // ── Editable slides mode ──
          const useEditableMode = editableSlides && slideContent && !slideContent.isComplexLayout;

          // ── Render page to canvas (always needed for image-based or fallback) ──
          const renderViewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = renderViewport.width;
          canvas.height = renderViewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error(`Failed to create canvas context for page ${i}`);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await page.render({ canvasContext: ctx, viewport: renderViewport } as any).promise;

          const imgData = useFormat === "image/png"
            ? canvas.toDataURL("image/png")
            : canvas.toDataURL("image/jpeg", jpegQuality);

          // Release canvas memory
          canvas.width = 0;
          canvas.height = 0;

          const slide = pptx.addSlide();

          // ── Handle per-page aspect ratio differences ──
          const thisPageW = pageW / 72;
          const thisPageH = pageH / 72;
          let imgX = 0, imgY = 0, imgW = finalSlideW, imgH = finalSlideH;

          if (Math.abs(thisPageW - finalSlideW) > 0.1 || Math.abs(thisPageH - finalSlideH) > 0.1) {
            // Different dimensions: fit centered within slide bounds
            const scaleX = finalSlideW / thisPageW;
            const scaleY = finalSlideH / thisPageH;
            const fitScale = Math.min(scaleX, scaleY);
            imgW = thisPageW * fitScale;
            imgH = thisPageH * fitScale;
            imgX = (finalSlideW - imgW) / 2;
            imgY = (finalSlideH - imgH) / 2;

            // Fill background for letterboxed slides
            slide.background = { color: "FFFFFF" };
          }

          if (useEditableMode && slideContent) {
            // ── Editable slide: native PPTX elements ──
            // Still add image as background at low opacity for visual reference
            slide.addImage({
              data: imgData,
              x: imgX,
              y: imgY,
              w: imgW,
              h: imgH,
              transparency: 95,
            });

            // Scale factors from PDF points to slide inches
            const pdfToSlideX = imgW / (pageW / 72);
            const pdfToSlideY = imgH / (pageH / 72);

            // Add title if detected
            if (slideContent.titleLine) {
              const tl = slideContent.titleLine;
              const x = imgX + (tl.x / 72) * pdfToSlideX;
              const y = imgY + ((pageH - tl.y) / 72) * pdfToSlideY - (tl.fontSize / 72) * pdfToSlideY;
              const w = Math.max(((tl.maxX - tl.x) / 72) * pdfToSlideX, 1);
              const h = Math.max((tl.fontSize * 1.4 / 72) * pdfToSlideY, 0.3);
              // Map font size: PDF points are already in typographic points
              const pptFontSize = Math.max(8, Math.min(96, Math.round(tl.fontSize)));

              slide.addText(tl.text, {
                x: Math.max(0, x),
                y: Math.max(0, y),
                w: Math.min(w, finalSlideW - Math.max(0, x)),
                h: Math.min(h, finalSlideH - Math.max(0, y)),
                fontSize: pptFontSize,
                bold: true,
                color: "000000",
                valign: "bottom",
                margin: 0,
                wrap: true,
              } as Parameters<typeof slide.addText>[1]);
            }

            // Add body lines
            if (slideContent.bodyLines.length > 0) {
              // Detect if body lines look like bullet points (consistent left margin)
              const leftMargins = slideContent.bodyLines.map(l => l.x);
              const avgLeftMargin = leftMargins.reduce((a, b) => a + b, 0) / leftMargins.length;
              const consistentMargin = leftMargins.every(m => Math.abs(m - avgLeftMargin) < 20);
              const isBulletList = consistentMargin && slideContent.bodyLines.length >= 2;

              if (isBulletList) {
                // Render as a single text box with bullet points
                const firstLine = slideContent.bodyLines[0];
                const lastLine = slideContent.bodyLines[slideContent.bodyLines.length - 1];
                const x = imgX + (avgLeftMargin / 72) * pdfToSlideX;
                const topY = imgY + ((pageH - firstLine.y) / 72) * pdfToSlideY - (firstLine.fontSize / 72) * pdfToSlideY;
                const bottomY = imgY + ((pageH - lastLine.y) / 72) * pdfToSlideY + (lastLine.fontSize * 0.4 / 72) * pdfToSlideY;
                const maxRight = Math.max(...slideContent.bodyLines.map(l => l.maxX));
                const w = Math.max(((maxRight - avgLeftMargin) / 72) * pdfToSlideX, 1);
                const h = Math.max(bottomY - topY, 0.5);
                const pptFontSize = Math.max(6, Math.min(72, Math.round(firstLine.fontSize)));

                const textParts = slideContent.bodyLines.map((line, idx) => ({
                  text: line.text,
                  options: {
                    bullet: true as const,
                    breakLine: idx < slideContent!.bodyLines.length - 1,
                    fontSize: Math.max(6, Math.min(72, Math.round(line.fontSize))),
                  },
                }));

                slide.addText(textParts, {
                  x: Math.max(0, x),
                  y: Math.max(0, topY),
                  w: Math.min(w, finalSlideW - Math.max(0, x)),
                  h: Math.min(h, finalSlideH - Math.max(0, topY)),
                  fontSize: pptFontSize,
                  color: "000000",
                  valign: "top",
                  margin: 0,
                  wrap: true,
                } as Parameters<typeof slide.addText>[1]);
              } else {
                // Render body lines as individual text boxes
                for (const line of slideContent.bodyLines) {
                  const x = imgX + (line.x / 72) * pdfToSlideX;
                  const y = imgY + ((pageH - line.y) / 72) * pdfToSlideY - (line.fontSize / 72) * pdfToSlideY;
                  const w = Math.max(((line.maxX - line.x) / 72) * pdfToSlideX, 0.5);
                  const h = Math.max((line.fontSize * 1.4 / 72) * pdfToSlideY, 0.2);
                  const pptFontSize = Math.max(6, Math.min(72, Math.round(line.fontSize)));

                  slide.addText(line.text, {
                    x: Math.max(0, x),
                    y: Math.max(0, y),
                    w: Math.min(w, finalSlideW - Math.max(0, x)),
                    h: Math.min(h, finalSlideH - Math.max(0, y)),
                    fontSize: pptFontSize,
                    color: "000000",
                    valign: "bottom",
                    margin: 0,
                    wrap: true,
                  } as Parameters<typeof slide.addText>[1]);
                }
              }
            }
          } else {
            // ── Image-based slide ──
            slide.addImage({
              data: imgData,
              x: imgX,
              y: imgY,
              w: imgW,
              h: imgH,
            });

            // Text overlay: add selectable text boxes grouped by line
            if (textOverlay && textLines.length > 0) {
              const pdfToSlideX = imgW / (pageW / 72);
              const pdfToSlideY = imgH / (pageH / 72);

              for (const line of textLines) {
                if (!line.text.trim()) continue;

                // Convert PDF coordinates to slide inches
                // PDF: origin bottom-left, Y increases upward
                // PPTX: origin top-left, Y increases downward
                const x = imgX + (line.x / 72) * pdfToSlideX;
                const y = imgY + ((pageH - line.y) / 72) * pdfToSlideY - (line.fontSize / 72) * pdfToSlideY;
                const w = Math.max(((line.maxX - line.x) / 72) * pdfToSlideX, 0.3);
                const h = Math.max((line.fontSize * 1.4 / 72) * pdfToSlideY, 0.15);

                // PDF font size is already in points (1/72 inch = 1 point)
                const pptFontSize = Math.max(4, Math.min(96, Math.round(line.fontSize)));

                slide.addText(line.text, {
                  x: Math.max(0, x),
                  y: Math.max(0, y),
                  w: Math.min(w, finalSlideW - Math.max(0, x)),
                  h: Math.min(h, finalSlideH - Math.max(0, y)),
                  fontSize: pptFontSize,
                  color: "000000",
                  transparency: 100,
                  valign: "bottom",
                  margin: 0,
                  wrap: false,
                } as Parameters<typeof slide.addText>[1]);
              }
            }
          }

          // ── Speaker notes with structured formatting ──
          if (includeText && textLines.length > 0) {
            const notesText = formatNotesText(textLines, pageH);
            if (notesText) {
              slide.addNotes(notesText);
            }
          }

          page.cleanup();
          setProgress(i);
        }

        setStatus("Creating PowerPoint file...");
        const fileName = file.name.replace(/\.pdf$/i, "") + ".pptx";
        await pptx.writeFile({ fileName });

        setStatus(`Done! Created ${doc.numPages} slide${doc.numPages > 1 ? "s" : ""}.`);
      } finally {
        doc.destroy();
      }
    } catch (e: unknown) {
      console.error("PDF to PPTX error:", e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
    convertingRef.current = false;
  };

  const accentColor = "#dc2626";
  const bgTint = "var(--bg-tertiary)";

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} label="Drop a PDF here to convert to PowerPoint" />
      ) : (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bgTint }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} page{pageCount !== 1 ? "s" : ""} &middot; {(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setProgress(0); setError(""); setStatus(""); }} className="theme-text-muted text-sm font-medium" disabled={loading}>Remove</button>
          </div>

          {/* Quality preset selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Quality Preset
              {estimatedSize && <span className="ml-2 text-xs theme-text-muted font-normal">Estimated: {estimatedSize}</span>}
            </label>
            <div className="flex gap-2">
              {(Object.entries(PRESETS) as [QualityPreset, PresetConfig][]).map(([key, opt]) => (
                <button
                  key={key}
                  onClick={() => {
                    setPreset(key);
                    // Auto-sync format for ultra preset
                    if (key === "ultra") setImageFormat("png");
                    else if (imageFormat === "png") setImageFormat("auto");
                  }}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    preset === key ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:opacity-80"
                  }`}
                  style={preset === key ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                >
                  <div>{opt.label}</div>
                  <div className={`text-xs mt-0.5 ${preset === key ? "text-red-100" : "theme-text-muted"}`}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Image format selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Image Format</label>
            <div className="flex gap-2">
              {([
                { key: "auto" as ImageFormat, label: "Auto", desc: "PNG for text, JPEG for images" },
                { key: "jpeg" as ImageFormat, label: "JPEG", desc: "Smaller files" },
                { key: "png" as ImageFormat, label: "PNG", desc: "Sharper text" },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setImageFormat(opt.key)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    imageFormat === opt.key ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:opacity-80"
                  }`}
                  style={imageFormat === opt.key ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className={`text-[10px] mt-0.5 ${imageFormat === opt.key ? "text-red-100" : "theme-text-muted"}`}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 theme-file-row rounded-xl cursor-pointer hover:opacity-90">
              <input type="checkbox" checked={includeText} onChange={(e) => setIncludeText(e.target.checked)} className="w-4 h-4 rounded accent-red-600" />
              <div>
                <span className="text-sm font-medium theme-text-secondary">Include text as slide notes</span>
                <p className="text-xs theme-text-muted">Extracted text with paragraph formatting in speaker notes</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 theme-file-row rounded-xl cursor-pointer hover:opacity-90">
              <input type="checkbox" checked={textOverlay} onChange={(e) => { setTextOverlay(e.target.checked); if (e.target.checked) setEditableSlides(false); }} className="w-4 h-4 rounded accent-red-600" disabled={editableSlides} />
              <div>
                <span className="text-sm font-medium theme-text-secondary">Make text selectable (overlay)</span>
                <p className="text-xs theme-text-muted">Invisible text boxes over slide images for search and selection in PowerPoint</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 theme-file-row rounded-xl cursor-pointer hover:opacity-90">
              <input type="checkbox" checked={editableSlides} onChange={(e) => { setEditableSlides(e.target.checked); if (e.target.checked) setTextOverlay(false); }} className="w-4 h-4 rounded accent-red-600" />
              <div>
                <span className="text-sm font-medium theme-text-secondary">Editable slides (experimental)</span>
                <p className="text-xs theme-text-muted">Extract text as native PowerPoint elements with bullet detection. Falls back to images for complex layouts.</p>
              </div>
            </label>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && (
            <div className="p-4 rounded-xl border theme-border" style={{ backgroundColor: bgTint }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: accentColor }}>{status}</span>
                <span className="text-xs theme-text-secondary">{progress} / {pageCount}</span>
              </div>
              <div className="w-full theme-progress-track rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ backgroundColor: accentColor, width: `${pageCount > 0 ? (progress / pageCount) * 100 : 0}%` }} />
              </div>
            </div>
          )}

          {!loading && status && !error && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
              <p className="text-sm text-green-700">{status}</p>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading ? { backgroundColor: accentColor } : {}}
          >
            {loading ? `Converting page ${progress} of ${pageCount}...` : "Convert to PowerPoint"}
          </button>

          <p className="text-xs theme-text-muted text-center leading-relaxed">
            Each PDF page becomes a slide with the page rendered as a high-quality image.
            {editableSlides && " Simple layouts will have editable native text elements."}
          </p>
        </div>
      )}
    </div>
  );
}
