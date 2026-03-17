"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [range, setRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setError("");
    const buf = await f.arrayBuffer();
    const pdf = await PDFDocument.load(buf);
    setPageCount(pdf.getPageCount());
  };

  const parseRange = (r: string, max: number): number[] => {
    const pages: number[] = [];
    const parts = r.split(",").map((s) => s.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        for (let i = a; i <= Math.min(b, max); i++) pages.push(i);
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= max) pages.push(n);
      }
    }
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file || !range) return;
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(buf);
      const pages = parseRange(range, pageCount);
      if (!pages.length) throw new Error("Invalid page range");

      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(srcPdf, pages.map((p) => p - 1));
      copied.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `split_pages_${range.replace(/,/g, "_")}.pdf`;
      a.click();
    } catch (e: any) {
      setError(e.message);
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
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                <p className="text-xs text-gray-400">{pageCount} pages</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setPageCount(0); }}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Page range input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pages to extract
            </label>
            <input
              type="text"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder={`e.g. 1-3, 5, 7-9`}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleSplit}
            disabled={loading || !range}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Processing..." : "Extract Pages"}
          </button>
        </div>
      )}
    </div>
  );
}
