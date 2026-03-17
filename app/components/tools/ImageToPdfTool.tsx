"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function ImageToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (f: File[]) => setFiles((prev) => [...prev, ...f]);
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

  const handleConvert = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const pdf = await PDFDocument.create();

      for (const file of files) {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        const type = file.type;

        let img;
        if (type === "image/png") {
          img = await pdf.embedPng(bytes);
        } else {
          img = await pdf.embedJpg(bytes);
        }

        const page = pdf.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images_to_pdf.pdf";
      a.click();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div>
      <Dropzone
        onFiles={handleFiles}
        multiple
        label="Drop images here (JPG, PNG)"
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
      />

      {files.length > 0 && (
        <div className="mt-5 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#fff7ed" }}>
                <span className="text-xs font-bold" style={{ color: "#f97316" }}>{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                <p className="text-xs text-gray-400">{fmt(f.size)}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => moveUp(i)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                </button>
                <button onClick={() => moveDown(i)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <button onClick={() => removeFile(i)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleConvert}
            disabled={loading || files.length === 0}
            className="w-full py-3.5 mt-3 text-white rounded-xl font-semibold text-sm transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            style={!loading && files.length > 0 ? { backgroundColor: "#f97316" } : {}}
          >
            {loading ? "Converting..." : `Convert ${files.length} Image${files.length !== 1 ? "s" : ""} to PDF`}
          </button>
        </div>
      )}
    </div>
  );
}
