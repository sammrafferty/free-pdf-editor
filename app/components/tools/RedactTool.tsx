"use client";
import { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
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

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    const buf = await f.arrayBuffer();
    const pdf = await PDFDocument.load(buf);
    setPageCount(pdf.getPageCount());
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
      const pdf = await PDFDocument.load(buf);

      for (const region of regions) {
        if (region.page < 1 || region.page > pageCount) continue;
        const page = pdf.getPage(region.page - 1);
        const { width, height } = page.getSize();

        page.drawRectangle({
          x: (region.x / 100) * width,
          y: ((100 - region.y - region.height) / 100) * height,
          width: (region.width / 100) * width,
          height: (region.height / 100) * height,
          color: rgb(0, 0, 0),
        });
      }

      const bytes = await pdf.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redacted_${file.name}`;
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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f8fafc" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Redaction regions (% of page)</label>
              <button onClick={addRegion} className="text-xs font-medium hover:text-slate-800" style={{ color: "#64748b" }}>+ Add region</button>
            </div>
            <div className="space-y-3">
              {regions.map((r, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Region {idx + 1}</span>
                    {regions.length > 1 && (
                      <button onClick={() => removeRegion(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {([["Page", "page", r.page], ["X %", "x", r.x], ["Y %", "y", r.y], ["W %", "width", r.width], ["H %", "height", r.height]] as [string, keyof RedactRegion, number][]).map(([label, field, val]) => (
                      <div key={field}>
                        <label className="block text-[10px] text-gray-400 mb-1">{label}</label>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => updateRegion(idx, field, Number(e.target.value))}
                          min={field === "page" ? 1 : 0}
                          max={field === "page" ? pageCount : 100}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRedact}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            style={!loading ? { backgroundColor: "#64748b" } : {}}
          >
            {loading ? "Redacting..." : "Redact & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
