"use client";
import { useState } from "react";
import Dropzone from "../Dropzone";

type ExtractionMode = "table" | "raw";

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PdfToExcelTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<ExtractionMode>("table");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setError("");
    setStatus("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const buf = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      setPageCount(doc.numPages);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("password") || msg.includes("encrypted")) {
        setError("This PDF is password-protected.");
      } else {
        setError("Could not read this PDF. It may be corrupted.");
      }
      setFile(null);
    }
  };

  const extractTextItems = async (page: import("pdfjs-dist").PDFPageProxy): Promise<TextItem[]> => {
    const textContent = await page.getTextContent();
    const items: TextItem[] = [];
    for (const item of textContent.items) {
      if (!("str" in item)) continue;
      const ti = item as { str: string; transform: number[]; width: number; height: number };
      if (!ti.str.trim()) continue;
      items.push({
        str: ti.str,
        x: ti.transform[4],
        y: ti.transform[5],
        width: ti.width || 0,
        height: Math.abs(ti.transform[0]) || ti.height || 12,
      });
    }
    return items;
  };

  const detectTable = (items: TextItem[]): string[][] => {
    if (items.length === 0) return [];

    // Group items by Y position (rows)
    const yTolerance = 3;
    const rows: TextItem[][] = [];
    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);

    let currentRow: TextItem[] = [sorted[0]];
    let currentY = sorted[0].y;

    for (let i = 1; i < sorted.length; i++) {
      if (Math.abs(sorted[i].y - currentY) <= yTolerance) {
        currentRow.push(sorted[i]);
      } else {
        currentRow.sort((a, b) => a.x - b.x);
        rows.push(currentRow);
        currentRow = [sorted[i]];
        currentY = sorted[i].y;
      }
    }
    currentRow.sort((a, b) => a.x - b.x);
    rows.push(currentRow);

    // Find column boundaries by clustering X positions
    const allX = items.map((it) => Math.round(it.x / 5) * 5);
    const xCounts: Record<number, number> = {};
    allX.forEach((x) => { xCounts[x] = (xCounts[x] || 0) + 1; });

    // Get distinct column positions (those with at least 2 items)
    const colPositions = Object.entries(xCounts)
      .filter(([, c]) => c >= Math.min(2, rows.length * 0.3))
      .map(([x]) => Number(x))
      .sort((a, b) => a - b);

    // Merge close columns
    const mergedCols: number[] = [];
    for (const x of colPositions) {
      if (mergedCols.length === 0 || x - mergedCols[mergedCols.length - 1] > 30) {
        mergedCols.push(x);
      }
    }

    if (mergedCols.length <= 1) {
      // No table structure detected, just return text line by line
      return rows.map((row) => [row.map((it) => it.str).join(" ")]);
    }

    // Map each row's items to columns
    return rows.map((row) => {
      const cells: string[] = new Array(mergedCols.length).fill("");
      for (const item of row) {
        // Find nearest column
        let colIdx = 0;
        let minDist = Infinity;
        for (let c = 0; c < mergedCols.length; c++) {
          const dist = Math.abs(item.x - mergedCols[c]);
          if (dist < minDist) {
            minDist = dist;
            colIdx = c;
          }
        }
        cells[colIdx] = cells[colIdx] ? cells[colIdx] + " " + item.str : item.str;
      }
      return cells;
    });
  };

  const extractRawText = (items: TextItem[]): string[][] => {
    if (items.length === 0) return [];
    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
    const rows: string[][] = [];
    let currentLine: string[] = [];
    let currentY = sorted[0].y;

    for (const item of sorted) {
      if (Math.abs(item.y - currentY) > 3) {
        if (currentLine.length > 0) rows.push([currentLine.join(" ")]);
        currentLine = [item.str];
        currentY = item.y;
      } else {
        currentLine.push(item.str);
      }
    }
    if (currentLine.length > 0) rows.push([currentLine.join(" ")]);
    return rows;
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setStatus("Loading PDF...");
    setError("");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const XLSX = await import("xlsx");

      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      const wb = XLSX.utils.book_new();
      let totalCells = 0;

      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(i);
        setStatus(`Extracting page ${i} of ${doc.numPages}...`);
        const page = await doc.getPage(i);
        const items = await extractTextItems(page);

        let data: string[][];
        if (mode === "table") {
          data = detectTable(items);
        } else {
          data = extractRawText(items);
        }

        if (data.length === 0) {
          data = [["(No text found on this page)"]];
        }

        totalCells += data.reduce((s, r) => s + r.length, 0);
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
      }

      if (totalCells === 0) {
        setError("No text could be extracted from this PDF.");
        setLoading(false);
        return;
      }

      setStatus("Creating Excel file...");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + ".xlsx";
      a.click();
      URL.revokeObjectURL(url);

      setStatus(`Done! Extracted ${totalCells} cells across ${doc.numPages} sheet${doc.numPages > 1 ? "s" : ""}.`);
    } catch (e: unknown) {
      console.error("PDF to Excel error:", e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
  };

  const accentColor = "#16a34a";
  const bgTint = "#f0fdf4";

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} label="Drop a PDF here to extract data" />
      ) : (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bgTint }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                <p className="text-xs text-gray-400">{pageCount} page{pageCount !== 1 ? "s" : ""} &middot; {(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setError(""); setStatus(""); }} className="text-gray-400 hover:text-gray-600 text-sm font-medium">Remove</button>
          </div>

          {/* Mode selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Extraction Mode</label>
            <div className="flex gap-2">
              {([
                { key: "table" as ExtractionMode, label: "Table Detection", desc: "Smart grid analysis" },
                { key: "raw" as ExtractionMode, label: "Raw Text", desc: "All text line by line" },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setMode(opt.key)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    mode === opt.key ? "text-white" : "bg-white border-gray-200 text-gray-600 hover:border-green-300"
                  }`}
                  style={mode === opt.key ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                >
                  <div>{opt.label}</div>
                  <div className={`text-xs mt-0.5 ${mode === opt.key ? "text-green-100" : "text-gray-400"}`}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && (
            <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: bgTint }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: accentColor }}>{status}</span>
                <span className="text-xs text-gray-500">{progress} / {pageCount}</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ backgroundColor: accentColor, width: `${(progress / pageCount) * 100}%` }} />
              </div>
            </div>
          )}

          {!loading && status && !error && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50">
              <p className="text-sm text-green-700">{status}</p>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            style={!loading ? { backgroundColor: accentColor } : {}}
          >
            {loading ? `Extracting page ${progress} of ${pageCount}...` : "Convert to Excel"}
          </button>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Table Detection works best with structured data. Use Raw Text for general text extraction.
          </p>
        </div>
      )}
    </div>
  );
}
