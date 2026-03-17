"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function CropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [unit, setUnit] = useState<"points" | "percent">("points");
  const [loading, setLoading] = useState(false);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    const buf = await f.arrayBuffer();
    const pdf = await PDFDocument.load(buf);
    setPageCount(pdf.getPageCount());
  };

  const handleCrop = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);

      for (let i = 0; i < pdf.getPageCount(); i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        let t = top, b = bottom, l = left, r = right;

        if (unit === "percent") {
          t = (top / 100) * height;
          b = (bottom / 100) * height;
          l = (left / 100) * width;
          r = (right / 100) * width;
        }

        page.setCropBox(l, b, width - l - r, height - t - b);
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cropped_${file.name}`;
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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f0fdfa" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
            <div className="flex gap-2">
              {(["points", "percent"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    unit === u ? "text-white" : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"
                  }`}
                  style={unit === u ? { backgroundColor: "#14b8a6", borderColor: "#14b8a6" } : {}}
                >
                  {u === "points" ? "Points (pt)" : "Percent (%)"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {([["Top", top, setTop], ["Bottom", bottom, setBottom], ["Left", left, setLeft], ["Right", right, setRight]] as const).map(([label, val, setter]) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <input
                  type="number"
                  value={val}
                  onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))}
                  min={0}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleCrop}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            style={!loading ? { backgroundColor: "#14b8a6" } : {}}
          >
            {loading ? "Cropping..." : "Crop & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
