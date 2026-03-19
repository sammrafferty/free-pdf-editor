"use client";
import { useState } from "react";
import Dropzone from "../Dropzone";

interface TextItem {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string;
}

interface TableItem {
  x: number;
  y: number;
  w: number;
  h: number;
  rows: string[][];
}

interface SlideContent {
  texts: TextItem[];
  images: { data: string; x: number; y: number; w: number; h: number }[];
  tables: TableItem[];
}

export default function PptxToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFile = (files: File[]) => {
    if (!files || files.length === 0) return;
    setFile(files[0]);
    setError("");
    setStatus("");
    setProgress(0);
    setTotalSlides(0);
  };

  // Default fallback colors for scheme color names
  const defaultSchemeColors: Record<string, string> = {
    dk1: "#000000",
    lt1: "#FFFFFF",
    dk2: "#44546A",
    lt2: "#E7E6E6",
    accent1: "#4472C4",
    accent2: "#ED7D31",
    accent3: "#A5A5A5",
    accent4: "#FFC000",
    accent5: "#5B9BD5",
    accent6: "#70AD47",
    hlink: "#0563C1",
    folHlink: "#954F72",
  };

  const parseThemeColors = (themeXml: string): Record<string, string> => {
    const colorMap: Record<string, string> = { ...defaultSchemeColors };
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(themeXml, "text/xml");
      const clrScheme = doc.querySelector("a\\:clrScheme, clrScheme");
      if (!clrScheme) return colorMap;

      for (const child of Array.from(clrScheme.children)) {
        const tagName = child.localName || child.tagName.replace(/^.*:/, "");
        const srgb = child.querySelector("a\\:srgbClr, srgbClr");
        const sysClr = child.querySelector("a\\:sysClr, sysClr");
        let hex = "";
        if (srgb) {
          hex = srgb.getAttribute("val") || "";
        } else if (sysClr) {
          hex = sysClr.getAttribute("lastClr") || sysClr.getAttribute("val") || "";
        }
        if (hex) {
          colorMap[tagName] = "#" + hex;
        }
      }
    } catch {
      // use defaults
    }
    return colorMap;
  };

  const parseColor = (colorEl: Element | null, themeColors: Record<string, string>): string => {
    if (!colorEl) return "#000000";
    const srgb = colorEl.querySelector("a\\:srgbClr, srgbClr");
    if (srgb) return "#" + (srgb.getAttribute("val") || "000000");
    const schemeClr = colorEl.querySelector("a\\:schemeClr, schemeClr");
    if (schemeClr) {
      const val = schemeClr.getAttribute("val") || "";
      return themeColors[val] || defaultSchemeColors[val] || "#000000";
    }
    return "#000000";
  };

  const emuToPoints = (emu: number): number => emu / 12700;

  const extractCellText = (tc: Element): string => {
    const parts: string[] = [];
    const paragraphs = tc.querySelectorAll("a\\:p, p");
    for (const para of Array.from(paragraphs)) {
      const runs = para.querySelectorAll("a\\:r, r");
      let paraText = "";
      for (const run of Array.from(runs)) {
        const tEl = run.querySelector("a\\:t, t");
        if (tEl) paraText += tEl.textContent || "";
      }
      if (paraText) parts.push(paraText);
    }
    return parts.join("\n");
  };

  const handleConvert = async () => {
    if (!file || loading) return;
    setLoading(true);
    setProgress(0);
    setTotalSlides(0);
    setStatus("Reading PowerPoint file...");
    setError("");

    try {
      const JSZip = (await import("jszip")).default;
      const { jsPDF } = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      // jspdf-autotable adds itself to jsPDF prototype on import; access it via default export
      const autoTable = autoTableModule.default;

      const buf = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);

      // Parse theme colors from theme XML
      let themeColors: Record<string, string> = { ...defaultSchemeColors };
      try {
        const themeFile = zip.file("ppt/theme/theme1.xml");
        if (themeFile) {
          const themeXml = await themeFile.async("text");
          themeColors = parseThemeColors(themeXml);
        }
      } catch {
        // use defaults
      }

      // Find all slide files
      const slideFiles: string[] = [];
      zip.forEach((path) => {
        if (/^ppt\/slides\/slide\d+\.xml$/.test(path)) {
          slideFiles.push(path);
        }
      });

      // Sort slides by number
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
        return numA - numB;
      });

      if (slideFiles.length === 0) {
        setError("No slides found in this PowerPoint file.");
        setStatus("");
        setLoading(false);
        return;
      }

      setTotalSlides(slideFiles.length);

      // Get slide dimensions from presentation.xml
      let slideW = 960; // default 10 inches in points
      let slideH = 540; // default ~7.5 inches
      try {
        const presXml = await zip.file("ppt/presentation.xml")?.async("text");
        if (presXml) {
          const parser = new DOMParser();
          const presDoc = parser.parseFromString(presXml, "text/xml");
          const sldSz = presDoc.querySelector("p\\:sldSz, sldSz");
          if (sldSz) {
            const cx = parseInt(sldSz.getAttribute("cx") || "0");
            const cy = parseInt(sldSz.getAttribute("cy") || "0");
            if (cx > 0 && cy > 0) {
              slideW = emuToPoints(cx);
              slideH = emuToPoints(cy);
            }
          }
        }
      } catch { /* use defaults */ }

      // Load relationships and media
      const mediaCache: Record<string, string> = {};

      const loadMedia = async (slideIdx: number): Promise<Record<string, string>> => {
        const relMap: Record<string, string> = {};
        const relPath = `ppt/slides/_rels/slide${slideIdx}.xml.rels`;
        const relFile = zip.file(relPath);
        if (!relFile) return relMap;

        const relXml = await relFile.async("text");
        const parser = new DOMParser();
        const relDoc = parser.parseFromString(relXml, "text/xml");
        const rels = relDoc.querySelectorAll("Relationship");

        for (const rel of Array.from(rels)) {
          const rId = rel.getAttribute("Id") || "";
          const target = rel.getAttribute("Target") || "";
          if (target.includes("../media/")) {
            const mediaPath = "ppt/media/" + target.split("/").pop();
            if (!mediaCache[mediaPath]) {
              const mediaFile = zip.file(mediaPath);
              if (mediaFile) {
                const base64 = await mediaFile.async("base64");
                const ext = mediaPath.split(".").pop()?.toLowerCase() || "";
                // Skip unsupported formats (SVG, EMF, WMF) - jsPDF only supports PNG/JPEG/GIF/BMP/WebP
                if (["svg", "emf", "wmf", "tiff", "tif"].includes(ext)) continue;
                const mime = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : ext === "webp" ? "image/webp" : ext === "bmp" ? "image/bmp" : "image/jpeg";
                mediaCache[mediaPath] = `data:${mime};base64,${base64}`;
              }
            }
            relMap[rId] = mediaCache[mediaPath] || "";
          }
        }
        return relMap;
      };

      const slides: SlideContent[] = [];

      for (let i = 0; i < slideFiles.length; i++) {
        const slideNum = parseInt(slideFiles[i].match(/slide(\d+)/)?.[1] || "1");
        setProgress(i + 1);
        setStatus(`Parsing slide ${i + 1} of ${slideFiles.length}...`);

        const xmlText = await zip.file(slideFiles[i])?.async("text");
        if (!xmlText) continue;

        const parser = new DOMParser();
        const slideDoc = parser.parseFromString(xmlText, "text/xml");
        const rels = await loadMedia(slideNum);

        const slideContent: SlideContent = { texts: [], images: [], tables: [] };

        // Extract shapes (including group shapes)
        const spTree = slideDoc.querySelectorAll("p\\:sp, sp");
        for (const sp of Array.from(spTree)) {
          // Get position and dimensions from the shape's transform
          const off = sp.querySelector("a\\:off, off");
          const ext = sp.querySelector("a\\:ext, ext");
          const shapeX = off ? emuToPoints(parseInt(off.getAttribute("x") || "0")) : 0;
          const shapeY = off ? emuToPoints(parseInt(off.getAttribute("y") || "0")) : 0;
          const shapeW = ext ? emuToPoints(parseInt(ext.getAttribute("cx") || "0")) : slideW;
          const shapeH = ext ? emuToPoints(parseInt(ext.getAttribute("cy") || "0")) : 50;

          // Collect all paragraph data first to calculate total height
          const paraDataList: { text: string; fontSize: number; bold: boolean; italic: boolean; color: string }[] = [];
          const paragraphs = sp.querySelectorAll("a\\:p, p");

          for (const para of Array.from(paragraphs)) {
            const runs = para.querySelectorAll("a\\:r, r");
            let paraText = "";
            let fontSize = 18;
            let bold = false;
            let italic = false;
            let color = "#000000";

            for (const run of Array.from(runs)) {
              const rPr = run.querySelector("a\\:rPr, rPr");
              const tEl = run.querySelector("a\\:t, t");
              if (!tEl) continue;

              paraText += tEl.textContent || "";

              if (rPr) {
                const sz = rPr.getAttribute("sz");
                // OOXML sz is in hundredths of a point: sz="1800" = 18pt
                if (sz) fontSize = parseInt(sz) / 100;
                bold = rPr.getAttribute("b") === "1";
                italic = rPr.getAttribute("i") === "1";
                const solidFill = rPr.querySelector("a\\:solidFill, solidFill");
                if (solidFill) color = parseColor(solidFill, themeColors);
              }
            }

            if (paraText.trim()) {
              paraDataList.push({ text: paraText, fontSize, bold, italic, color });
            }
          }

          if (paraDataList.length === 0) continue;

          // Calculate total text height to check if it fits in the bounding box
          const lineHeight = 1.4;
          let totalTextHeight = 0;
          for (const pd of paraDataList) {
            totalTextHeight += pd.fontSize * lineHeight;
          }

          // Determine scale factor if text overflows the shape's bounding box
          let scaleFactor = 1;
          if (shapeH > 0 && totalTextHeight > shapeH) {
            scaleFactor = shapeH / totalTextHeight;
          }

          // Place text items within the shape bounding box
          let textY = shapeY;
          for (const pd of paraDataList) {
            const effectiveFontSize = pd.fontSize * scaleFactor;
            const itemHeight = effectiveFontSize * lineHeight;

            // Clip: do not render text that falls outside the shape box
            if (shapeH > 0 && (textY + itemHeight - shapeY) > shapeH + 1) {
              break;
            }

            slideContent.texts.push({
              text: pd.text,
              x: shapeX,
              y: textY,
              w: shapeW,
              h: itemHeight,
              fontSize: effectiveFontSize,
              bold: pd.bold,
              italic: pd.italic,
              color: pd.color,
            });
            textY += itemHeight;
          }
        }

        // Extract tables from graphicFrame shapes
        const graphicFrames = slideDoc.querySelectorAll("p\\:graphicFrame, graphicFrame");
        for (const gf of Array.from(graphicFrames)) {
          const tbl = gf.querySelector("a\\:tbl, tbl");
          if (!tbl) continue;

          // Get table position
          const off = gf.querySelector("a\\:off, off");
          const ext = gf.querySelector("a\\:ext, ext");
          const tableX = off ? emuToPoints(parseInt(off.getAttribute("x") || "0")) : 0;
          const tableY = off ? emuToPoints(parseInt(off.getAttribute("y") || "0")) : 0;
          const tableW = ext ? emuToPoints(parseInt(ext.getAttribute("cx") || "0")) : slideW;
          const tableH = ext ? emuToPoints(parseInt(ext.getAttribute("cy") || "0")) : 100;

          // Parse table rows
          const rows: string[][] = [];
          const trElements = tbl.querySelectorAll("a\\:tr, tr");
          for (const tr of Array.from(trElements)) {
            const cells: string[] = [];
            const tcElements = tr.querySelectorAll("a\\:tc, tc");
            for (const tc of Array.from(tcElements)) {
              cells.push(extractCellText(tc));
            }
            if (cells.length > 0) {
              rows.push(cells);
            }
          }

          if (rows.length > 0) {
            slideContent.tables.push({
              x: tableX,
              y: tableY,
              w: tableW,
              h: tableH,
              rows,
            });
          }
        }

        // Extract images
        const pics = slideDoc.querySelectorAll("p\\:pic, pic");
        for (const pic of Array.from(pics)) {
          const off = pic.querySelector("a\\:off, off");
          const ext = pic.querySelector("a\\:ext, ext");
          const blipFill = pic.querySelector("a\\:blip, blip");

          if (!blipFill) continue;

          const rEmbed = blipFill.getAttribute("r:embed") || blipFill.getAttribute("embed") || "";
          const imgData = rels[rEmbed];
          if (!imgData) continue;

          const x = off ? emuToPoints(parseInt(off.getAttribute("x") || "0")) : 0;
          const y = off ? emuToPoints(parseInt(off.getAttribute("y") || "0")) : 0;
          const w = ext ? emuToPoints(parseInt(ext.getAttribute("cx") || "0")) : 200;
          const h = ext ? emuToPoints(parseInt(ext.getAttribute("cy") || "0")) : 200;

          slideContent.images.push({ data: imgData, x, y, w, h });
        }

        slides.push(slideContent);
      }

      setStatus("Creating PDF...");
      const pdf = new jsPDF({
        orientation: slideW > slideH ? "l" : "p",
        unit: "pt",
        format: [slideW, slideH],
      });

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage([slideW, slideH]);

        const slide = slides[i];

        // Draw white background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, slideW, slideH, "F");

        // Draw images first (background)
        for (const img of slide.images) {
          try {
            pdf.addImage(img.data, img.x, img.y, img.w, img.h);
          } catch {
            // Skip problematic images
          }
        }

        // Draw text
        for (const t of slide.texts) {
          const fontStyle = t.bold && t.italic ? "bolditalic" : t.bold ? "bold" : t.italic ? "italic" : "normal";
          pdf.setFont("helvetica", fontStyle);
          pdf.setFontSize(Math.max(t.fontSize, 1));

          // Parse hex color with fallback for malformed values
          const hex = t.color.replace("#", "").padEnd(6, "0");
          const r = parseInt(hex.substring(0, 2), 16) || 0;
          const g = parseInt(hex.substring(2, 4), 16) || 0;
          const b = parseInt(hex.substring(4, 6), 16) || 0;
          pdf.setTextColor(r, g, b);

          // Word wrap within the text box width (use slideW as fallback if width is 0)
          const lines: string[] = pdf.splitTextToSize(t.text, t.w > 0 ? t.w : slideW);

          // Limit lines to what fits in the allocated height
          const lineSpacing = t.fontSize * 1.2;
          const maxLines = Math.max(1, Math.floor(t.h / lineSpacing));
          const clippedLines = lines.slice(0, maxLines);

          pdf.text(clippedLines, t.x, t.y + t.fontSize);
        }

        // Draw tables using jspdf-autotable
        for (const table of slide.tables) {
          if (table.rows.length === 0) continue;

          // Use first row as header, rest as body
          const head = [table.rows[0]];
          const body = table.rows.slice(1);

          autoTable(pdf, {
            startY: table.y,
            margin: { left: table.x },
            tableWidth: table.w,
            head,
            body,
            styles: {
              fontSize: 10,
              cellPadding: 4,
              overflow: "linebreak",
            },
            headStyles: {
              fillColor: [68, 114, 196],
              textColor: [255, 255, 255],
              fontStyle: "bold",
            },
            theme: "grid",
          });
        }
      }

      pdf.save(file.name.replace(/\.pptx$/i, "") + ".pdf");
      setStatus(`Done! Converted ${slides.length} slide${slides.length > 1 ? "s" : ""} to PDF.`);
    } catch (e: unknown) {
      console.error("PPTX to PDF error:", e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const accentColor = "#dc2626";
  const bgTint = "var(--bg-tertiary)";

  return (
    <div>
      {!file ? (
        <Dropzone
          onFiles={handleFile}
          label="Drop a PowerPoint file here (.pptx)"
          accept={{
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
          }}
        />
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
                <p className="text-xs theme-text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setError(""); setStatus(""); setProgress(0); setTotalSlides(0); }} className="theme-text-muted text-sm font-medium">Remove</button>
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
                {totalSlides > 0 && <span className="text-xs theme-text-secondary">{progress} / {totalSlides}</span>}
              </div>
              {totalSlides > 0 && (
                <div className="w-full theme-progress-track rounded-full h-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={totalSlides} aria-label={`Conversion progress: ${progress} of ${totalSlides} slides`}>
                  <div className="h-2 rounded-full transition-all" style={{ backgroundColor: accentColor, width: `${(progress / totalSlides) * 100}%` }} />
                </div>
              )}
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
            {loading ? (totalSlides > 0 ? `Converting slide ${progress} of ${totalSlides}...` : "Reading file...") : "Convert to PDF"}
          </button>

          <p className="text-xs theme-text-muted text-center leading-relaxed">
            Extracts text and images from slides. Complex animations and effects may not be preserved.
          </p>
        </div>
      )}
    </div>
  );
}
