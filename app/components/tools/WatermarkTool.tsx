"use client";
import { useState } from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

export default function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.2);
  const [position, setPosition] = useState<"center" | "diagonal">("diagonal");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
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
    }
  };

  const handleWatermark = async () => {
    if (!file || !text) return;
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const font = await pdf.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < pdf.getPageCount(); i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);

        if (position === "diagonal") {
          const angle = Math.atan2(height, width);
          page.drawText(text, {
            x: width / 2 - (textWidth / 2) * Math.cos(angle),
            y: height / 2 - (fontSize / 2),
            size: fontSize,
            font,
            color: rgb(0.5, 0.5, 0.5),
            opacity,
            rotate: degrees((angle * 180) / Math.PI),
          });
        } else {
          page.drawText(text, {
            x: width / 2 - textWidth / 2,
            y: height / 2 - fontSize / 2,
            size: fontSize,
            font,
            color: rgb(0.5, 0.5, 0.5),
            opacity,
          });
        }
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `watermarked_${file.name}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to add watermark. Please try again.");
    }
    setLoading(false);
  };

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
            <button onClick={() => setFile(null)} className="theme-text-muted  text-sm font-medium">Remove</button>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Watermark text</label>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">Font size</label>
              <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} min={12} max={120} className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">Opacity ({Math.round(opacity * 100)}%)</label>
              <input type="range" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} min={0.05} max={1} step={0.05} className="w-full mt-3 accent-sky-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Position</label>
            <div className="flex gap-2">
              {(["center", "diagonal"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPosition(p)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    position === p ? "text-white border-sky-500" : "theme-bg-secondary theme-border theme-text-secondary hover:border-sky-300"
                  }`}
                  style={position === p ? { backgroundColor: "#0ea5e9" } : {}}
                >
                  {p === "center" ? "Center" : "Diagonal"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleWatermark}
            disabled={loading || !text}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading && text ? { backgroundColor: "#0ea5e9" } : {}}
          >
            {loading ? "Adding watermark..." : "Add Watermark & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
