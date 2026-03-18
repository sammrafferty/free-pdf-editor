"use client";
import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function RotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [pagesInput, setPagesInput] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    const buf = await f.arrayBuffer();
    const pdf = await PDFDocument.load(buf);
    setPageCount(pdf.getPageCount());
  };

  const parsePages = (input: string, max: number): number[] => {
    if (input.trim().toLowerCase() === "all") return Array.from({ length: max }, (_, i) => i);
    const pages: number[] = [];
    for (const part of input.split(",").map((s) => s.trim())) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        for (let i = Math.max(a, 1); i <= Math.min(b, max); i++) pages.push(i - 1);
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= max) pages.push(n - 1);
      }
    }
    return [...new Set(pages)];
  };

  const handleRotate = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const pagesToRotate = parsePages(pagesInput, pageCount);
      if (pagesToRotate.length === 0) throw new Error("No valid pages selected");
      pagesToRotate.forEach((i) => {
        const page = pdf.getPage(i);
        page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
      });
      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rotated_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Rotation failed");
    }
    setLoading(false);
  };

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-5">
          {/* File card */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} pages</p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="theme-text-muted  text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Pages input */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Pages to rotate
            </label>
            <input
              type="text"
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              placeholder='e.g. "all", "1-3", "1, 4, 7"'
              className="w-full theme-input rounded-xl px-4 py-3 theme-text placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm"
            />
          </div>

          {/* Rotation selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Rotation angle
            </label>
            <div className="flex gap-2">
              {([90, 180, 270] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRotation(r)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors
                    ${
                      rotation === r
                        ? "bg-amber-500/100 border-amber-500 text-white"
                        : "theme-bg-secondary theme-border theme-text-secondary hover:border-amber-300 hover:bg-amber-500/10"
                    }`}
                >
                  {r}° {r === 90 ? "↻" : r === 180 ? "↔" : "↺"}
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
            onClick={handleRotate}
            disabled={loading}
            className="w-full py-3.5 bg-amber-500/100 hover:bg-amber-600 theme-btn-disabled text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Rotating..." : "Rotate & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
