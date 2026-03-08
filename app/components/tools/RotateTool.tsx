"use client";
import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function RotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [pagesInput, setPagesInput] = useState("all");
  const [loading, setLoading] = useState(false);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    const buf = await f.arrayBuffer();
    const pdf = await PDFDocument.load(buf);
    setPageCount(pdf.getPageCount());
  };

  const parsePages = (input: string, max: number): number[] => {
    if (input.trim().toLowerCase() === "all") return Array.from({ length: max }, (_, i) => i);
    const pages: number[] = [];
    for (const part of input.split(",").map(s => s.trim())) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        for (let i = a; i <= Math.min(b, max); i++) pages.push(i - 1);
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= max) pages.push(n - 1);
      }
    }
    return [...new Set(pages)];
  };

  const handleRotate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const pagesToRotate = parsePages(pagesInput, pageCount);
      pagesToRotate.forEach(i => {
        const page = pdf.getPage(i);
        page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
      });
      const bytes = await pdf.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rotated_${file.name}`;
      a.click();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🔄 Rotate Pages</h2>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-white/50">{pageCount} pages</p>
            </div>
            <button onClick={() => setFile(null)} className="text-white/40 hover:text-white text-sm">Remove</button>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Pages (e.g. "all", "1-3", "1, 4, 7")</label>
            <input
              type="text"
              value={pagesInput}
              onChange={e => setPagesInput(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Rotation</label>
            <div className="flex gap-2">
              {([90, 180, 270] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRotation(r)}
                  className={`flex-1 py-2 rounded-lg border transition text-sm font-medium
                    ${rotation === r ? "bg-blue-600 border-blue-500" : "bg-white/5 border-white/10 hover:border-white/30"}`}
                >
                  {r}° {r === 90 ? "↻" : r === 180 ? "↔" : "↺"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRotate}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 rounded-xl font-semibold transition"
          >
            {loading ? "Rotating..." : "Rotate & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
