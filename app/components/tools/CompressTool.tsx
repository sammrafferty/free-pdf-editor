"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ original: number; compressed: number } | null>(null);

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setResult(null);
  };

  const fmt = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
      const bytes = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResult({ original: file.size, compressed: bytes.length });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed_${file.name}`;
      a.click();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const pct = result ? ((1 - result.compressed / result.original) * 100).toFixed(1) : null;

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-5">
          {/* File card */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                <p className="text-xs text-gray-400">{fmt(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setResult(null); }}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="font-semibold text-emerald-700 text-sm">Compressed successfully!</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">{fmt(result.original)}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <span className="font-semibold text-emerald-700">{fmt(result.compressed)}</span>
                <span className="ml-auto text-emerald-600 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full text-xs">
                  {pct}% smaller
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleCompress}
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Compressing..." : "Compress PDF"}
          </button>
        </div>
      )}
    </div>
  );
}
