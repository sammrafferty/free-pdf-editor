"use client";
import { useState } from "react";
import Dropzone from "../Dropzone";

export default function PdfToImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(2);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    // Use pdfjs to get page count
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const buf = await f.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buf }).promise;
    setPageCount(doc.numPages);
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const images: { name: string; blob: Blob }[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(i);
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport, canvas } as never).promise;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png");
        });
        images.push({ name: `page_${i}.png`, blob });
      }

      if (images.length === 1) {
        const url = URL.createObjectURL(images[0].blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = images[0].name;
        a.click();
      } else {
        // Download as individual files (ZIP requires extra lib, keep it simple)
        for (const img of images) {
          const url = URL.createObjectURL(img.blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = img.name;
          a.click();
          // Small delay to prevent browser blocking multiple downloads
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setProgress(0);
  };

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#fdf2f8" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                <p className="text-xs text-gray-400">{pageCount} pages</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); }} className="text-gray-400 hover:text-gray-600 text-sm font-medium">Remove</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality (scale factor)</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    scale === s ? "text-white" : "bg-white border-gray-200 text-gray-600 hover:border-pink-300"
                  }`}
                  style={scale === s ? { backgroundColor: "#ec4899", borderColor: "#ec4899" } : {}}
                >
                  {s === 1 ? "Standard" : s === 2 ? "High" : "Ultra"}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: "#fdf2f8" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "#ec4899" }}>Converting...</span>
                <span className="text-xs text-gray-500">{progress} / {pageCount}</span>
              </div>
              <div className="w-full bg-pink-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ backgroundColor: "#ec4899", width: `${(progress / pageCount) * 100}%` }} />
              </div>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            style={!loading ? { backgroundColor: "#ec4899" } : {}}
          >
            {loading ? `Converting page ${progress}...` : `Convert to PNG${pageCount > 1 ? ` (${pageCount} images)` : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
