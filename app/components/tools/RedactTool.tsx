"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "../Dropzone";

interface RedactRegion {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function RedactTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [regions, setRegions] = useState<RedactRegion[]>([{ page: 1, x: 10, y: 80, width: 30, height: 5 }]);
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

  const updateRegion = (idx: number, field: keyof RedactRegion, value: number) => {
    setRegions((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const addRegion = () => setRegions((prev) => [...prev, { page: 1, x: 10, y: 80, width: 30, height: 5 }]);
  const removeRegion = (idx: number) => setRegions((prev) => prev.filter((_, i) => i !== idx));

  const handleRedact = async () => {
    if (!file || regions.length === 0) return;
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();

      // Load with pdfjs-dist to render pages as images
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;

      // Determine which pages need redaction
      const redactedPageNums = new Set(regions.map((r) => r.page));

      // Create new PDF
      const newPdf = await PDFDocument.create();
      const origPdf = await PDFDocument.load(buf);

      for (let i = 0; i < doc.numPages; i++) {
        const pageNum = i + 1;

        if (redactedPageNums.has(pageNum)) {
          // Render this page to a canvas, draw black boxes, then embed as image
          const pdfPage = await doc.getPage(pageNum);
          const scale = 2; // 2x for quality
          const viewport = pdfPage.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await pdfPage.render({ canvasContext: ctx, viewport, canvas } as any).promise;

          // Draw black redaction rectangles on the rendered canvas
          // Regions use % coordinates: x/y from top-left, width/height as % of page
          const pageRegions = regions.filter((r) => r.page === pageNum);
          ctx.fillStyle = "#000000";
          for (const region of pageRegions) {
            const rx = (region.x / 100) * viewport.width;
            const ry = (region.y / 100) * viewport.height;
            const rw = (region.width / 100) * viewport.width;
            const rh = (region.height / 100) * viewport.height;
            ctx.fillRect(rx, ry, rw, rh);
          }

          // Convert canvas to JPEG and embed into new PDF
          const imgDataUrl = canvas.toDataURL("image/jpeg", 0.92);
          const imgBytes = Uint8Array.from(atob(imgDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
          const img = await newPdf.embedJpg(imgBytes);

          // Use original page dimensions (in points) for the new page
          const origPage = origPdf.getPage(i);
          const { width: origW, height: origH } = origPage.getSize();
          const page = newPdf.addPage([origW, origH]);
          page.drawImage(img, { x: 0, y: 0, width: origW, height: origH });
        } else {
          // Copy non-redacted pages as-is (preserves text, annotations, etc.)
          const [copied] = await newPdf.copyPages(origPdf, [i]);
          newPdf.addPage(copied);
        }
      }

      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redacted_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to redact PDF. Please try again.");
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
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} pages</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="theme-text-muted  text-sm font-medium">Remove</button>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-700">Redacted pages are flattened to images to ensure underlying text is permanently removed and cannot be recovered.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium theme-text-secondary">Redaction regions (% of page)</label>
              <button onClick={addRegion} className="text-xs font-medium hover:text-slate-800" style={{ color: "#64748b" }}>+ Add region</button>
            </div>
            <div className="space-y-3">
              {regions.map((r, idx) => (
                <div key={idx} className="p-3 theme-file-row rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium theme-text-secondary">Region {idx + 1}</span>
                    {regions.length > 1 && (
                      <button onClick={() => removeRegion(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {([["Page", "page", r.page], ["X %", "x", r.x], ["Y %", "y", r.y], ["W %", "width", r.width], ["H %", "height", r.height]] as [string, keyof RedactRegion, number][]).map(([label, field, val]) => (
                      <div key={field}>
                        <label className="block text-[10px] theme-text-muted mb-1">{label}</label>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => updateRegion(idx, field, Number(e.target.value))}
                          min={field === "page" ? 1 : 0}
                          max={field === "page" ? pageCount : 100}
                          className="w-full theme-input rounded-lg px-2 py-1.5 theme-text text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleRedact}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading ? { backgroundColor: "#64748b" } : {}}
          >
            {loading ? "Redacting..." : "Redact & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
