"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

export default function CropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [unit, setUnit] = useState<"points" | "percent">("points");
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

  const handleCrop = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);

      for (let i = 0; i < pdf.getPageCount(); i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        let t = top, b = bottom, l = left, r = right;

        if (unit === "percent") {
          t = (top / 100) * height;
          b = (bottom / 100) * height;
          l = (left / 100) * width;
          r = (right / 100) * width;
        }

        const cropW = width - l - r;
        const cropH = height - t - b;

        if (cropW <= 0 || cropH <= 0) {
          setError("Crop margins are too large — no visible area remains.");
          setLoading(false);
          return;
        }

        // Set both MediaBox and CropBox so all viewers respect the crop
        page.setMediaBox(l, b, cropW, cropH);
        page.setCropBox(l, b, cropW, cropH);
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `cropped_${file.name}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to crop PDF. Please try again.");
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <label className="block text-sm font-medium theme-text-secondary mb-2">Unit</label>
            <div className="flex gap-2">
              {(["points", "percent"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    unit === u ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:border-teal-300"
                  }`}
                  style={unit === u ? { backgroundColor: "#14b8a6", borderColor: "#14b8a6" } : {}}
                >
                  {u === "points" ? "Points (pt)" : "Percent (%)"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {([["Top", top, setTop], ["Bottom", bottom, setBottom], ["Left", left, setLeft], ["Right", right, setRight]] as const).map(([label, val, setter]) => (
              <div key={label}>
                <label className="block text-sm font-medium theme-text-secondary mb-2">{label}</label>
                <input
                  type="number"
                  value={val}
                  onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))}
                  min={0}
                  className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleCrop}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading ? { backgroundColor: "#14b8a6" } : {}}
          >
            {loading ? "Cropping..." : "Crop & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
