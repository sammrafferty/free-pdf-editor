"use client";
import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function NumberPagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<"bottom-center" | "bottom-right" | "bottom-left">("bottom-center");
  const [startNum, setStartNum] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [loading, setLoading] = useState(false);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    const buf = await f.arrayBuffer();
    const pdf = await PDFDocument.load(buf);
    setPageCount(pdf.getPageCount());
  };

  const handleNumber = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const font = await pdf.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < pdf.getPageCount(); i++) {
        const page = pdf.getPage(i);
        const { width } = page.getSize();
        const numText = String(startNum + i);
        const textWidth = font.widthOfTextAtSize(numText, fontSize);

        let x: number;
        if (position === "bottom-center") x = width / 2 - textWidth / 2;
        else if (position === "bottom-right") x = width - 50 - textWidth;
        else x = 50;

        page.drawText(numText, {
          x,
          y: 30,
          size: fontSize,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `numbered_${file.name}`;
      a.click();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#eef2ff" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                <p className="text-xs text-gray-400">{pageCount} pages</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600 text-sm font-medium">Remove</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <div className="flex gap-2">
              {([["bottom-left", "Bottom Left"], ["bottom-center", "Bottom Center"], ["bottom-right", "Bottom Right"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setPosition(val)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    position === val ? "text-white" : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300"
                  }`}
                  style={position === val ? { backgroundColor: "#6366f1", borderColor: "#6366f1" } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Starting number</label>
              <input type="number" value={startNum} onChange={(e) => setStartNum(Number(e.target.value))} min={0} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font size</label>
              <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} min={8} max={36} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
            </div>
          </div>

          <button
            onClick={handleNumber}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            style={!loading ? { backgroundColor: "#6366f1" } : {}}
          >
            {loading ? "Adding numbers..." : "Add Page Numbers & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
