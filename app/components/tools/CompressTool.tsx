"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import ProgressBar from "@/app/components/ProgressBar";

type Preset = "maximum" | "balanced" | "light";

const presets: { key: Preset; name: string; description: string; range: string }[] = [
  {
    key: "maximum",
    name: "Maximum",
    description: "Converts pages to JPEG images for aggressive compression",
    range: "50-80% smaller",
  },
  {
    key: "balanced",
    name: "Balanced",
    description: "Optimizes structure and strips metadata",
    range: "10-40% smaller",
  },
  {
    key: "light",
    name: "Light",
    description: "Lossless optimization, preserves everything",
    range: "5-15% smaller",
  },
];

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<Preset>("balanced");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{ original: number; compressed: number; method: string } | null>(null);
  const [error, setError] = useState("");

  const handleFile = (files: File[]) => {
    if (!files || files.length === 0) return;
    setFile(files[0]);
    setResult(null);
    setError("");
  };

  const fmt = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const compressMaximum = async (buf: ArrayBuffer): Promise<{ bytes: Uint8Array; method: string }> => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    const totalPages = doc.numPages;
    setProgress({ current: 0, total: totalPages });

    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= totalPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error(`Failed to create canvas context for page ${i}`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.6);
      const jpegBytes = Uint8Array.from(atob(jpegDataUrl.split(",")[1]), (c) => c.charCodeAt(0));

      const jpegImage = await newPdf.embedJpg(jpegBytes);
      const newPage = newPdf.addPage([viewport.width, viewport.height]);
      newPage.drawImage(jpegImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });

      setProgress({ current: i, total: totalPages });
    }

    doc.destroy();
    const bytes = await newPdf.save({ useObjectStreams: true });
    return { bytes: new Uint8Array(bytes), method: "Converted pages to images" };
  };

  const compressBalanced = async (buf: ArrayBuffer): Promise<{ bytes: Uint8Array; method: string }> => {
    const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
    pdf.setTitle("");
    pdf.setAuthor("");
    pdf.setSubject("");
    pdf.setKeywords([]);
    pdf.setProducer("");
    pdf.setCreator("");
    const bytes = await pdf.save({ useObjectStreams: true });
    return { bytes: new Uint8Array(bytes), method: "Optimized structure" };
  };

  const compressLight = async (buf: ArrayBuffer): Promise<{ bytes: Uint8Array; method: string }> => {
    const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
    const bytes = await pdf.save({ useObjectStreams: true });
    return { bytes: new Uint8Array(bytes), method: "Optimized structure" };
  };

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError("");
    setProgress({ current: 0, total: 0 });
    try {
      const buf = await file.arrayBuffer();
      let output: { bytes: Uint8Array; method: string };

      if (preset === "maximum") {
        output = await compressMaximum(buf);
      } else if (preset === "balanced") {
        output = await compressBalanced(buf);
      } else {
        output = await compressLight(buf);
      }

      const blob = new Blob([output.bytes as BlobPart], { type: "application/pdf" });
      setResult({ original: file.size, compressed: output.bytes.length, method: output.method });
      downloadBlob(blob, `compressed_${file.name}`);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Compression failed");
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const pctNum = result && result.original > 0
    ? (1 - result.compressed / result.original) * 100
    : 0;
  const pct = result ? Math.abs(pctNum).toFixed(1) : null;

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-5">
          {/* File card */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{fmt(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setResult(null); setError(""); }}
              className="theme-text-muted  text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Compression preset selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Compression level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  disabled={loading}
                  className={`p-3 rounded-xl border text-left transition-colors
                    ${
                      preset === p.key
                        ? "bg-emerald-500/100 border-emerald-500 text-white"
                        : "theme-bg-secondary theme-border theme-text-secondary hover:border-emerald-300 hover:bg-emerald-500/10"
                    }`}
                >
                  <span className="block text-sm font-semibold">{p.name}</span>
                  <span className={`block text-xs mt-1 ${preset === p.key ? "text-emerald-100" : "theme-text-muted"}`}>
                    {p.description}
                  </span>
                  <span className={`block text-xs mt-1 font-medium ${preset === p.key ? "text-emerald-200" : "theme-text-dim"}`}>
                    {p.range}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar for Maximum mode */}
          {loading && preset === "maximum" && progress.total > 0 && (
            <ProgressBar
              current={progress.current}
              total={progress.total}
              status={`Compressing page ${progress.current} of ${progress.total}`}
              color="#10b981"
            />
          )}

          {/* Result */}
          {result && (
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-500/100 rounded-full flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="font-semibold text-emerald-700 text-sm">Compressed successfully!</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="theme-text-secondary">{fmt(result.original)}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <span className="font-semibold text-emerald-700">{fmt(result.compressed)}</span>
                <span className={`ml-auto font-semibold px-2.5 py-0.5 rounded-full text-xs ${pctNum >= 0 ? "text-emerald-600 bg-emerald-100" : "text-amber-600 bg-amber-100"}`}>
                  {pctNum >= 0 ? `${pct}% smaller` : `${pct}% larger (already optimized)`}
                </span>
              </div>
              <p className="text-xs theme-text-muted mt-2">{result.method}</p>
            </div>
          )}

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleCompress}
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500/100 hover:bg-emerald-600 theme-btn-disabled text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Compressing..." : "Compress PDF"}
          </button>
        </div>
      )}
    </div>
  );
}
