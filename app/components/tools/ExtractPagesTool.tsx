"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function ExtractPagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setError("");
    setSelected(new Set());
    const buf = await f.arrayBuffer();
    const pdf = await PDFDocument.load(buf);
    setPageCount(pdf.getPageCount());
  };

  const togglePage = (p: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)));
  };

  const selectNone = () => setSelected(new Set());

  const handleExtract = async () => {
    if (!file || selected.size === 0) return;
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(buf);
      const newPdf = await PDFDocument.create();
      const indices = Array.from(selected).sort((a, b) => a - b).map((p) => p - 1);
      const copied = await newPdf.copyPages(srcPdf, indices);
      copied.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `extracted_${selected.size}_pages.pdf`;
      a.click();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    }
    setLoading(false);
  };

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f5f3ff" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                <p className="text-xs text-gray-400">{pageCount} pages</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setSelected(new Set()); }} className="text-gray-400 hover:text-gray-600 text-sm font-medium">Remove</button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Select pages to extract</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-purple-600 hover:text-purple-800 font-medium">All</button>
                <button onClick={selectNone} className="text-xs text-gray-400 hover:text-gray-600 font-medium">None</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => togglePage(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    selected.has(p) ? "text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"
                  }`}
                  style={selected.has(p) ? { backgroundColor: "#8b5cf6" } : {}}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}

          <button
            onClick={handleExtract}
            disabled={loading || selected.size === 0}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            style={!loading && selected.size > 0 ? { backgroundColor: "#8b5cf6" } : {}}
          >
            {loading ? "Extracting..." : `Extract ${selected.size} Page${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
