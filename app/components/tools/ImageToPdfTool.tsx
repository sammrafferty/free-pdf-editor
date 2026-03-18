"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function ImageToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = (f: File[]) => {
    setFiles((prev) => [...prev, ...f]);
    setError("");
  };
  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => {
    if (i === 0) return;
    setFiles((prev) => {
      const a = [...prev];
      [a[i - 1], a[i]] = [a[i], a[i - 1]];
      return a;
    });
  };
  const moveDown = (i: number) => {
    setFiles((prev) => {
      if (i >= prev.length - 1) return prev;
      const a = [...prev];
      [a[i], a[i + 1]] = [a[i + 1], a[i]];
      return a;
    });
  };

  const fmt = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  /**
   * Convert any image to PNG bytes via canvas.
   * This handles WebP, BMP, and other formats that pdf-lib can't embed directly.
   */
  const convertToPng = async (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Canvas toBlob failed"));
            blob.arrayBuffer().then((ab) => resolve(new Uint8Array(ab)));
          },
          "image/png"
        );
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const pdf = await PDFDocument.create();

      for (const file of files) {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        const type = file.type;

        let img;
        if (type === "image/png") {
          img = await pdf.embedPng(bytes);
        } else if (type === "image/jpeg") {
          img = await pdf.embedJpg(bytes);
        } else {
          // WebP, BMP, or other formats — convert to PNG via canvas
          const pngBytes = await convertToPng(file);
          img = await pdf.embedPng(pngBytes);
        }

        const page = pdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images_to_pdf.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
  };

  return (
    <div>
      <Dropzone
        onFiles={handleFiles}
        multiple
        label="Drop images here (JPG, PNG, WebP)"
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
      />

      {files.length > 0 && (
        <div className="mt-5 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 theme-file-row rounded-xl">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <span className="text-xs font-bold" style={{ color: "#f97316" }}>{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium theme-text truncate">{f.name}</p>
                <p className="text-xs theme-text-muted">{fmt(f.size)}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => moveUp(i)} className="w-7 h-7 flex items-center justify-center rounded-md theme-text-muted  hover:opacity-80">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                </button>
                <button onClick={() => moveDown(i)} className="w-7 h-7 flex items-center justify-center rounded-md theme-text-muted  hover:opacity-80">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <button onClick={() => removeFile(i)} className="w-7 h-7 flex items-center justify-center rounded-md theme-text-muted hover:text-red-500 hover:bg-red-500/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            </div>
          ))}

          {error && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={loading || files.length === 0}
            className="w-full py-3.5 mt-3 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading && files.length > 0 ? { backgroundColor: "#f97316" } : {}}
          >
            {loading ? "Converting..." : `Convert ${files.length} Image${files.length !== 1 ? "s" : ""} to PDF`}
          </button>
        </div>
      )}
    </div>
  );
}
