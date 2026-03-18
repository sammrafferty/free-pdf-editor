"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

export default function DeletePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pagesInput, setPagesInput] = useState("");
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

  const parsePages = (input: string, max: number): Set<number> => {
    const pages = new Set<number>();
    for (const part of input.split(",").map((s) => s.trim())) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        for (let i = Math.max(a, 1); i <= Math.min(b, max); i++) pages.add(i - 1);
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
      const keepIndices = Array.from({ length: pageCount }, (_, i) => i).filter(
        (i) => !toDelete.has(i)
      );
      const copied = await newPdf.copyPages(srcPdf, keepIndices);
      copied.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `edited_${file.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete pages");
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
          {/* File card */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              onClick={() => { setFile(null); setPageCount(0); }}
              className="theme-text-muted  text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Pages input */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Pages to delete
            </label>
            <input
              type="text"
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              placeholder="e.g. 2, 4-6, 8"
              className="w-full theme-input rounded-xl px-4 py-3 theme-text placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 text-sm"
            />
          </div>

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleDelete}
            disabled={loading || !pagesInput}
            className="w-full py-3.5 bg-red-500/100 hover:bg-red-600 theme-btn-disabled text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Processing..." : "Delete Pages & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
