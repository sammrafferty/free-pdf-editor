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
    const parts = r.split(",").map(s => s.trim());
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
      const copied = await newPdf.copyPages(srcPdf, pages.map(p => p - 1));
      copied.forEach(p => newPdf.addPage(p));

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
      <h2 className="text-2xl font-bold mb-6">✂️ Split PDF</h2>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-white/50">{pageCount} pages</p>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); }} className="text-white/40 hover:text-white text-sm">Remove</button>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Pages to extract (e.g. 1-3, 5, 7-9)</label>
            <input
              type="text"
              value={range}
              onChange={e => setRange(e.target.value)}
              placeholder={`1-${pageCount}`}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSplit}
            disabled={loading || !range}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 rounded-xl font-semibold transition"
          >
            {loading ? "Processing..." : "Extract Pages"}
          </button>
        </div>
      )}
    </div>
  );
}
