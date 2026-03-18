"use client";
import { useState } from "react";
import Dropzone from "../Dropzone";

interface SlideContent {
  texts: { text: string; x: number; y: number; w: number; h: number; fontSize: number; bold: boolean; italic: boolean; color: string }[];
  images: { data: string; x: number; y: number; w: number; h: number }[];
}

export default function PptxToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setError("");
    setStatus("");
  };

  const parseColor = (colorEl: Element | null): string => {
    if (!colorEl) return "#000000";
    const srgb = colorEl.querySelector("a\\:srgbClr, srgbClr");
    if (srgb) return "#" + (srgb.getAttribute("val") || "000000");
    return "#000000";
  };

  const emuToPoints = (emu: number): number => emu / 12700;

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setStatus("Reading PowerPoint file...");
    setError("");

    try {
      const JSZip = (await import("jszip")).default;
      const { jsPDF } = await import("jspdf");

      const buf = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);

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
                const ext = mediaPath.split(".").pop()?.toLowerCase();
                const mime = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";
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

        const slideContent: SlideContent = { texts: [], images: [] };

        // Extract shapes with text
        const spTree = slideDoc.querySelectorAll("p\\:sp, sp");
        for (const sp of Array.from(spTree)) {
          // Get position
          const off = sp.querySelector("a\\:off, off");
          const ext = sp.querySelector("a\\:ext, ext");
          const x = off ? emuToPoints(parseInt(off.getAttribute("x") || "0")) : 0;
          const y = off ? emuToPoints(parseInt(off.getAttribute("y") || "0")) : 0;
          const w = ext ? emuToPoints(parseInt(ext.getAttribute("cx") || "0")) : slideW;
          const h = ext ? emuToPoints(parseInt(ext.getAttribute("cy") || "0")) : 50;

          // Extract text runs
          const paragraphs = sp.querySelectorAll("a\\:p, p");
          let textY = y;
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
                if (sz) fontSize = parseInt(sz) / 100;
                bold = rPr.getAttribute("b") === "1";
                italic = rPr.getAttribute("i") === "1";
                const solidFill = rPr.querySelector("a\\:solidFill, solidFill");
                if (solidFill) color = parseColor(solidFill);
              }
            }

            if (paraText.trim()) {
              slideContent.texts.push({
                text: paraText,
                x, y: textY, w, h: fontSize * 1.4,
                fontSize, bold, italic, color,
              });
              textY += fontSize * 1.4;
            }
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
          pdf.setFontSize(t.fontSize);

          // Parse hex color
          const hex = t.color.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          pdf.setTextColor(r, g, b);

          // Word wrap within the text box width
          const lines = pdf.splitTextToSize(t.text, t.w);
          pdf.text(lines, t.x, t.y + t.fontSize);
        }
      }

      pdf.save(file.name.replace(/\.pptx$/i, "") + ".pdf");
      setStatus(`Done! Converted ${slides.length} slide${slides.length > 1 ? "s" : ""} to PDF.`);
    } catch (e: unknown) {
      console.error("PPTX to PDF error:", e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
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
            <button onClick={() => { setFile(null); setError(""); setStatus(""); }} className="theme-text-muted  text-sm font-medium">Remove</button>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
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
                <div className="w-full theme-progress-track rounded-full h-2">
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
            {loading ? `Converting slide ${progress} of ${totalSlides}...` : "Convert to PDF"}
          </button>

          <p className="text-xs theme-text-muted text-center leading-relaxed">
            Extracts text and images from slides. Complex animations and effects may not be preserved.
          </p>
        </div>
      )}
    </div>
  );
}
