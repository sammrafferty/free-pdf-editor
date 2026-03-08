"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function DeletePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pagesInput, setPagesInput] = useState("");
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

  const parsePages = (input: string, max: number): Set<number> => {
    const pages = new Set<number>();
    for (const part of input.split(",").map(s => s.trim())) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        for (let i = a; i <= Math.min(b, max); i++) pages.add(i - 1);
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= max) pages.add(n - 1);
      }
    }
    return pages;
  };

  const handleDelete = async () => {
    if (!file || !pagesInput) return;
    setLoading(true);
    setError("");
    try {
      const toDelete = parsePages(pagesInput, pageCount);
      if (toDelete.size >= pageCount) throw new Error("Can't delete all pages");

      const buf = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(buf);
      const newPdf = await PDFDocument.create();
      const keepIndices = Array.from({ length: pageCount }, (_, i) => i).filter(i => !toDelete.has(i));
      const copied = await newPdf.copyPages(srcPdf, keepIndices);
      copied.forEach(p => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited_${file.name}`;
      a.click();
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🗑️ Delete Pages</h2>
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
            <label className="block text-sm text-white/70 mb-2">Pages to delete (e.g. 2, 4-6, 8)</label>
            <input
              type="text"
              value={pagesInput}
              onChange={e => setPagesInput(e.target.value)}
              placeholder="e.g. 1, 3-5"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleDelete}
            disabled={loading || !pagesInput}
            className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-white/10 disabled:text-white/30 rounded-xl font-semibold transition"
          >
            {loading ? "Processing..." : "Delete Pages & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
