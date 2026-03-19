"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfThumbnailGrid from "@/app/components/PdfThumbnailGrid";

export default function ExtractPagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setError("");
    setSelected(new Set());
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const count = pdf.getPageCount();
      if (count === 0) {
        setError("This PDF has no pages.");
        setFile(null);
        setPageCount(0);
        return;
      }
      setFile(f);
      setPageCount(count);
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
      setPageCount(0);
    }
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

  const selectOdd = () => {
    setSelected(new Set(Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p % 2 === 1)));
  };

  const selectEven = () => {
    setSelected(new Set(Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p % 2 === 0)));
  };

  const handleExtract = async () => {
    if (!file || selected.size === 0) return;
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(buf);
      const newPdf = await PDFDocument.create();
      const indices = Array.from(selected)
        .filter((p) => p >= 1 && p <= pageCount)
        .sort((a, b) => a - b)
        .map((p) => p - 1);
      if (indices.length === 0) {
        setError("No valid pages selected.");
        return;
      }
      const copied = await newPdf.copyPages(srcPdf, indices);
      copied.forEach((p) => newPdf.addPage(p));

      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `extracted_${indices.length}_pages.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} pages</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setSelected(new Set()); setError(""); }} className="theme-text-muted text-sm font-medium">Remove</button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium theme-text-secondary">Select pages to extract</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-purple-600 hover:text-purple-800 font-medium">All</button>
                <button onClick={selectNone} className="text-xs theme-text-muted font-medium">None</button>
                <button onClick={selectOdd} className="text-xs text-purple-600 hover:text-purple-800 font-medium">Select Odd</button>
                <button onClick={selectEven} className="text-xs text-purple-600 hover:text-purple-800 font-medium">Select Even</button>
              </div>
            </div>
            <PdfThumbnailGrid
              file={file}
              pageCount={pageCount}
              selected={selected}
              onToggle={togglePage}
            />
          </div>

          {error && <div className="p-3 theme-error rounded-xl text-sm">{error}</div>}

          <button
            onClick={handleExtract}
            disabled={loading || selected.size === 0}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading && selected.size > 0 ? { backgroundColor: "#8b5cf6" } : {}}
          >
            {loading ? "Extracting..." : `Extract ${selected.size} Page${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
