"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (f: File[]) => setFiles(prev => [...prev, ...f]);
  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => {
    if (i === 0) return;
    setFiles(prev => { const a = [...prev]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; });
  };
  const moveDown = (i: number) => {
    setFiles(prev => { if (i >= prev.length - 1) return prev; const a = [...prev]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setLoading(true);
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const buf = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buf);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🔗 Merge PDFs</h2>
      <Dropzone onFiles={handleFiles} multiple label="Drop PDFs to add them" />

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-white/40 text-sm w-5 text-center">{i + 1}</span>
              <span className="flex-1 text-sm truncate">{f.name}</span>
              <div className="flex gap-1">
                <button onClick={() => moveUp(i)} className="text-white/40 hover:text-white px-1">↑</button>
                <button onClick={() => moveDown(i)} className="text-white/40 hover:text-white px-1">↓</button>
                <button onClick={() => removeFile(i)} className="text-red-400/60 hover:text-red-400 px-1">×</button>
              </div>
            </div>
          ))}

          <button
            onClick={handleMerge}
            disabled={loading || files.length < 2}
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 rounded-xl font-semibold transition"
          >
            {loading ? "Merging..." : `Merge ${files.length} PDFs`}
          </button>
        </div>
      )}
    </div>
  );
}
