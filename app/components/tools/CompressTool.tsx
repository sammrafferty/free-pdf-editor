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
      // Re-save with compression options
      const bytes = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResult({ original: file.size, compressed: bytes.length });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed_${file.name}`;
      a.click();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🗜️ Compress PDF</h2>
      <p className="text-white/50 text-sm mb-4">Reduces file size by optimizing the PDF structure. Best for PDFs with redundant data.</p>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-white/50">{fmt(file.size)}</p>
            </div>
            <button onClick={() => { setFile(null); setResult(null); }} className="text-white/40 hover:text-white text-sm">Remove</button>
          </div>

          {result && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-sm">
              <p className="text-green-400 font-medium mb-1">✓ Compressed!</p>
              <p className="text-white/60">Original: {fmt(result.original)} → Compressed: {fmt(result.compressed)}</p>
              <p className="text-white/40">{((1 - result.compressed / result.original) * 100).toFixed(1)}% reduction</p>
            </div>
          )}

          <button
            onClick={handleCompress}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 rounded-xl font-semibold transition"
          >
            {loading ? "Compressing..." : "Compress PDF"}
          </button>
        </div>
      )}
    </div>
  );
}
