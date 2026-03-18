"use client";
import { useState } from "react";
import Dropzone from "../Dropzone";

type QualityMode = "1x" | "2x";

export default function PdfToPptxTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [quality, setQuality] = useState<QualityMode>("2x");
  const [includeText, setIncludeText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("password") || msg.includes("encrypted")) {
        setError("This PDF is password-protected.");
      } else {
        setError("Could not read this PDF.");
      }
      setFile(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
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
      const pptx = new PptxGenJS();
      const scale = quality === "2x" ? 2 : 1;

      // Set slide dimensions based on first page aspect ratio
      const firstPage = await doc.getPage(1);
      const firstVp = firstPage.getViewport({ scale: 1 });
      const aspect = firstVp.width / firstVp.height;
      const slideW = 10;
      const slideH = slideW / aspect;
      pptx.defineLayout({ name: "Custom", width: slideW, height: slideH });
      pptx.layout = "Custom";

      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(i);
        setStatus(`Rendering page ${i} of ${doc.numPages}...`);

        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });

        // Render page to canvas
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport } as any).promise;

        const imgData = canvas.toDataURL("image/jpeg", 0.92);

        const slide = pptx.addSlide();
        slide.addImage({
          data: imgData,
          x: 0,
          y: 0,
          w: slideW,
          h: slideH,
        });

        // Extract text for notes
        if (includeText) {
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter((item) => "str" in item)
            .map((item) => (item as { str: string }).str)
            .join(" ")
            .trim();
          if (pageText) {
            slide.addNotes(pageText);
          }
        }
      }

      setStatus("Creating PowerPoint file...");
      const fileName = file.name.replace(/\.pdf$/i, "") + ".pptx";
      await pptx.writeFile({ fileName });

      setStatus(`Done! Created ${doc.numPages} slide${doc.numPages > 1 ? "s" : ""}.`);
    } catch (e: unknown) {
      console.error("PDF to PPTX error:", e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
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
            <button onClick={() => { setFile(null); setPageCount(0); setError(""); setStatus(""); }} className="theme-text-muted  text-sm font-medium">Remove</button>
          </div>

          {/* Quality selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Image Quality</label>
            <div className="flex gap-2">
              {([
                { key: "1x" as QualityMode, label: "Standard", desc: "Smaller file" },
                { key: "2x" as QualityMode, label: "High Quality", desc: "2x resolution" },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setQuality(opt.key)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    quality === opt.key ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:opacity-80"
                  }`}
                  style={quality === opt.key ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                >
                  <div>{opt.label}</div>
                  <div className={`text-xs mt-0.5 ${quality === opt.key ? "text-red-100" : "theme-text-muted"}`}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text overlay option */}
          <label className="flex items-center gap-3 p-3 theme-file-row rounded-xl cursor-pointer hover:opacity-90">
            <input type="checkbox" checked={includeText} onChange={(e) => setIncludeText(e.target.checked)} className="w-4 h-4 rounded accent-red-600" />
            <div>
              <span className="text-sm font-medium theme-text-secondary">Include text as slide notes</span>
              <p className="text-xs theme-text-muted">Extracted text will be added to speaker notes for searchability</p>
            </div>
          </label>

          {error && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
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
                <div className="h-2 rounded-full transition-all" style={{ backgroundColor: accentColor, width: `${(progress / pageCount) * 100}%` }} />
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
          </p>
        </div>
      )}
    </div>
  );
}
