"use client";
import { useState } from "react";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

type OutputFormat = "png" | "jpeg" | "webp";

const FORMAT_OPTIONS: { value: OutputFormat; label: string; desc: string }[] = [
  { value: "png", label: "PNG", desc: "Lossless" },
  { value: "jpeg", label: "JPEG", desc: "Smaller files" },
  { value: "webp", label: "WebP", desc: "Best compression" },
];

const MIME_MAP: Record<OutputFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const EXT_MAP: Record<OutputFormat, string> = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfToImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState(0.85);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [totalSize, setTotalSize] = useState<number | null>(null);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setError("");
    setTotalSize(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const buf = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      setPageCount(doc.numPages);
    } catch (e) {
      console.error(e);
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setError("");
    setTotalSize(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const images: { name: string; blob: Blob }[] = [];
      const mime = MIME_MAP[format];
      const ext = EXT_MAP[format];

      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(i);
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill white background (PDFs can have transparent backgrounds)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error(`Failed to render page ${i}`));
            },
            mime,
            format !== "png" ? quality : undefined
          );
        });
        images.push({ name: `page_${i}.${ext}`, blob });
      }

      const total = images.reduce((sum, img) => sum + img.blob.size, 0);
      setTotalSize(total);

      if (images.length === 1) {
        // Single page: download directly
        downloadBlob(images[0].blob, images[0].name);
      } else {
        // Multiple pages: bundle into a ZIP using JSZip
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        for (const img of images) {
          zip.file(img.name, img.blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, file.name.replace(/\.pdf$/i, "") + "_pages.zip");
      }
    } catch (e) {
      console.error(e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
    setProgress(0);
  };

  const formatLabel = format.toUpperCase();

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} pages</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setError(""); setTotalSize(null); }} className="theme-text-muted  text-sm font-medium">Remove</button>
          </div>

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Output format</label>
            <div className="flex gap-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    format === opt.value ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:opacity-80"
                  }`}
                  style={format === opt.value ? { backgroundColor: "#f472b6", borderColor: "#f472b6" } : {}}
                >
                  <span className="block">{opt.label}</span>
                  <span className={`block text-xs mt-0.5 ${format === opt.value ? "text-white/80" : "theme-text-muted"}`}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {format !== "png" && (
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min={0.5}
                max={1.0}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-pink-400"
              />
              <div className="flex justify-between text-xs theme-text-muted mt-1">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Quality (scale factor)</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    scale === s ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:opacity-80"
                  }`}
                  style={scale === s ? { backgroundColor: "#f472b6", borderColor: "#f472b6" } : {}}
                >
                  {s === 1 ? "Standard" : s === 2 ? "High" : "Ultra"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && (
            <div className="p-4 rounded-xl border theme-border" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "#f472b6" }}>Converting...</span>
                <span className="text-xs theme-text-secondary">{progress} / {pageCount}</span>
              </div>
              <div className="w-full bg-pink-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ backgroundColor: "#f472b6", width: `${(progress / pageCount) * 100}%` }} />
              </div>
            </div>
          )}

          {totalSize !== null && !loading && (
            <div className="p-3 rounded-xl border theme-border" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              <p className="text-sm theme-text-secondary">
                Total size of exported images: <span className="font-semibold" style={{ color: "#f472b6" }}>{formatBytes(totalSize)}</span>
              </p>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading ? { backgroundColor: "#f472b6" } : {}}
          >
            {loading ? `Converting page ${progress}...` : `Convert to ${formatLabel}${pageCount > 1 ? ` (${pageCount} images as ZIP)` : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
