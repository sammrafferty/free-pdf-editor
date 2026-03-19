"use client";
import { useState } from "react";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

type ExtractionMode = "smart" | "table" | "raw";

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

interface PageTableData {
  data: string[][];
  isHeader: boolean;
  columnPositions: number[];
  pageIndex: number;
  regionIndex?: number;
}

/** Parsed cell with type information for Excel output */
interface TypedCell {
  value: string | number;
  type: "s" | "n";
  format?: string;
}

export default function PdfToExcelTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<ExtractionMode>("smart");
  const [mergePages, setMergePages] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string[][] | null>(null);
  const [previewIsHeader, setPreviewIsHeader] = useState(false);

  const handleFile = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFile(f);
    setError("");
    setStatus("");
    setProgress(0);
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

  /** Detect line-drawing operations (rectangles, moveTo+lineTo, and constructPath) from the PDF operator list. */
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

        // Handle constructPath operations (ops array + coordinates array)
        if (opList.fnArray[i] === OPS.constructPath) {
          const args = opList.argsArray[i];
          if (args && args.length >= 2) {
            const ops = args[0] as number[];
            const coords = args[1] as number[];
            let idx = 0;
            for (let j = 0; j < ops.length; j++) {
              const op = ops[j];
              if (op === OPS.rectangle && idx + 3 < coords.length) {
                const rx = coords[idx];
                const ry = coords[idx + 1];
                const rw = coords[idx + 2];
                const rh = coords[idx + 3];
                if (Math.abs(rh) <= 3 && Math.abs(rw) > 10) {
                  horizontalLines.push(pageHeight - ry);
                }
                if (Math.abs(rw) <= 3 && Math.abs(rh) > 10) {
                  verticalLines.push(rx);
                }
                idx += 4;
              } else if (op === OPS.moveTo || op === OPS.lineTo) {
                idx += 2;
              } else if (op === OPS.curveTo) {
                idx += 6;
              } else if ((op as number) === 16 || (op as number) === 17) {
                // curveTo2 / curveTo3
                idx += 4;
              } else if (op === OPS.closePath) {
                // no coordinates consumed
              } else {
                idx += 2; // fallback
              }
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
            if (Math.abs(my - ly) <= 2 && Math.abs(mx - lx) > 10) {
              horizontalLines.push(pageHeight - my);
            }
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
  const detectHeaderRow = (rows: TextItem[][]): boolean => {
    if (rows.length < 2) return false;
    const firstRow = rows[0];
    const restRows = rows.slice(1);

    const firstRowBoldCount = firstRow.filter(
      (it) => /bold/i.test(it.fontName)
    ).length;
    const firstRowBoldRatio = firstRowBoldCount / firstRow.length;

    const firstRowAvgSize =
      firstRow.reduce((s, it) => s + it.fontSize, 0) / firstRow.length;
    const restItems = restRows.flat();
    const restAvgSize = restItems.length > 0
      ? restItems.reduce((s, it) => s + it.fontSize, 0) / restItems.length
      : firstRowAvgSize;

    return firstRowBoldRatio >= 0.5 || firstRowAvgSize > restAvgSize * 1.15;
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

  /**
   * Enhanced row grouping: handle multi-line cells by merging rows whose
   * Y positions are within a fraction of font size AND share similar X alignment.
   */
  const clusterRowsWithMultiline = (sorted: TextItem[], yTolerance: number, medFontSize: number): TextItem[][] => {
    const rawRows = clusterRowsByY(sorted, yTolerance);
    if (rawRows.length <= 1) return rawRows;

    // Merge consecutive rows that are very close (within 0.3 * font size beyond normal tolerance)
    // AND have overlapping X ranges (multi-line cell content)
    const merged: TextItem[][] = [rawRows[0]];
    const multilineTol = medFontSize * 1.2;

    for (let i = 1; i < rawRows.length; i++) {
      const prevRow = merged[merged.length - 1];
      const currRow = rawRows[i];

      const prevAvgY = prevRow.reduce((s, it) => s + it.y, 0) / prevRow.length;
      const currAvgY = currRow.reduce((s, it) => s + it.y, 0) / currRow.length;
      const yDiff = Math.abs(prevAvgY - currAvgY);

      if (yDiff <= multilineTol && yDiff > yTolerance) {
        // Check X overlap: if current row items fall within X range of previous row columns
        const prevMinX = Math.min(...prevRow.map(it => it.x));
        const prevMaxX = Math.max(...prevRow.map(it => it.x + it.width));
        const currMinX = Math.min(...currRow.map(it => it.x));
        const currMaxX = Math.max(...currRow.map(it => it.x + it.width));

        const overlapExists = currMinX < prevMaxX && currMaxX > prevMinX;
        // Only merge if current row has fewer items (likely continuation text)
        if (overlapExists && currRow.length <= prevRow.length) {
          merged[merged.length - 1] = [...prevRow, ...currRow];
          merged[merged.length - 1].sort((a, b) => a.x - b.x);
          continue;
        }
      }
      merged.push(currRow);
    }

    return merged;
  };

  /**
   * Split page items into separate table regions when multiple distinct tables
   * exist on the same page (e.g., a summary table at top and detail table at bottom).
   */
  const splitIntoTableRegions = (items: TextItem[], pageHeight: number): TextItem[][] => {
    if (items.length === 0) return [];

    const fontSizes = items.map((it) => it.fontSize);
    const medFontSize = median(fontSizes, 12);
    const yTolerance = medFontSize * 0.5;

    // Step 1: Group items into rows by Y position
    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
    const rows = clusterRowsByY(sorted, yTolerance);
    if (rows.length <= 1) return [items];

    // Step 2: Compute average Y per row and sort rows top-to-bottom (descending Y in PDF coords)
    const rowMeta = rows.map((row) => {
      const avgY = row.reduce((s, it) => s + it.y, 0) / row.length;
      return { items: row, avgY };
    });
    // Already sorted top-to-bottom because we sorted by descending Y

    // Step 3: Compute line spacings between consecutive rows
    const spacings: number[] = [];
    for (let i = 1; i < rowMeta.length; i++) {
      const gap = Math.abs(rowMeta[i - 1].avgY - rowMeta[i].avgY);
      if (gap > 0) spacings.push(gap);
    }
    const medSpacing = median(spacings, medFontSize * 1.5);

    // Step 4: Compute page width range for title detection
    const allMinX = Math.min(...items.map((it) => it.x));
    const allMaxX = Math.max(...items.map((it) => it.x + it.width));
    const pageWidth = allMaxX - allMinX;

    // Step 5: Identify separator indices (between row i-1 and row i)
    const separatorIndices: number[] = [];
    for (let i = 1; i < rowMeta.length; i++) {
      const gap = Math.abs(rowMeta[i - 1].avgY - rowMeta[i].avgY);

      // Large Y-gap: > 3x median line spacing
      if (gap > medSpacing * 3) {
        separatorIndices.push(i);
        continue;
      }

      // Full-width single-item row that looks like a title/header
      const prevRow = rowMeta[i - 1].items;
      if (prevRow.length === 1) {
        const item = prevRow[0];
        const itemWidth = item.width || 0;
        const avgFontSizeOfRest = items
          .filter((it) => it !== item)
          .reduce((s, it) => s + it.fontSize, 0) / Math.max(1, items.length - 1);
        if (itemWidth > pageWidth * 0.6 && item.fontSize > avgFontSizeOfRest * 1.2) {
          separatorIndices.push(i);
        }
      }
    }

    if (separatorIndices.length === 0) return [items];

    // Step 6: Split rows into regions at separator indices
    const regions: TextItem[][] = [];
    let startIdx = 0;
    for (const sepIdx of separatorIndices) {
      const regionItems = rowMeta.slice(startIdx, sepIdx).flatMap((rm) => rm.items);
      if (regionItems.length > 0) regions.push(regionItems);
      startIdx = sepIdx;
    }
    // Remaining rows
    const lastRegion = rowMeta.slice(startIdx).flatMap((rm) => rm.items);
    if (lastRegion.length > 0) regions.push(lastRegion);

    return regions;
  };

  /**
   * SMART (whitespace-based) column detection — the core new algorithm.
   * Inspired by Camelot's Stream mode and Tabula's stream extraction.
   *
   * Algorithm:
   * 1. Group text items into rows by Y position
   * 2. For each row, compute gaps between consecutive items (sorted by X)
   * 3. Build a frequency map of gap X-positions across all rows
   * 4. X-ranges that are gaps in >50% of rows = column separators
   * 5. Use these separators to assign items to columns
   */
  const detectTableSmart = (
    items: TextItem[]
  ): { data: string[][]; isHeader: boolean; columnPositions: number[] } => {
    if (items.length === 0) return { data: [], isHeader: false, columnPositions: [] };

    const fontSizes = items.map((it) => it.fontSize);
    const charWidths = items
      .filter((it) => it.str.length > 0 && it.width > 0)
      .map((it) => it.width / it.str.length);

    const medFontSize = median(fontSizes, 12);
    const medCharWidth = median(charWidths, 6);
    const yTolerance = medFontSize * 0.5;

    // Step 1: Group into rows
    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
    const rows = clusterRowsWithMultiline(sorted, yTolerance, medFontSize);

    if (rows.length < 2) {
      const data = rows.map((row) => [row.map((it) => it.str).join(" ")]);
      return { data, isHeader: false, columnPositions: [] };
    }

    // Step 2: For each row, compute gaps between consecutive items
    // A "gap" is defined as the space between the right edge of one item and the left edge of the next
    const minGapWidth = medCharWidth * 1.5; // Minimum gap to be considered a column separator

    interface GapInfo {
      midX: number;      // Midpoint X of the gap
      leftEdge: number;  // Right edge of left item
      rightEdge: number; // Left edge of right item
    }

    const allGaps: GapInfo[][] = [];

    for (const row of rows) {
      const sortedRow = [...row].sort((a, b) => a.x - b.x);
      const rowGaps: GapInfo[] = [];
      for (let i = 0; i < sortedRow.length - 1; i++) {
        const rightEdgeOfLeft = sortedRow[i].x + sortedRow[i].width;
        const leftEdgeOfRight = sortedRow[i + 1].x;
        const gapWidth = leftEdgeOfRight - rightEdgeOfLeft;

        if (gapWidth > minGapWidth) {
          rowGaps.push({
            midX: (rightEdgeOfLeft + leftEdgeOfRight) / 2,
            leftEdge: rightEdgeOfLeft,
            rightEdge: leftEdgeOfRight,
          });
        }
      }
      allGaps.push(rowGaps);
    }

    // Step 3: Build gap frequency map — cluster gap midpoints
    // Use a tolerance-based clustering to group nearby gap positions
    const allGapMidpoints: number[] = allGaps.flatMap(g => g.map(gi => gi.midX));
    if (allGapMidpoints.length === 0) {
      // No gaps found — all text is continuous, return as single column
      const data = rows.map((row) => [row.map((it) => it.str).join(" ")]);
      return { data, isHeader: false, columnPositions: [] };
    }

    const gapClusterTol = medCharWidth * 2;
    const sortedGaps = [...allGapMidpoints].sort((a, b) => a - b);

    // Cluster gap positions
    const gapClusters: { center: number; count: number; positions: number[] }[] = [];
    for (const gx of sortedGaps) {
      let found = false;
      for (const cluster of gapClusters) {
        if (Math.abs(gx - cluster.center) <= gapClusterTol) {
          cluster.positions.push(gx);
          cluster.center = cluster.positions.reduce((a, b) => a + b, 0) / cluster.positions.length;
          cluster.count++;
          found = true;
          break;
        }
      }
      if (!found) {
        gapClusters.push({ center: gx, count: 1, positions: [gx] });
      }
    }

    // Step 4: Filter clusters that appear in >40% of rows (relaxed from 50% for better detection)
    const threshold = Math.max(2, rows.length * 0.4);
    const significantGaps = gapClusters
      .filter(c => c.count >= threshold)
      .map(c => c.center)
      .sort((a, b) => a - b);

    if (significantGaps.length === 0) {
      // No consistent column separators found
      const data = rows.map((row) => [row.map((it) => it.str).join(" ")]);
      return { data, isHeader: false, columnPositions: [] };
    }

    // Step 5: Define column boundaries using gap positions as separators
    // Column boundaries: [-Inf, gap1, gap2, ..., +Inf]
    const boundaries = [-Infinity, ...significantGaps, Infinity];
    const numCols = boundaries.length - 1;

    // Compute column center positions for reference
    const columnPositions: number[] = [];
    for (let c = 0; c < numCols; c++) {
      const left = boundaries[c] === -Infinity ? (items.length > 0 ? Math.min(...items.map(it => it.x)) : 0) : boundaries[c];
      const right = boundaries[c + 1] === Infinity ? (items.length > 0 ? Math.max(...items.map(it => it.x + it.width)) : 1000) : boundaries[c + 1];
      columnPositions.push((left + right) / 2);
    }

    // Step 6: Assign items to columns
    const data = rows.map((row) => {
      const cells: string[] = new Array(numCols).fill("");
      for (const item of row) {
        const itemCenter = item.x + item.width / 2;
        // Find which column this item belongs to
        let colIdx = 0;
        for (let c = 0; c < numCols; c++) {
          if (itemCenter > boundaries[c] && itemCenter <= boundaries[c + 1]) {
            colIdx = c;
            break;
          }
        }
        cells[colIdx] = cells[colIdx] ? cells[colIdx] + " " + item.str : item.str;
      }
      return cells;
    });

    const isHeader = detectHeaderRow(rows);

    return { data, isHeader, columnPositions };
  };

  /** Original grid-line-based table detection (used as "Table" mode) */
  const detectTable = (
    items: TextItem[],
    lines: LineBoundaries
  ): { data: string[][]; isHeader: boolean; columnPositions: number[] } => {
    if (items.length === 0) return { data: [], isHeader: false, columnPositions: [] };

    const fontSizes = items.map((it) => it.fontSize);
    const charWidths = items
      .filter((it) => it.str.length > 0 && it.width > 0)
      .map((it) => it.width / it.str.length);

    const medFontSize = median(fontSizes, 12);
    const medCharWidth = median(charWidths, 6);
    const yTolerance = medFontSize * 0.5;
    const xRoundFactor = Math.max(1, Math.round(medFontSize * 0.3));
    const colMergeThreshold = Math.max(10, medCharWidth * 3);

    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
    let rows: TextItem[][];

    if (lines.horizontalLines.length >= 2) {
      const hLines = [...lines.horizontalLines].sort((a, b) => a - b);
      rows = [];
      const boundaries: number[] = [];
      boundaries.push(-Infinity);
      for (let r = 0; r < hLines.length - 1; r++) {
        boundaries.push((hLines[r] + hLines[r + 1]) / 2);
      }
      boundaries.push(Infinity);

      for (let r = 0; r < boundaries.length - 1; r++) {
        const yMin = boundaries[r];
        const yMax = boundaries[r + 1];
        const rowItems = sorted.filter(
          (it) => it.y > yMin && it.y <= yMax
        );
        if (rowItems.length > 0) {
          rowItems.sort((a, b) => a.x - b.x);
          rows.push(rowItems);
        }
      }

      if (rows.length < 2) {
        rows = clusterRowsByY(sorted, yTolerance);
      }
    } else {
      rows = clusterRowsByY(sorted, yTolerance);
    }

    let mergedCols: number[];

    if (lines.verticalLines.length >= 2) {
      mergedCols = [...lines.verticalLines].sort((a, b) => a - b);
    } else {
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
      const data = rows.map((row) => [row.map((it) => it.str).join(" ")]);
      return { data, isHeader: false, columnPositions: mergedCols };
    }

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

    const isHeader = detectHeaderRow(rows);

    return { data, isHeader, columnPositions: mergedCols };
  };

  const extractRawText = (items: TextItem[]): string[][] => {
    if (items.length === 0) return [];

    const fontSizes = items.map((it) => it.fontSize);
    const medFontSize = median(fontSizes, 12);
    const yTolerance = medFontSize * 0.5;

    const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
    const rows: string[][] = [];
    let currentLine: string[] = [sorted[0].str];
    let currentY = sorted[0].y;

    for (let i = 1; i < sorted.length; i++) {
      const item = sorted[i];
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

  // ==================== CELL TYPE INFERENCE ====================

  /** Try to parse a cell string into a typed cell (number, percentage, currency, date, or string). */
  const inferCellType = (text: string): TypedCell => {
    const trimmed = text.trim();
    if (!trimmed) return { value: "", type: "s" };

    // Percentage: "45.2%", "100%", "-3.5%"
    const pctMatch = trimmed.match(/^([+-]?\d[\d,]*\.?\d*)\s*%$/);
    if (pctMatch) {
      const num = parseFloat(pctMatch[1].replace(/,/g, ""));
      if (!isNaN(num)) {
        return { value: num / 100, type: "n", format: "0.00%" };
      }
    }

    // Currency: "$1,234.56", "€50", "£1,000.00", "-$500"
    const currencyMatch = trimmed.match(/^([+-])?\s*([$$€£¥₹])\s*([+-])?\s*([\d,]+\.?\d*)$/);
    if (currencyMatch) {
      const sign = currencyMatch[1] || currencyMatch[3] || "";
      const symbol = currencyMatch[2];
      const numStr = sign + currencyMatch[4].replace(/,/g, "");
      const num = parseFloat(numStr);
      if (!isNaN(num)) {
        const symbolMap: Record<string, string> = {
          "$": '"$"#,##0.00',
          "\u20AC": '"\u20AC"#,##0.00',  // €
          "\u00A3": '"\u00A3"#,##0.00',  // £
          "\u00A5": '"\u00A5"#,##0',     // ¥
          "\u20B9": '"\u20B9"#,##0.00',  // ₹
        };
        return { value: num, type: "n", format: symbolMap[symbol] || '"$"#,##0.00' };
      }
    }

    // Parenthesized negative: "(1,234.56)" or "($1,234.56)"
    const parenMatch = trimmed.match(/^\(([$$€£¥₹])?\s*([\d,]+\.?\d*)\)$/);
    if (parenMatch) {
      const num = -parseFloat(parenMatch[2].replace(/,/g, ""));
      if (!isNaN(num)) {
        const symbol = parenMatch[1] || "$";
        return { value: num, type: "n", format: `"${symbol}"#,##0.00_);("${symbol}"#,##0.00)` };
      }
    }

    // Date detection: common formats
    // MM/DD/YYYY or DD/MM/YYYY
    const dateSlash = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
    if (dateSlash) {
      const a = parseInt(dateSlash[1]);
      const b = parseInt(dateSlash[2]);
      let year = parseInt(dateSlash[3]);
      if (year < 100) year += 2000;

      // Heuristic: if first number > 12, it's DD/MM/YYYY; otherwise MM/DD/YYYY
      let month: number, day: number;
      if (a > 12 && b <= 12) {
        day = a; month = b;
      } else if (b > 12 && a <= 12) {
        month = a; day = b;
      } else {
        // Default to MM/DD/YYYY (US format)
        month = a; day = b;
      }

      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const jsDate = new Date(year, month - 1, day);
        if (!isNaN(jsDate.getTime())) {
          // Convert to Excel serial date number
          const excelDate = 25569 + (jsDate.getTime() / 86400000);
          return { value: excelDate, type: "n", format: "mm/dd/yyyy" };
        }
      }
    }

    // YYYY-MM-DD (ISO)
    const dateIso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (dateIso) {
      const year = parseInt(dateIso[1]);
      const month = parseInt(dateIso[2]);
      const day = parseInt(dateIso[3]);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const jsDate = new Date(year, month - 1, day);
        if (!isNaN(jsDate.getTime())) {
          const excelDate = 25569 + (jsDate.getTime() / 86400000);
          return { value: excelDate, type: "n", format: "yyyy-mm-dd" };
        }
      }
    }

    // Plain number: "1,234.56", "-500", "+3.14", "1234"
    const numMatch = trimmed.match(/^[+-]?\d[\d,]*\.?\d*$/);
    if (numMatch) {
      const num = parseFloat(trimmed.replace(/,/g, ""));
      if (!isNaN(num)) {
        // Determine format based on content
        const hasCommas = trimmed.includes(",");
        const decimalPart = trimmed.split(".")[1];
        const decimals = decimalPart ? decimalPart.length : 0;

        let format = "General";
        if (hasCommas && decimals > 0) {
          format = "#,##0." + "0".repeat(decimals);
        } else if (hasCommas) {
          format = "#,##0";
        } else if (decimals > 0) {
          format = "0." + "0".repeat(decimals);
        }

        return { value: num, type: "n", format: format === "General" ? undefined : format };
      }
    }

    // Default: string
    return { value: trimmed, type: "s" };
  };

  // ==================== COLUMN WIDTH AUTO-SIZING ====================

  /** Calculate optimal column widths based on content. */
  const computeColumnWidths = (data: string[][]): { wch: number }[] => {
    if (data.length === 0) return [];
    const numCols = Math.max(...data.map(r => r.length));
    const widths: { wch: number }[] = [];

    for (let c = 0; c < numCols; c++) {
      let maxLen = 8; // minimum width
      for (const row of data) {
        if (row[c]) {
          const len = row[c].length;
          if (len > maxLen) maxLen = len;
        }
      }
      // Cap at 50 characters
      widths.push({ wch: Math.min(maxLen + 2, 50) });
    }
    return widths;
  };

  // ==================== MERGED CELL DETECTION ====================

  /** Detect text items that span multiple column boundaries (potential merged cells). */
  const detectMergedCells = (
    rows: string[][],
    originalItems: TextItem[],
    columnPositions: number[]
  ): { s: { r: number; c: number }; e: { r: number; c: number } }[] => {
    const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [];

    if (columnPositions.length < 2) return merges;

    // Check for cells that are empty and adjacent to a cell with wide content
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        if (!row[c]) continue;

        // Count consecutive empty cells to the right
        let emptyRight = 0;
        for (let cc = c + 1; cc < row.length; cc++) {
          if (!row[cc] || row[cc].trim() === "") {
            emptyRight++;
          } else {
            break;
          }
        }

        // Check if this looks like a merged cell (text present + empty neighbors)
        // Only for rows where most other rows have data in those columns
        if (emptyRight > 0) {
          // Verify that the empty columns normally have data
          let columnsNormallyFilled = 0;
          for (let cc = c + 1; cc <= c + emptyRight; cc++) {
            let filledCount = 0;
            for (let rr = 0; rr < rows.length; rr++) {
              if (rr !== r && rows[rr][cc] && rows[rr][cc].trim()) filledCount++;
            }
            if (filledCount >= rows.length * 0.3) columnsNormallyFilled++;
          }

          if (columnsNormallyFilled === emptyRight && emptyRight >= 1) {
            merges.push({
              s: { r, c },
              e: { r, c: c + emptyRight },
            });
          }
        }
      }
    }

    return merges;
  };

  // ==================== MULTI-PAGE TABLE CONSOLIDATION ====================

  /** Check if two page tables have compatible column structures. */
  const areTablesCompatible = (a: PageTableData, b: PageTableData): boolean => {
    if (a.data.length === 0 || b.data.length === 0) return false;

    // Check column count
    const aColCount = a.data[0].length;
    const bColCount = b.data[0].length;
    if (aColCount !== bColCount) return false;

    // If column positions are available, check alignment
    if (a.columnPositions.length > 0 && b.columnPositions.length > 0) {
      if (a.columnPositions.length !== b.columnPositions.length) return false;
      const positionTolerance = 20;
      let matchCount = 0;
      for (let i = 0; i < a.columnPositions.length; i++) {
        if (Math.abs(a.columnPositions[i] - b.columnPositions[i]) <= positionTolerance) {
          matchCount++;
        }
      }
      return matchCount >= a.columnPositions.length * 0.7;
    }

    // Column count matches — good enough
    return true;
  };

  /** Check if the first row of a page is a repeated header. */
  const isRepeatedHeader = (headerRow: string[], candidateRow: string[]): boolean => {
    if (headerRow.length !== candidateRow.length) return false;
    let matchCount = 0;
    for (let i = 0; i < headerRow.length; i++) {
      const a = (headerRow[i] || "").trim().toLowerCase();
      const b = (candidateRow[i] || "").trim().toLowerCase();
      if (a === b) matchCount++;
    }
    // At least 70% of cells match
    return matchCount >= headerRow.length * 0.7;
  };

  /** Merge compatible page tables into consolidated sheets. */
  const consolidatePages = (pageTables: PageTableData[]): PageTableData[] => {
    if (pageTables.length <= 1) return pageTables;

    const consolidated: PageTableData[] = [];
    let currentGroup: PageTableData | null = null;

    for (const pt of pageTables) {
      if (!currentGroup) {
        currentGroup = { ...pt, data: [...pt.data] };
        continue;
      }

      if (areTablesCompatible(currentGroup, pt)) {
        // Check for repeated header
        let dataToAppend = pt.data;
        if (pt.isHeader && currentGroup.isHeader && currentGroup.data.length > 0 && pt.data.length > 0) {
          if (isRepeatedHeader(currentGroup.data[0], pt.data[0])) {
            // Skip the repeated header row
            dataToAppend = pt.data.slice(1);
          }
        }
        currentGroup.data = [...currentGroup.data, ...dataToAppend];
      } else {
        consolidated.push(currentGroup);
        currentGroup = { ...pt, data: [...pt.data] };
      }
    }

    if (currentGroup) {
      consolidated.push(currentGroup);
    }

    return consolidated;
  };

  // ==================== MAIN CONVERSION ====================

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

      // Collect page data for potential consolidation
      const pageTables: PageTableData[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        setProgress(i);
        setStatus(`Extracting page ${i} of ${doc.numPages}...`);
        const page = await doc.getPage(i);
        const items = await extractTextItems(page);

        if (mode === "smart") {
          // Split into separate table regions before processing
          const viewport = page.getViewport({ scale: 1 });
          const regions = splitIntoTableRegions(items, viewport.height);

          for (let ri = 0; ri < regions.length; ri++) {
            const result = detectTableSmart(regions[ri]);
            let data = result.data;
            if (data.length === 0) {
              data = [["(No text found on this page)"]];
            }
            pageTables.push({
              data,
              isHeader: result.isHeader,
              columnPositions: result.columnPositions,
              pageIndex: i,
              regionIndex: regions.length > 1 ? ri + 1 : undefined,
            });
          }
        } else if (mode === "table") {
          const lines = await detectLines(page);
          const result = detectTable(items, lines);
          let data = result.data;
          if (data.length === 0) {
            data = [["(No text found on this page)"]];
          }
          pageTables.push({
            data,
            isHeader: result.isHeader,
            columnPositions: result.columnPositions,
            pageIndex: i,
          });
        } else {
          let data = extractRawText(items);
          if (data.length === 0) {
            data = [["(No text found on this page)"]];
          }
          pageTables.push({
            data,
            isHeader: false,
            columnPositions: [],
            pageIndex: i,
          });
        }
      }

      // Consolidate pages if enabled and using smart/table mode
      let sheets: { name: string; data: string[][]; isHeader: boolean; columnPositions: number[] }[];

      if (mergePages && mode !== "raw" && pageTables.length > 1) {
        setStatus("Consolidating tables across pages...");
        const consolidated = consolidatePages(pageTables);
        sheets = consolidated.map((ct, idx) => ({
          name: consolidated.length === 1 ? "Sheet1" : `Table ${idx + 1}`,
          data: ct.data,
          isHeader: ct.isHeader,
          columnPositions: ct.columnPositions,
        }));
      } else {
        sheets = pageTables.map((pt) => ({
          name: pt.regionIndex
            ? `Page ${pt.pageIndex} - Table ${pt.regionIndex}`
            : `Page ${pt.pageIndex}`,
          data: pt.data,
          isHeader: pt.isHeader,
          columnPositions: pt.columnPositions,
        }));
      }

      let firstSheetData: string[][] | null = null;
      let firstSheetIsHeader = false;

      for (let si = 0; si < sheets.length; si++) {
        const sheet = sheets[si];
        const { data, isHeader, columnPositions } = sheet;

        totalCells += data.reduce((s, r) => s + r.length, 0);

        // Create worksheet from array of arrays
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Apply cell type inference: walk through cells and set types/formats
        for (let r = 0; r < data.length; r++) {
          for (let c = 0; c < data[r].length; c++) {
            const cellRef = XLSX.utils.encode_cell({ r, c });
            const cellObj = ws[cellRef];
            if (!cellObj || !data[r][c]) continue;

            // Skip header row — keep as string
            if (isHeader && r === 0) continue;

            const typed = inferCellType(data[r][c]);
            if (typed.type === "n") {
              cellObj.t = "n";
              cellObj.v = typed.value;
              if (typed.format) {
                cellObj.z = typed.format;
              }
            }
          }
        }

        // Apply bold styling to header row if detected
        if (isHeader && data.length > 0) {
          for (let c = 0; c < data[0].length; c++) {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c });
            if (ws[cellRef]) {
              ws[cellRef].s = { font: { bold: true } };
            }
          }
        }

        // Apply thin borders to all data cells (best-effort; may not render in all viewers)
        const borderStyle = { style: "thin", color: { rgb: "CCCCCC" } };
        const borderObj = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };
        for (let r = 0; r < data.length; r++) {
          for (let c = 0; c < data[r].length; c++) {
            const cellRef = XLSX.utils.encode_cell({ r, c });
            if (ws[cellRef]) {
              ws[cellRef].s = { ...ws[cellRef].s, border: borderObj };
            }
          }
        }

        // Auto-size columns
        ws["!cols"] = computeColumnWidths(data);

        // Detect and apply merged cells
        if (columnPositions.length > 0) {
          const merges = detectMergedCells(data, [], columnPositions);
          if (merges.length > 0) {
            ws["!merges"] = merges;
          }
        }

        // Capture first sheet data for preview
        if (si === 0) {
          firstSheetData = data;
          firstSheetIsHeader = isHeader;
        }

        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
      }

      if (totalCells === 0) {
        setError("No text could be extracted from this PDF.");
        return;
      }

      // Set preview data
      if (firstSheetData) {
        setPreview(firstSheetData.slice(0, 10));
        setPreviewIsHeader(firstSheetIsHeader);
      }

      setStatus("Creating Excel file...");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + ".xlsx");

      const sheetLabel = sheets.length === 1 ? "1 sheet" : `${sheets.length} sheets`;
      setStatus(`Done! Extracted ${totalCells} cells across ${sheetLabel}.`);
    } catch (e: unknown) {
      console.error("PDF to Excel error:", e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
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
            <button onClick={() => { setFile(null); setPageCount(0); setError(""); setStatus(""); setProgress(0); setPreview(null); setPreviewIsHeader(false); }} disabled={loading} className="theme-text-muted text-sm font-medium disabled:opacity-50">Remove</button>
          </div>

          {/* Mode selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Extraction Mode</label>
            <div className="flex gap-2">
              {([
                { key: "smart" as ExtractionMode, label: "Smart Detection", desc: "Whitespace-based analysis" },
                { key: "table" as ExtractionMode, label: "Grid Lines", desc: "Uses visible borders" },
                { key: "raw" as ExtractionMode, label: "Raw Text", desc: "All text line by line" },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setMode(opt.key)}
                  disabled={loading}
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

          {/* Multi-page merge toggle */}
          {pageCount > 1 && mode !== "raw" && (
            <div className="flex items-center justify-between p-3 rounded-xl theme-bg-secondary">
              <div>
                <p className="text-sm font-medium theme-text">Merge pages into one sheet</p>
                <p className="text-xs theme-text-muted mt-0.5">Combines tables with matching columns, removes repeated headers</p>
              </div>
              <button
                onClick={() => setMergePages(!mergePages)}
                disabled={loading}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  mergePages ? "" : "bg-gray-300"
                }`}
                style={mergePages ? { backgroundColor: accentColor } : {}}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    mergePages ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          )}

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
                <div className="h-2 rounded-full transition-all" style={{ backgroundColor: accentColor, width: `${pageCount > 0 ? (progress / pageCount) * 100 : 0}%` }} />
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
                  Preview{preview.length >= 10 ? " (first 10 rows)" : ""}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  {previewIsHeader && preview.length > 0 && (
                    <thead>
                      <tr className="theme-bg-primary">
                        {preview[0].map((cell, ci) => (
                          <th
                            key={ci}
                            className="px-3 py-1.5 border-b theme-border text-left font-semibold theme-text"
                          >
                            {cell || "\u00A0"}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {preview.slice(previewIsHeader ? 1 : 0).map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? "theme-bg-primary" : "theme-bg-secondary"}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-3 py-1.5 border-b theme-border text-left theme-text-secondary"
                          >
                            {cell || "\u00A0"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 theme-bg-secondary border-t theme-border">
                <p className="text-xs theme-text-muted">
                  Preview looks wrong? Try Grid Lines mode for bordered tables, or Raw Text for general extraction.
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
            Smart Detection works best for most tables. Use Grid Lines for bordered tables, or Raw Text for general text.
          </p>
        </div>
      )}
    </div>
  );
}
