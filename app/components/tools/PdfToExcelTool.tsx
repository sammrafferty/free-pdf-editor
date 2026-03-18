"use client";
import { useState } from "react";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

type ExtractionMode = "table" | "raw";

interface TextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
}

interface LineBoundaries {
  horizontalLines: number[]; // Y positions of horizontal lines
  verticalLines: number[];   // X positions of vertical lines
}

export default function PdfToExcelTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<ExtractionMode>("table");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string[][] | null>(null);
  const [previewIsHeader, setPreviewIsHeader] = useState(false);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setError("");
    setStatus("");
    setPreview(null);
    setPreviewIsHeader(false);
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
      const ti = item as { str: string; transform: number[]; width: number; height: number; fontName: string };
      if (!ti.str.trim()) continue;
      const fontSize = Math.abs(ti.transform[0]) || ti.height || 12;
      items.push({
        str: ti.str,
        x: ti.transform[4],
        y: ti.transform[5],
        width: ti.width || 0,
        height: fontSize,
        fontName: ti.fontName || "",
        fontSize,
      });
    }
    return items;
  };

  /** Compute the median of a numeric array. Returns fallback if array is empty. */
  const median = (values: number[], fallback: number): number => {
    if (values.length === 0) return fallback;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  /** Detect line-drawing operations (rectangles and moveTo+lineTo pairs) from the PDF operator list. */
  const detectLines = async (page: import("pdfjs-dist").PDFPageProxy): Promise<LineBoundaries> => {
    const horizontalLines: number[] = [];
    const verticalLines: number[] = [];

    try {
      const pdfjsLib = await import("pdfjs-dist");
      const OPS = pdfjsLib.OPS;
      const opList = await page.getOperatorList();
      const viewport = page.getViewport({ scale: 1 });
      const pageHeight = viewport.height;

      // Scan for rectangle operations: OPS.rectangle args are [x, y, width, height]
      for (let i = 0; i < opList.fnArray.length; i++) {
        if (opList.fnArray[i] === OPS.rectangle) {
          const args = opList.argsArray[i];
          if (args && args.length >= 4) {
            const [rx, ry, rw, rh] = args as number[];
            // Thin horizontal rectangle (line)
            if (Math.abs(rh) <= 3 && Math.abs(rw) > 10) {
              horizontalLines.push(pageHeight - ry);
            }
            // Thin vertical rectangle (line)
            if (Math.abs(rw) <= 3 && Math.abs(rh) > 10) {
              verticalLines.push(rx);
            }
          }
        }
      }

      // Scan for moveTo + lineTo pairs
      for (let i = 0; i < opList.fnArray.length - 1; i++) {
        if (opList.fnArray[i] === OPS.moveTo && opList.fnArray[i + 1] === OPS.lineTo) {
          const moveArgs = opList.argsArray[i] as number[];
          const lineArgs = opList.argsArray[i + 1] as number[];
          if (moveArgs && lineArgs && moveArgs.length >= 2 && lineArgs.length >= 2) {
            const [mx, my] = moveArgs;
            const [lx, ly] = lineArgs;
            // Horizontal line: same Y (within tolerance), different X
            if (Math.abs(my - ly) <= 2 && Math.abs(mx - lx) > 10) {
              horizontalLines.push(pageHeight - my);
            }
            // Vertical line: same X (within tolerance), different Y
            if (Math.abs(mx - lx) <= 2 && Math.abs(my - ly) > 10) {
              verticalLines.push(mx);
            }
          }
        }
      }
    } catch {
      // If operator list extraction fails, continue without lines
    }

    // Deduplicate lines within a small tolerance
    const dedup = (arr: number[], tol: number): number[] => {
      const sorted = [...arr].sort((a, b) => a - b);
      const result: number[] = [];
      for (const v of sorted) {
        if (result.length === 0 || v - result[result.length - 1] > tol) {
          result.push(v);
        }
      }
      return result;
    };

    return {
      horizontalLines: dedup(horizontalLines, 3),
      verticalLines: dedup(verticalLines, 3),
    };
  };

  /** Check if the first row is likely a header (bold or larger font). */
  const detectHeaderRow = (items: TextItem[], rows: TextItem[][]): boolean => {
    if (rows.length < 2) return false;
    const firstRow = rows[0];
    const restRows = rows.slice(1);

    // Check for bold font names in first row
    const firstRowBoldCount = firstRow.filter(
      (it) => /bold/i.test(it.fontName)
    ).length;
    const firstRowBoldRatio = firstRowBoldCount / firstRow.length;

    // Check if first row has a larger average font size
    const firstRowAvgSize =
      firstRow.reduce((s, it) => s + it.fontSize, 0) / firstRow.length;
    const restItems = restRows.flat();
    const restAvgSize = restItems.length > 0
      ? restItems.reduce((s, it) => s + it.fontSize, 0) / restItems.length
      : firstRowAvgSize;

    // Header if majority of first row is bold, or font size is notably larger
    return firstRowBoldRatio >= 0.5 || firstRowAvgSize > restAvgSize * 1.15;
  };

  const detectTable = (
    items: TextItem[],
    lines: LineBoundaries
  ): { data: string[][]; isHeader: boolean } => {
    if (items.length === 0) return { data: [], isHeader: false };

    // Compute adaptive tolerances from median font metrics
    const fontSizes = items.map((it) => it.fontSize);
    const charWidths = items
      .filter((it) => it.str.length > 0 && it.width > 0)
      .map((it) => it.width / it.str.length);

    const medFontSize = median(fontSizes, 12);
    const medCharWidth = median(charWidths, 6);

    // Adaptive Y-tolerance: half the median font size
    const yTolerance = medFontSize * 0.5;

    // Adaptive X-rounding factor based on median font size
    const xRoundFactor = Math.max(1, Math.round(medFontSize * 0.3));

    // Adaptive column merge threshold based on median character width
    const colMergeThreshold = Math.max(10, medCharWidth * 3);

    // --- Determine row boundaries ---
    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
    let rows: TextItem[][];

    if (lines.horizontalLines.length >= 2) {
      // Use detected horizontal lines as row boundaries
      const hLines = [...lines.horizontalLines].sort((a, b) => a - b);
      rows = [];
      for (let r = 0; r < hLines.length - 1; r++) {
        const yMin = hLines[r];
        const yMax = hLines[r + 1];
        const rowItems = sorted.filter(
          (it) => it.y >= yMin - yTolerance && it.y <= yMax + yTolerance
        );
        if (rowItems.length > 0) {
          rowItems.sort((a, b) => a.x - b.x);
          rows.push(rowItems);
        }
      }
      // Also include items above the first line and below the last line
      const aboveItems = sorted.filter(
        (it) => it.y > hLines[hLines.length - 1] + yTolerance
      );
      if (aboveItems.length > 0) {
        aboveItems.sort((a, b) => a.x - b.x);
        rows.unshift(aboveItems);
      }
      const belowItems = sorted.filter(
        (it) => it.y < hLines[0] - yTolerance
      );
      if (belowItems.length > 0) {
        belowItems.sort((a, b) => a.x - b.x);
        rows.push(belowItems);
      }

      // If line-based rows yield very few results, fall back to text clustering
      if (rows.length < 2) {
        rows = clusterRowsByY(sorted, yTolerance);
      }
    } else {
      rows = clusterRowsByY(sorted, yTolerance);
    }

    // --- Determine column boundaries ---
    let mergedCols: number[];

    if (lines.verticalLines.length >= 2) {
      // Use detected vertical lines as column boundaries
      mergedCols = [...lines.verticalLines].sort((a, b) => a - b);
    } else {
      // Cluster X positions to find columns
      const allX = items.map((it) => Math.round(it.x / xRoundFactor) * xRoundFactor);
      const xCounts: Record<number, number> = {};
      allX.forEach((x) => { xCounts[x] = (xCounts[x] || 0) + 1; });

      const colPositions = Object.entries(xCounts)
        .filter(([, c]) => c >= Math.min(2, rows.length * 0.3))
        .map(([x]) => Number(x))
        .sort((a, b) => a - b);

      mergedCols = [];
      for (const x of colPositions) {
        if (mergedCols.length === 0 || x - mergedCols[mergedCols.length - 1] > colMergeThreshold) {
          mergedCols.push(x);
        }
      }
    }

    if (mergedCols.length <= 1) {
      // No table structure detected, return text line by line
      const data = rows.map((row) => [row.map((it) => it.str).join(" ")]);
      return { data, isHeader: false };
    }

    // Map each row's items to columns
    const data = rows.map((row) => {
      const cells: string[] = new Array(mergedCols.length).fill("");
      for (const item of row) {
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

    const isHeader = detectHeaderRow(items, rows);

    return { data, isHeader };
  };

  /** Cluster text items into rows by Y position using adaptive tolerance. */
  const clusterRowsByY = (sorted: TextItem[], yTolerance: number): TextItem[][] => {
    if (sorted.length === 0) return [];
    const rows: TextItem[][] = [];
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
    return rows;
  };

  const extractRawText = (items: TextItem[]): string[][] => {
    if (items.length === 0) return [];

    // Compute adaptive Y-tolerance
    const fontSizes = items.map((it) => it.fontSize);
    const medFontSize = median(fontSizes, 12);
    const yTolerance = medFontSize * 0.5;

    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
    const rows: string[][] = [];
    let currentLine: string[] = [];
    let currentY = sorted[0].y;

    for (const item of sorted) {
      if (Math.abs(item.y - currentY) > yTolerance) {
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
    setPreview(null);
    setPreviewIsHeader(false);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const XLSX = await import("xlsx");

      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      const wb = XLSX.utils.book_new();
      let totalCells = 0;
      let firstPageData: string[][] | null = null;
      let firstPageIsHeader = false;

      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(i);
        setStatus(`Extracting page ${i} of ${doc.numPages}...`);
        const page = await doc.getPage(i);
        const items = await extractTextItems(page);

        let data: string[][];
        let isHeader = false;

        if (mode === "table") {
          const lines = await detectLines(page);
          const result = detectTable(items, lines);
          data = result.data;
          isHeader = result.isHeader;
        } else {
          data = extractRawText(items);
        }

        if (data.length === 0) {
          data = [["(No text found on this page)"]];
        }

        // Capture first page data for preview
        if (i === 1) {
          firstPageData = data;
          firstPageIsHeader = isHeader;
        }

        totalCells += data.reduce((s, r) => s + r.length, 0);
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Apply bold styling to header row if detected
        if (isHeader && data.length > 0) {
          for (let c = 0; c < data[0].length; c++) {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c });
            if (ws[cellRef]) {
              ws[cellRef].s = { font: { bold: true } };
            }
          }
        }

        XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
      }

      if (totalCells === 0) {
        setError("No text could be extracted from this PDF.");
        setLoading(false);
        return;
      }

      // Set preview data
      if (firstPageData) {
        setPreview(firstPageData.slice(0, 10));
        setPreviewIsHeader(firstPageIsHeader);
      }

      setStatus("Creating Excel file...");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + ".xlsx");

      setStatus(`Done! Extracted ${totalCells} cells across ${doc.numPages} sheet${doc.numPages > 1 ? "s" : ""}.`);
    } catch (e: unknown) {
      console.error("PDF to Excel error:", e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
  };

  const accentColor = "#16a34a";
  const bgTint = "var(--bg-tertiary)";

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} label="Drop a PDF here to extract data" />
      ) : (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bgTint }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} page{pageCount !== 1 ? "s" : ""} &middot; {(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setError(""); setStatus(""); setPreview(null); setPreviewIsHeader(false); }} className="theme-text-muted  text-sm font-medium">Remove</button>
          </div>

          {/* Mode selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Extraction Mode</label>
            <div className="flex gap-2">
              {([
                { key: "table" as ExtractionMode, label: "Table Detection", desc: "Smart grid analysis" },
                { key: "raw" as ExtractionMode, label: "Raw Text", desc: "All text line by line" },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setMode(opt.key)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    mode === opt.key ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:opacity-80"
                  }`}
                  style={mode === opt.key ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                >
                  <div>{opt.label}</div>
                  <div className={`text-xs mt-0.5 ${mode === opt.key ? "text-green-100" : "theme-text-muted"}`}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && (
            <div className="p-4 rounded-xl border theme-border" style={{ backgroundColor: bgTint }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: accentColor }}>{status}</span>
                <span className="text-xs theme-text-secondary">{progress} / {pageCount}</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ backgroundColor: accentColor, width: `${(progress / pageCount) * 100}%` }} />
              </div>
            </div>
          )}

          {!loading && status && !error && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
              <p className="text-sm text-green-700">{status}</p>
            </div>
          )}

          {/* Table preview */}
          {!loading && preview && preview.length > 0 && (
            <div className="rounded-xl border theme-border overflow-hidden">
              <div className="px-4 py-2 theme-bg-secondary border-b theme-border">
                <span className="text-xs font-medium theme-text-secondary">
                  Preview (page 1{preview.length >= 10 ? ", first 10 rows" : ""})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {preview.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? "theme-bg-primary" : "theme-bg-secondary"}>
                        {row.map((cell, ci) => {
                          const isHeaderCell = ri === 0 && previewIsHeader;
                          const Tag = isHeaderCell ? "th" : "td";
                          return (
                            <Tag
                              key={ci}
                              className={`px-3 py-1.5 border-b theme-border text-left ${
                                isHeaderCell ? "font-semibold theme-text" : "theme-text-secondary"
                              }`}
                            >
                              {cell || "\u00A0"}
                            </Tag>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 theme-bg-secondary border-t theme-border">
                <p className="text-xs theme-text-muted">
                  Preview looks wrong? Try Raw Text mode for general text extraction.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading ? { backgroundColor: accentColor } : {}}
          >
            {loading ? `Extracting page ${progress} of ${pageCount}...` : "Convert to Excel"}
          </button>

          <p className="text-xs theme-text-muted text-center leading-relaxed">
            Table Detection works best with structured data. Use Raw Text for general text extraction.
          </p>
        </div>
      )}
    </div>
  );
}
