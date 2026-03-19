"use client";
import { useState } from "react";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

type QualityMode = "fast" | "full";

interface TextItem {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  width: number;
  height: number;
  color?: { r: number; g: number; b: number };
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  hasEOL: boolean;
}

interface LinkAnnotation {
  url: string;
  rect: [number, number, number, number]; // [x1, y1, x2, y2] in PDF coords
}

interface DetectedTable {
  rows: TextItem[][][]; // rows -> columns -> items
  startY: number;
  endY: number;
  columnBoundaries: number[];
}

interface LineGroup {
  items: TextItem[];
  y: number;
  minX: number;
  maxX: number;
  avgFontSize: number;
  text: string;
}

interface ParagraphGroup {
  lines: LineGroup[];
  alignment: "left" | "center" | "right";
  fontSize: number;
  fontName: string;
  isBold: boolean;
  isItalic: boolean;
  indent: number;
  isBullet: boolean;
  bulletChar: string;
  isNumberedList: boolean;
  listNumber: string;
  color?: { r: number; g: number; b: number };
}

interface ExtractedImage {
  data: Uint8Array;
  width: number;
  height: number;
  format: "png" | "jpeg";
}

interface PageContent {
  paragraphs: ParagraphGroup[];
  tables: DetectedTable[];
  links: LinkAnnotation[];
  images: ExtractedImage[];
  width: number;
  height: number;
}

export default function PdfToDocxTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [quality, setQuality] = useState<QualityMode>("full");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const handleFile = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFile(f);
    setError("");
    setWarning("");
    setStatus("");
    setProgress(0);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const buf = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      setPageCount(doc.numPages);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("password") || msg.includes("encrypted")) {
        setError("This PDF is password-protected. Please remove the password first.");
      } else {
        setError("Could not read this PDF. It may be corrupted.");
      }
      setFile(null);
    }
  };

  // ---------- Color extraction via operator list ----------

  const extractTextColors = async (
    page: import("pdfjs-dist").PDFPageProxy
  ): Promise<Map<number, { r: number; g: number; b: number }>> => {
    const colorMap = new Map<number, { r: number; g: number; b: number }>();
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const ops = await page.getOperatorList();
      const OPS = pdfjsLib.OPS;

      let currentColor = { r: 0, g: 0, b: 0 };
      const colorStack: { r: number; g: number; b: number }[] = [];
      let textItemIndex = 0;

      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        const args = ops.argsArray[i];

        switch (fn) {
          case OPS.save:
            colorStack.push({ ...currentColor });
            break;
          case OPS.restore:
            if (colorStack.length > 0) {
              currentColor = colorStack.pop()!;
            }
            break;
          case (OPS as Record<string, number>)["setFillRGBColor"]:
            if (args && args.length >= 3) {
              currentColor = {
                r: Math.round(args[0] * 255),
                g: Math.round(args[1] * 255),
                b: Math.round(args[2] * 255),
              };
            }
            break;
          case (OPS as Record<string, number>)["setFillGray"]:
            if (args && args.length >= 1) {
              const gray = Math.round(args[0] * 255);
              currentColor = { r: gray, g: gray, b: gray };
            }
            break;
          case (OPS as Record<string, number>)["setFillCMYKColor"]:
            if (args && args.length >= 4) {
              const c = args[0], m = args[1], y = args[2], k = args[3];
              currentColor = {
                r: Math.round(255 * (1 - c) * (1 - k)),
                g: Math.round(255 * (1 - m) * (1 - k)),
                b: Math.round(255 * (1 - y) * (1 - k)),
              };
            }
            break;
          case (OPS as Record<string, number>)["setFillColorN"]:
          case (OPS as Record<string, number>)["setFillColor"]:
            if (args && args.length >= 3) {
              currentColor = {
                r: Math.round(args[0] * 255),
                g: Math.round(args[1] * 255),
                b: Math.round(args[2] * 255),
              };
            }
            break;
          case OPS.showText:
          case OPS.showSpacedText:
          case (OPS as Record<string, number>)["nextLineShowText"]:
          case (OPS as Record<string, number>)["nextLineSetSpacingShowText"]:
            // Only store non-black colors (black is default and adds noise)
            if (currentColor.r !== 0 || currentColor.g !== 0 || currentColor.b !== 0) {
              colorMap.set(textItemIndex, { ...currentColor });
            }
            textItemIndex++;
            break;
        }
      }
    } catch {
      // Color extraction is best-effort
    }
    return colorMap;
  };

  // ---------- Link annotation extraction ----------

  const extractLinks = async (
    page: import("pdfjs-dist").PDFPageProxy
  ): Promise<LinkAnnotation[]> => {
    const links: LinkAnnotation[] = [];
    try {
      const annotations = await page.getAnnotations();
      for (const ann of annotations) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const a = ann as any;
        if (a.subtype === "Link" && a.url && a.rect) {
          links.push({
            url: a.url,
            rect: a.rect as [number, number, number, number],
          });
        }
      }
    } catch {
      // Link extraction is best-effort
    }
    return links;
  };

  // ---------- Text item extraction with inline formatting ----------

  const extractTextItems = async (
    page: import("pdfjs-dist").PDFPageProxy,
    colorMap?: Map<number, { r: number; g: number; b: number }>
  ): Promise<TextItem[]> => {
    const textContent = await page.getTextContent();
    const items: TextItem[] = [];

    // Build a styles lookup from textContent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styles = (textContent as any).styles as Record<string, { fontFamily?: string; ascent?: number; descent?: number }> | undefined;

    let textOpIndex = 0;

    for (const item of textContent.items) {
      if (!("str" in item)) continue;
      const ti = item as {
        str: string;
        transform: number[];
        fontName: string;
        hasEOL: boolean;
        width: number;
        height: number;
      };
      if (!ti.str.trim() && !ti.hasEOL) continue;

      const tx = ti.transform;
      const fontSize = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]) || Math.abs(tx[0]) || 12;
      const x = tx[4];
      const y = tx[5];

      const fontName = ti.fontName || "";
      const fontFamily = styles?.[fontName]?.fontFamily || "";
      const nameToCheck = fontName + " " + fontFamily;

      // Detect bold from font name patterns
      const isBold = /bold|black|heavy|demi|semibold/i.test(nameToCheck) ||
        /[\-_]B($|[\-_])/i.test(fontName) ||
        /,Bold/i.test(fontName);

      // Detect italic from font name patterns
      const isItalic = /italic|oblique|slant/i.test(nameToCheck) ||
        /[\-_]I($|[\-_])/i.test(fontName) ||
        /,Italic/i.test(fontName);

      // Detect underline (rare in PDF font names, but check)
      const isUnderline = /underline/i.test(nameToCheck);

      // Get color from operator list mapping
      const color = colorMap?.get(textOpIndex);

      items.push({
        str: ti.str,
        x,
        y,
        fontSize: Math.round(fontSize * 10) / 10,
        fontName,
        width: ti.width || 0,
        height: ti.height || fontSize,
        isBold,
        isItalic,
        isUnderline,
        color,
        hasEOL: ti.hasEOL,
      });

      // Track operator index: every item with "str" corresponds to a showText op,
      // including empty strings, to stay in sync with extractTextColors()
      textOpIndex++;
    }
    return items;
  };

  // ---------- Histogram-based column detection ----------

  const detectColumns = (items: TextItem[], pageWidth: number): TextItem[][] => {
    if (items.length === 0) return [[]];

    // Build a histogram of X positions using fine-grained bins
    const binSize = Math.max(1, pageWidth / 200);
    const numBins = Math.ceil(pageWidth / binSize) + 1;
    const histogram = new Array(numBins).fill(0);

    // Also track rightmost X per item for gap detection
    for (const item of items) {
      const bin = Math.floor(item.x / binSize);
      if (bin >= 0 && bin < numBins) histogram[bin]++;
      // Fill bins covered by this item
      const endBin = Math.floor((item.x + item.width) / binSize);
      for (let b = bin; b <= Math.min(endBin, numBins - 1); b++) {
        histogram[b]++;
      }
    }

    // Find gaps: regions with zero or near-zero density that span > 10% page width
    const gapThreshold = Math.max(1, items.length * 0.01);
    const gaps: { start: number; end: number; center: number }[] = [];
    let gapStart = -1;

    for (let b = 0; b < numBins; b++) {
      if (histogram[b] <= gapThreshold) {
        if (gapStart === -1) gapStart = b;
      } else {
        if (gapStart !== -1) {
          const gapWidthPx = (b - gapStart) * binSize;
          // Only consider gaps wider than 5% of page width and not at margins
          const gapCenterPx = (gapStart + b) / 2 * binSize;
          if (gapWidthPx > pageWidth * 0.05 &&
              gapCenterPx > pageWidth * 0.1 &&
              gapCenterPx < pageWidth * 0.9) {
            gaps.push({
              start: gapStart * binSize,
              end: b * binSize,
              center: gapCenterPx,
            });
          }
          gapStart = -1;
        }
      }
    }

    if (gaps.length === 0) return [items];

    // Use gap centers as column boundaries
    const boundaries = gaps.map((g) => g.center);

    // Assign items to columns
    const columns: TextItem[][] = Array.from(
      { length: boundaries.length + 1 },
      () => []
    );
    for (const item of items) {
      let colIdx = 0;
      for (let b = 0; b < boundaries.length; b++) {
        if (item.x > boundaries[b]) colIdx = b + 1;
      }
      columns[colIdx].push(item);
    }

    return columns.filter((col) => col.length > 0);
  };

  // ---------- Table detection ----------

  const detectTables = (items: TextItem[], pageWidth: number): { tables: DetectedTable[]; nonTableItems: TextItem[] } => {
    if (items.length < 6) return { tables: [], nonTableItems: items };

    // Group items into lines first
    const lines = groupItemsIntoLines(items);
    if (lines.length < 2) return { tables: [], nonTableItems: items };

    // For each line, find the X positions where text starts
    const lineXPositions: { line: LineGroup; xStarts: number[]; xEnds: number[] }[] = [];
    for (const line of lines) {
      // Find distinct text segments separated by gaps
      const sortedItems = [...line.items].sort((a, b) => a.x - b.x);
      const segments: { startX: number; endX: number }[] = [];
      let segStart = sortedItems[0].x;
      let segEnd = sortedItems[0].x + sortedItems[0].width;

      for (let i = 1; i < sortedItems.length; i++) {
        const gap = sortedItems[i].x - segEnd;
        // Gap > 1.5x average font size indicates column separator
        if (gap > line.avgFontSize * 1.5) {
          segments.push({ startX: segStart, endX: segEnd });
          segStart = sortedItems[i].x;
        }
        segEnd = Math.max(segEnd, sortedItems[i].x + sortedItems[i].width);
      }
      segments.push({ startX: segStart, endX: segEnd });

      if (segments.length >= 2) {
        lineXPositions.push({
          line,
          xStarts: segments.map((s) => s.startX),
          xEnds: segments.map((s) => s.endX),
        });
      }
    }

    if (lineXPositions.length < 2) return { tables: [], nonTableItems: items };

    // Find lines that share similar column boundaries (table rows)
    // Use a voting approach: collect all column start positions and find clusters
    const allXStarts: number[] = [];
    for (const lp of lineXPositions) {
      allXStarts.push(...lp.xStarts);
    }

    // Cluster the X start positions
    const tolerance = pageWidth * 0.02;
    const xClusters: { center: number; count: number }[] = [];
    const sortedXStarts = [...allXStarts].sort((a, b) => a - b);

    for (const x of sortedXStarts) {
      const existing = xClusters.find((c) => Math.abs(x - c.center) < tolerance);
      if (existing) {
        existing.center = (existing.center * existing.count + x) / (existing.count + 1);
        existing.count++;
      } else {
        xClusters.push({ center: x, count: 1 });
      }
    }

    // Keep clusters that appear in multiple lines
    const minLines = Math.max(2, lineXPositions.length * 0.3);
    const significantClusters = xClusters
      .filter((c) => c.count >= minLines)
      .sort((a, b) => a.center - b.center);

    if (significantClusters.length < 2) return { tables: [], nonTableItems: items };

    // Column boundaries are the midpoints of gaps between significant clusters
    const columnBoundaries = significantClusters.map((c) => c.center);

    // Now identify which lines belong to the table
    // A line is a table row if it has text in >= 2 column positions
    const tableLines: LineGroup[] = [];
    const nonTableLines: LineGroup[] = [];

    for (const lp of lineXPositions) {
      let matchingColumns = 0;
      for (const xs of lp.xStarts) {
        if (columnBoundaries.some((cb) => Math.abs(xs - cb) < tolerance * 2)) {
          matchingColumns++;
        }
      }
      if (matchingColumns >= 2) {
        tableLines.push(lp.line);
      } else {
        nonTableLines.push(lp.line);
      }
    }

    // Also add lines that had only 1 segment (not in lineXPositions) to nonTable
    const lineXPosSet = new Set(lineXPositions.map((lp) => lp.line));
    for (const line of lines) {
      if (!lineXPosSet.has(line)) {
        nonTableLines.push(line);
      }
    }

    if (tableLines.length < 2) return { tables: [], nonTableItems: items };

    // Scoring function to distinguish real tables from multi-column text
    const isLikelyTable = (candidateLines: LineGroup[], colBounds: number[]): boolean => {
      // Build a temporary table to analyze cell contents
      const tempTable = buildTable(candidateLines, colBounds);
      const allCellWordCounts: number[] = [];
      const rowNonEmptyCounts: number[] = [];
      // Track text lengths per column for CV calculation
      const columnTextLengths: number[][] = colBounds.map(() => []);

      for (const row of tempTable.rows) {
        let nonEmpty = 0;
        for (let cIdx = 0; cIdx < row.length; cIdx++) {
          const cellText = row[cIdx].map((it) => it.str).join("").trim();
          const wordCount = cellText ? cellText.split(/\s+/).length : 0;
          if (cellText) {
            allCellWordCounts.push(wordCount);
            nonEmpty++;
          }
          if (cIdx < columnTextLengths.length) {
            columnTextLengths[cIdx].push(cellText.length);
          }
        }
        rowNonEmptyCounts.push(nonEmpty);
      }

      if (allCellWordCounts.length === 0) return false;

      let score = 0;

      // 1. Median words per cell
      const sortedWords = [...allCellWordCounts].sort((a, b) => a - b);
      const medianWords = sortedWords[Math.floor(sortedWords.length / 2)];
      if (medianWords < 5) score += 2;
      else if (medianWords <= 10) score += 1;
      else if (medianWords <= 15) score -= 1;
      else score -= 3;

      // 2. Cell count consistency (std dev of non-empty cells per row)
      const avgNonEmpty = rowNonEmptyCounts.reduce((s, v) => s + v, 0) / rowNonEmptyCounts.length;
      const variance = rowNonEmptyCounts.reduce((s, v) => s + (v - avgNonEmpty) ** 2, 0) / rowNonEmptyCounts.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev < 0.5) score += 2;
      else if (stdDev > 1.5) score -= 2;

      // 3. Two-column long text penalty
      const avgWords = allCellWordCounts.reduce((s, v) => s + v, 0) / allCellWordCounts.length;
      if (colBounds.length === 2 && avgWords > 10) score -= 3;

      // 4. Text length variance within columns (coefficient of variation)
      for (const lengths of columnTextLengths) {
        const nonZero = lengths.filter((l) => l > 0);
        if (nonZero.length < 2) continue;
        const mean = nonZero.reduce((s, v) => s + v, 0) / nonZero.length;
        if (mean === 0) continue;
        const colVariance = nonZero.reduce((s, v) => s + (v - mean) ** 2, 0) / nonZero.length;
        const cv = Math.sqrt(colVariance) / mean;
        if (cv < 0.5) score += 1;
        else if (cv > 1.0) score -= 1;
      }

      return score >= 0;
    };

    // Group consecutive table lines into tables
    const sortedTableLines = [...tableLines].sort((a, b) => b.y - a.y);
    const tables: DetectedTable[] = [];
    let currentTableLines: LineGroup[] = [sortedTableLines[0]];

    for (let i = 1; i < sortedTableLines.length; i++) {
      const gap = currentTableLines[currentTableLines.length - 1].y - sortedTableLines[i].y;
      const avgSize = sortedTableLines[i].avgFontSize;
      // Lines more than 3x font size apart start a new table
      if (gap > avgSize * 3) {
        if (currentTableLines.length >= 2 && isLikelyTable(currentTableLines, columnBoundaries)) {
          tables.push(buildTable(currentTableLines, columnBoundaries));
        } else {
          // Too few lines, add back to non-table
          for (const tl of currentTableLines) nonTableLines.push(tl);
        }
        currentTableLines = [sortedTableLines[i]];
      } else {
        currentTableLines.push(sortedTableLines[i]);
      }
    }
    if (currentTableLines.length >= 2 && isLikelyTable(currentTableLines, columnBoundaries)) {
      tables.push(buildTable(currentTableLines, columnBoundaries));
    } else {
      for (const tl of currentTableLines) nonTableLines.push(tl);
    }

    // Collect non-table items
    const tableItemSet = new Set<TextItem>();
    for (const table of tables) {
      for (const row of table.rows) {
        for (const col of row) {
          for (const item of col) {
            tableItemSet.add(item);
          }
        }
      }
    }
    const nonTableItems = items.filter((it) => !tableItemSet.has(it));

    return { tables, nonTableItems };
  };

  const buildTable = (tableLines: LineGroup[], columnBoundaries: number[]): DetectedTable => {
    // Sort column boundaries
    const sortedBounds = [...columnBoundaries].sort((a, b) => a - b);

    // Build column ranges: each column starts at a boundary and extends to the next
    const colRanges: { min: number; max: number }[] = [];
    for (let c = 0; c < sortedBounds.length; c++) {
      const min = c === 0 ? 0 : (sortedBounds[c - 1] + sortedBounds[c]) / 2;
      const max = c === sortedBounds.length - 1 ? Infinity : (sortedBounds[c] + sortedBounds[c + 1]) / 2;
      colRanges.push({ min, max });
    }

    // Build rows
    const rows: TextItem[][][] = [];
    for (const line of tableLines) {
      const row: TextItem[][] = colRanges.map(() => []);
      for (const item of line.items) {
        // Find which column this item belongs to
        let bestCol = 0;
        let bestDist = Infinity;
        for (let c = 0; c < sortedBounds.length; c++) {
          const dist = Math.abs(item.x - sortedBounds[c]);
          if (dist < bestDist) {
            bestDist = dist;
            bestCol = c;
          }
        }
        row[bestCol].push(item);
      }
      rows.push(row);
    }

    return {
      rows,
      startY: Math.max(...tableLines.map((l) => l.y)),
      endY: Math.min(...tableLines.map((l) => l.y)),
      columnBoundaries: sortedBounds,
    };
  };

  // ---------- Line grouping ----------

  const groupItemsIntoLines = (items: TextItem[]): LineGroup[] => {
    if (items.length === 0) return [];

    const sorted = [...items].sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.x - b.x;
    });

    const lines: LineGroup[] = [];
    let currentLine: TextItem[] = [sorted[0]];
    let currentY = sorted[0].y;

    for (let i = 1; i < sorted.length; i++) {
      const item = sorted[i];
      const yThreshold = Math.max(item.fontSize * 0.5, 3);
      if (Math.abs(item.y - currentY) <= yThreshold) {
        currentLine.push(item);
      } else {
        currentLine.sort((a, b) => a.x - b.x);
        lines.push(buildLineGroup(currentLine));
        currentLine = [item];
        currentY = item.y;
      }
    }
    if (currentLine.length > 0) {
      currentLine.sort((a, b) => a.x - b.x);
      lines.push(buildLineGroup(currentLine));
    }

    return lines;
  };

  const groupIntoLines = (items: TextItem[], pageWidth: number): LineGroup[] => {
    if (items.length === 0) return [];

    const columns = detectColumns(items, pageWidth);

    const allLines: LineGroup[] = [];
    for (const colItems of columns) {
      const colLines = groupItemsIntoLines(colItems);
      allLines.push(...colLines);
    }

    return allLines;
  };

  const buildLineGroup = (items: TextItem[]): LineGroup => {
    const text = items.map((it) => it.str).join("");
    const avgFontSize = items.reduce((s, it) => s + it.fontSize, 0) / items.length;
    return {
      items,
      y: items[0].y,
      minX: Math.min(...items.map((it) => it.x)),
      maxX: Math.max(...items.map((it) => it.x + it.width)),
      avgFontSize,
      text,
    };
  };

  // ---------- Alignment detection ----------

  const detectAlignment = (
    lines: LineGroup[],
    pageWidth: number,
    leftMargin: number
  ): "left" | "center" | "right" => {
    if (lines.length === 0) return "left";
    if (lines.length === 1) {
      const line = lines[0];
      const lineCenter = (line.minX + line.maxX) / 2;
      const pageCenter = pageWidth / 2;
      if (Math.abs(lineCenter - pageCenter) < pageWidth * 0.1) return "center";
      if (line.minX > pageWidth * 0.6) return "right";
      return "left";
    }

    const centers = lines.map((l) => (l.minX + l.maxX) / 2);
    const avgCenter = centers.reduce((s, c) => s + c, 0) / centers.length;
    const centerDeviation = centers.reduce((s, c) => s + Math.abs(c - avgCenter), 0) / centers.length;
    const pageCenter = pageWidth / 2;
    if (Math.abs(avgCenter - pageCenter) < pageWidth * 0.1 && centerDeviation < pageWidth * 0.05) {
      return "center";
    }

    const rightEdges = lines.map((l) => l.maxX);
    const avgRight = rightEdges.reduce((s, r) => s + r, 0) / rightEdges.length;
    const rightDeviation = rightEdges.reduce((s, r) => s + Math.abs(r - avgRight), 0) / rightEdges.length;
    const leftEdges = lines.map((l) => l.minX);
    const leftDeviation = leftEdges.reduce((s, l) => s + Math.abs(l - leftMargin), 0) / leftEdges.length;

    if (rightDeviation < 5 && leftDeviation > 20) return "right";
    return "left";
  };

  // ---------- Paragraph grouping ----------

  const groupIntoParagraphs = (lines: LineGroup[], pageWidth: number): ParagraphGroup[] => {
    if (lines.length === 0) return [];

    const leftPositions = lines.map((l) => Math.round(l.minX));
    const leftCounts: Record<number, number> = {};
    leftPositions.forEach((p) => {
      const rounded = Math.round(p / 5) * 5;
      leftCounts[rounded] = (leftCounts[rounded] || 0) + 1;
    });
    const bodyLeftMargin = Number(
      Object.entries(leftCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 0
    );

    const fontSizes = lines.map((l) => Math.round(l.avgFontSize));
    const sizeCounts: Record<number, number> = {};
    fontSizes.forEach((s) => {
      sizeCounts[s] = (sizeCounts[s] || 0) + 1;
    });
    const bodyFontSize = Number(
      Object.entries(sizeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 12
    );

    const lineGaps: number[] = [];
    for (let i = 1; i < lines.length; i++) {
      const gap = lines[i - 1].y - lines[i].y;
      if (gap > 0) lineGaps.push(gap);
    }
    lineGaps.sort((a, b) => a - b);
    const medianLineSpacing =
      lineGaps.length > 0
        ? lineGaps[Math.floor(lineGaps.length / 2)]
        : lines[0].avgFontSize * 1.4;

    const paragraphs: ParagraphGroup[] = [];
    let currentLines: LineGroup[] = [lines[0]];

    for (let i = 1; i < lines.length; i++) {
      const prevLine = lines[i - 1];
      const currLine = lines[i];
      const gap = prevLine.y - currLine.y;
      const isNewParagraph =
        gap > medianLineSpacing * 1.8 ||
        Math.abs(currLine.avgFontSize - prevLine.avgFontSize) > 1 ||
        isBulletLine(currLine.text) ||
        isNumberedLine(currLine.text);

      if (isNewParagraph) {
        paragraphs.push(buildParagraph(currentLines, pageWidth, bodyLeftMargin, bodyFontSize));
        currentLines = [currLine];
      } else {
        currentLines.push(currLine);
      }
    }
    if (currentLines.length > 0) {
      paragraphs.push(buildParagraph(currentLines, pageWidth, bodyLeftMargin, bodyFontSize));
    }

    return paragraphs;
  };

  const isBulletLine = (text: string): boolean => /^\s*[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s/.test(text);
  const isNumberedLine = (text: string): boolean => /^\s*\d+[\.\)]\s/.test(text);

  const buildParagraph = (
    lines: LineGroup[],
    pageWidth: number,
    bodyLeftMargin: number,
    _bodyFontSize: number
  ): ParagraphGroup => {
    const firstLine = lines[0];
    const primaryItem = firstLine.items[0];
    const fontName = primaryItem?.fontName || "";
    const fontSize = firstLine.avgFontSize;
    const isBold = primaryItem?.isBold || false;
    const isItalic = primaryItem?.isItalic || false;
    const indent = Math.max(0, Math.round(firstLine.minX - bodyLeftMargin));
    const text = firstLine.text;
    const bullet = isBulletLine(text);
    const numbered = isNumberedLine(text);

    let bulletChar = "";
    let listNumber = "";
    if (bullet) {
      const match = text.match(/^\s*([•\-\*\u2022\u2023\u25E6\u2043\u2219])\s/);
      bulletChar = match ? match[1] : "\u2022";
    }
    if (numbered) {
      const match = text.match(/^\s*(\d+[\.\)])\s/);
      listNumber = match ? match[1] : "";
    }

    const alignment = detectAlignment(lines, pageWidth, bodyLeftMargin);

    // Get predominant color from first line items
    const colors = firstLine.items.filter((it) => it.color).map((it) => it.color!);
    const color = colors.length > 0 ? colors[0] : undefined;

    return {
      lines,
      alignment,
      fontSize,
      fontName,
      isBold,
      isItalic,
      indent: indent > 10 ? indent : 0,
      isBullet: bullet,
      bulletChar,
      isNumberedList: numbered,
      listNumber,
      color,
    };
  };

  // ---------- Image extraction ----------

  const extractImages = async (page: import("pdfjs-dist").PDFPageProxy): Promise<ExtractedImage[]> => {
    const images: ExtractedImage[] = [];
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const ops = await page.getOperatorList();
      const OPS = pdfjsLib.OPS;

      for (let i = 0; i < ops.fnArray.length; i++) {
        if (
          ops.fnArray[i] === OPS.paintImageXObject ||
          ops.fnArray[i] === (OPS as Record<string, number>)["paintJpegXObject"]
        ) {
          const imgName = ops.argsArray[i][0];
          try {
            let imgData: {
              width: number;
              height: number;
              data?: Uint8ClampedArray;
              src?: string;
              kind?: number;
            } | null = null;

            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const obj = page.objs as any;
              const result = obj.get(imgName);
              if (result && typeof result.then === "function") {
                imgData = await Promise.race([
                  result,
                  new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
                ]);
              } else if (result && typeof result === "object" && "width" in result) {
                imgData = result;
              }
            } catch {
              // Direct access failed
            }

            if (!imgData) {
              try {
                imgData = await new Promise<{
                  width: number;
                  height: number;
                  data?: Uint8ClampedArray;
                  src?: string;
                  kind?: number;
                } | null>((resolve) => {
                  const timeout = setTimeout(() => resolve(null), 2000);
                  try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (page.objs as any).get(imgName, (data: unknown) => {
                      clearTimeout(timeout);
                      resolve(data as { width: number; height: number; data?: Uint8ClampedArray; src?: string; kind?: number } | null);
                    });
                  } catch {
                    clearTimeout(timeout);
                    resolve(null);
                  }
                });
              } catch {
                // Skip
              }
            }

            if (!imgData || imgData.width < 10 || imgData.height < 10) continue;

            if (imgData.src) {
              try {
                const response = await fetch(imgData.src);
                const blob = await response.blob();
                const arrayBuf = await blob.arrayBuffer();
                images.push({
                  data: new Uint8Array(arrayBuf),
                  width: imgData.width,
                  height: imgData.height,
                  format: "jpeg",
                });
              } catch {
                // Skip
              }
              continue;
            }

            if (imgData.data) {
              const canvas = document.createElement("canvas");
              canvas.width = imgData.width;
              canvas.height = imgData.height;
              const ctx = canvas.getContext("2d");
              if (!ctx) continue;

              let imageDataArr: Uint8ClampedArray;
              if (imgData.data.length === imgData.width * imgData.height * 4) {
                imageDataArr = imgData.data;
              } else if (imgData.data.length === imgData.width * imgData.height * 3) {
                imageDataArr = new Uint8ClampedArray(imgData.width * imgData.height * 4);
                for (let j = 0; j < imgData.width * imgData.height; j++) {
                  imageDataArr[j * 4] = imgData.data[j * 3];
                  imageDataArr[j * 4 + 1] = imgData.data[j * 3 + 1];
                  imageDataArr[j * 4 + 2] = imgData.data[j * 3 + 2];
                  imageDataArr[j * 4 + 3] = 255;
                }
              } else {
                continue;
              }

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const idata = new ImageData(imageDataArr as any, imgData.width, imgData.height);
              ctx.putImageData(idata, 0, 0);

              const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, "image/png")
              );
              canvas.width = 0;
              canvas.height = 0;
              if (blob) {
                const arrayBuf = await blob.arrayBuffer();
                images.push({
                  data: new Uint8Array(arrayBuf),
                  width: imgData.width,
                  height: imgData.height,
                  format: "png",
                });
              }
            }
          } catch {
            // Skip
          }
        }
      }
    } catch {
      // Image extraction failed
    }
    return images;
  };

  const renderPageToImage = async (
    page: import("pdfjs-dist").PDFPageProxy
  ): Promise<ExtractedImage> => {
    const scale = 2;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to create canvas context");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) {
      canvas.width = 0;
      canvas.height = 0;
      throw new Error("Failed to render page to image");
    }

    const arrayBuf = await blob.arrayBuffer();
    canvas.width = 0;
    canvas.height = 0;
    return {
      data: new Uint8Array(arrayBuf),
      width: viewport.width,
      height: viewport.height,
      format: "png",
    };
  };

  // ---------- Page content extraction ----------

  const extractPageContent = async (
    page: import("pdfjs-dist").PDFPageProxy,
    mode: QualityMode
  ): Promise<PageContent> => {
    const viewport = page.getViewport({ scale: 1 });
    const pageWidth = viewport.width;
    const pageHeight = viewport.height;

    // Extract colors from operator list (full mode only)
    let colorMap: Map<number, { r: number; g: number; b: number }> | undefined;
    if (mode === "full") {
      colorMap = await extractTextColors(page);
    }

    const textItems = await extractTextItems(page, colorMap);

    // Extract links
    const links = mode === "full" ? await extractLinks(page) : [];

    // Detect tables first, then process remaining text as paragraphs
    const { tables, nonTableItems } = detectTables(textItems, pageWidth);

    const lines = groupIntoLines(nonTableItems, pageWidth);
    const paragraphs = groupIntoParagraphs(lines, pageWidth);

    let images: ExtractedImage[] = [];
    if (mode === "full") {
      images = await extractImages(page);
    }

    return {
      paragraphs,
      tables,
      links,
      images,
      width: pageWidth,
      height: pageHeight,
    };
  };

  // ---------- Helper: check if text item overlaps a link annotation ----------

  const findLinkForItem = (
    item: TextItem,
    links: LinkAnnotation[]
  ): LinkAnnotation | undefined => {
    if (links.length === 0) return undefined;
    const itemCenterX = item.x + item.width / 2;
    const itemCenterY = item.y;
    for (const link of links) {
      const [x1, y1, x2, y2] = link.rect;
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      if (itemCenterX >= minX - 2 && itemCenterX <= maxX + 2 &&
          itemCenterY >= minY - 2 && itemCenterY <= maxY + 2) {
        return link;
      }
    }
    return undefined;
  };

  // ---------- Helper: format color to hex ----------

  const colorToHex = (color: { r: number; g: number; b: number }): string => {
    return `${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
  };

  // ---------- Build DOCX ----------

  const buildDocx = async (pages: PageContent[]) => {
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      HeadingLevel,
      AlignmentType,
      PageBreak,
      ImageRun,
      ExternalHyperlink,
      Table,
      TableRow,
      TableCell,
      BorderStyle,
      ShadingType,
      WidthType,
      convertInchesToTwip,
    } = await import("docx");

    // Find body font size across all pages
    const allFontSizes: number[] = [];
    for (const page of pages) {
      for (const p of page.paragraphs) {
        allFontSizes.push(p.fontSize);
      }
    }
    const sizeFreq: Record<number, number> = {};
    allFontSizes.forEach((s) => {
      const rounded = Math.round(s);
      sizeFreq[rounded] = (sizeFreq[rounded] || 0) + 1;
    });
    const bodySize = Number(
      Object.entries(sizeFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 12
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docChildren: any[] = [];

    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
      const page = pages[pageIdx];

      // Add images at the start of the page
      for (const img of page.images) {
        try {
          const maxWidthInches = 6;
          const aspectRatio = img.height / img.width;
          let imgWidthInches = Math.min(img.width / 96, maxWidthInches);
          let imgHeightInches = imgWidthInches * aspectRatio;
          if (imgHeightInches > 8) {
            imgHeightInches = 8;
            imgWidthInches = imgHeightInches / aspectRatio;
          }

          docChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: img.data,
                  transformation: {
                    width: convertInchesToTwip(imgWidthInches) / 15,
                    height: convertInchesToTwip(imgHeightInches) / 15,
                  },
                  type: img.format === "jpeg" ? "jpg" : "png",
                }),
              ],
              spacing: { after: 200 },
            })
          );
        } catch {
          // Skip
        }
      }

      // Interleave tables and paragraphs by Y position
      // Build a combined list of content blocks sorted by Y position
      interface ContentBlock {
        type: "paragraph" | "table";
        y: number;
        paragraph?: ParagraphGroup;
        table?: DetectedTable;
      }

      const blocks: ContentBlock[] = [];
      for (const para of page.paragraphs) {
        blocks.push({
          type: "paragraph",
          y: para.lines[0]?.y || 0,
          paragraph: para,
        });
      }
      for (const table of page.tables) {
        blocks.push({
          type: "table",
          y: table.startY,
          table,
        });
      }
      // Sort by Y descending (top of page first in PDF coords)
      blocks.sort((a, b) => b.y - a.y);

      for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
        const block = blocks[bIdx];

        if (block.type === "table" && block.table) {
          // Render table
          const table = block.table;
          const numCols = table.columnBoundaries.length;
          const tableWidthDxa = 9360; // ~6.5 inches
          const colWidthDxa = Math.floor(tableWidthDxa / numCols);

          const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
          const borders = { top: border, bottom: border, left: border, right: border };

          const tableRows: InstanceType<typeof TableRow>[] = [];
          for (let rIdx = 0; rIdx < table.rows.length; rIdx++) {
            const row = table.rows[rIdx];
            const isHeader = rIdx === 0;
            const cells: InstanceType<typeof TableCell>[] = [];

            for (let cIdx = 0; cIdx < numCols; cIdx++) {
              const cellItems = cIdx < row.length ? row[cIdx] : [];
              const cellText = cellItems.map((it) => it.str).join("").trim();

              // Build runs with inline formatting for cell content
              const cellRuns = buildInlineRuns(cellItems, page.links, TextRun, ExternalHyperlink);

              cells.push(
                new TableCell({
                  children: [
                    new Paragraph({
                      children: cellRuns.length > 0 ? cellRuns : [new TextRun({ text: cellText || "" })],
                    }),
                  ],
                  borders,
                  width: { size: colWidthDxa, type: WidthType.DXA },
                  shading: isHeader
                    ? { fill: "D9E2F3", type: ShadingType.CLEAR, color: "auto" }
                    : undefined,
                })
              );
            }

            tableRows.push(
              new TableRow({
                children: cells,
                tableHeader: isHeader,
              })
            );
          }

          if (tableRows.length > 0) {
            docChildren.push(
              new Table({
                rows: tableRows,
                width: { size: tableWidthDxa, type: WidthType.DXA },
              })
            );
            // Add spacing after table
            docChildren.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
          }
        } else if (block.type === "paragraph" && block.paragraph) {
          const para = block.paragraph;

          // Determine heading level
          let headingLevel: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
          const sizeRatio = para.fontSize / bodySize;
          if (sizeRatio >= 1.8) headingLevel = HeadingLevel.HEADING_1;
          else if (sizeRatio >= 1.4) headingLevel = HeadingLevel.HEADING_2;
          else if (sizeRatio >= 1.15 && para.isBold) headingLevel = HeadingLevel.HEADING_3;

          // Build alignment
          let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;
          if (para.alignment === "center") alignment = AlignmentType.CENTER;
          else if (para.alignment === "right") alignment = AlignmentType.RIGHT;

          // Collect all text items from all lines for multi-run inline formatting
          const allItems: TextItem[] = [];
          for (let lineIdx = 0; lineIdx < para.lines.length; lineIdx++) {
            const line = para.lines[lineIdx];
            allItems.push(...line.items);
            // Add a space between lines (unless it's the last line)
            if (lineIdx < para.lines.length - 1) {
              // Create a synthetic space item to separate lines
              const lastItem = line.items[line.items.length - 1];
              if (lastItem && !lastItem.str.endsWith(" ")) {
                allItems.push({
                  ...lastItem,
                  str: " ",
                  width: 0,
                  x: lastItem.x + lastItem.width,
                });
              }
            }
          }

          // Strip bullet/number prefix items
          let startIdx = 0;
          if (para.isBullet || para.isNumberedList) {
            // Find where the actual content starts (after the bullet/number marker)
            let accumulated = "";
            for (let i = 0; i < allItems.length; i++) {
              accumulated += allItems[i].str;
              if (para.isBullet) {
                if (/[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s/.test(accumulated)) {
                  startIdx = i + 1;
                  break;
                }
              } else if (para.isNumberedList) {
                if (/\d+[\.\)]\s/.test(accumulated)) {
                  startIdx = i + 1;
                  break;
                }
              }
            }
          }

          const contentItems = allItems.slice(startIdx);
          if (contentItems.length === 0 || contentItems.every((it) => !it.str.trim())) continue;

          // Build multi-run inline formatting
          const runs = buildInlineRuns(contentItems, page.links, TextRun, ExternalHyperlink, headingLevel);

          if (runs.length === 0) continue;

          const wordSize = headingLevel ? undefined : Math.round(para.fontSize * 2);

          // If all runs are plain TextRuns without specific formatting and heading,
          // apply paragraph-level size
          if (!headingLevel && wordSize) {
            for (const run of runs) {
              if (run instanceof TextRun) {
                // TextRun size is already set in buildInlineRuns
              }
            }
          }

          // Calculate spacing
          let spacingAfter = 120;
          if (bIdx < blocks.length - 1) {
            const nextBlock = blocks[bIdx + 1];
            if (nextBlock.type === "paragraph" && nextBlock.paragraph) {
              const gap = para.lines[para.lines.length - 1].y - nextBlock.paragraph.lines[0].y;
              if (gap > para.fontSize * 3) spacingAfter = 360;
              else if (gap > para.fontSize * 2) spacingAfter = 240;
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const paragraphOptions: any = {
            children: runs,
            heading: headingLevel,
            alignment,
            spacing: { after: spacingAfter },
            indent: para.indent > 10 ? { left: para.indent * 15 } : undefined,
          };

          if (para.isBullet) {
            paragraphOptions.bullet = { level: 0 };
          }

          docChildren.push(new Paragraph(paragraphOptions));
        }
      }

      // Page break between pages
      if (pageIdx < pages.length - 1) {
        docChildren.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }
    }

    if (docChildren.length === 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "No extractable text was found in this PDF. It may be a scanned document \u2014 OCR is not supported in the browser.",
              italics: true,
              color: "888888",
            }),
          ],
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          children: docChildren,
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
        },
      ],
    });

    return Packer.toBlob(doc);
  };

  // ---------- Multi-run inline formatting with hyperlinks ----------

  const buildInlineRuns = (
    items: TextItem[],
    links: LinkAnnotation[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TextRun: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ExternalHyperlink: any,
    headingLevel?: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any[] => {
    if (items.length === 0) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runs: any[] = [];

    // Group consecutive items with same formatting into runs
    let currentGroup: TextItem[] = [];
    let currentBold = items[0].isBold;
    let currentItalic = items[0].isItalic;
    let currentUnderline = items[0].isUnderline;
    let currentFontSize = items[0].fontSize;
    let currentColor = items[0].color;
    let currentLink = findLinkForItem(items[0], links);

    const flushGroup = () => {
      if (currentGroup.length === 0) return;
      const text = currentGroup.map((it) => it.str).join("");
      if (!text) return;

      const wordSize = headingLevel ? undefined : Math.round(currentFontSize * 2);
      const colorHex = currentColor ? colorToHex(currentColor) : undefined;

      const runOptions: Record<string, unknown> = {
        text,
        bold: currentBold || !!headingLevel,
        italics: currentItalic,
        size: wordSize,
        color: colorHex,
      };

      if (currentUnderline) {
        runOptions.underline = { type: "single" };
      }

      if (currentLink) {
        runs.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                ...runOptions,
                style: "Hyperlink",
              }),
            ],
            link: currentLink.url,
          })
        );
      } else {
        runs.push(new TextRun(runOptions));
      }

      currentGroup = [];
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemLink = findLinkForItem(item, links);
      const itemBold = item.isBold;
      const itemItalic = item.isItalic;
      const itemUnderline = item.isUnderline;
      const itemFontSize = item.fontSize;
      const itemColor = item.color;

      // Check if formatting changed
      const sameFormatting =
        itemBold === currentBold &&
        itemItalic === currentItalic &&
        itemUnderline === currentUnderline &&
        Math.abs(itemFontSize - currentFontSize) < 0.5 &&
        colorEqual(itemColor, currentColor) &&
        linkEqual(itemLink, currentLink);

      if (!sameFormatting && currentGroup.length > 0) {
        flushGroup();
        currentBold = itemBold;
        currentItalic = itemItalic;
        currentUnderline = itemUnderline;
        currentFontSize = itemFontSize;
        currentColor = itemColor;
        currentLink = itemLink;
      }

      currentGroup.push(item);
    }

    flushGroup();
    return runs;
  };

  const colorEqual = (
    a?: { r: number; g: number; b: number },
    b?: { r: number; g: number; b: number }
  ): boolean => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.r === b.r && a.g === b.g && a.b === b.b;
  };

  const linkEqual = (
    a?: LinkAnnotation,
    b?: LinkAnnotation
  ): boolean => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.url === b.url;
  };

  // ---------- Main conversion handler ----------

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setStatus("Loading PDF...");
    setError("");
    setWarning("");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      const totalPages = doc.numPages;

      // First pass: count total text items to detect scanned PDFs
      setStatus("Analyzing PDF content...");
      let totalTextItems = 0;
      for (let i = 1; i <= totalPages; i++) {
        const page = await doc.getPage(i);
        const textItems = await extractTextItems(page);
        totalTextItems += textItems.length;
      }

      const isScannedPdf = totalTextItems < 10;

      if (isScannedPdf) {
        setWarning(
          "This appears to be a scanned PDF. Pages will be embedded as images."
        );

        const pages: PageContent[] = [];
        for (let i = 1; i <= totalPages; i++) {
          setProgress(i);
          setStatus(`Rendering page ${i} of ${totalPages} as image...`);
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          const pageImage = await renderPageToImage(page);
          pages.push({
            paragraphs: [],
            tables: [],
            links: [],
            images: [pageImage],
            width: viewport.width,
            height: viewport.height,
          });
        }

        setStatus("Building DOCX file...");
        const blob = await buildDocx(pages);
        downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + ".docx");
        setStatus(
          `Done! Embedded ${totalPages} page${totalPages !== 1 ? "s" : ""} as images.`
        );
      } else {
        const pages: PageContent[] = [];
        for (let i = 1; i <= totalPages; i++) {
          setProgress(i);
          setStatus(
            quality === "full"
              ? `Extracting text, tables & images from page ${i} of ${totalPages}...`
              : `Extracting text from page ${i} of ${totalPages}...`
          );
          const page = await doc.getPage(i);
          const content = await extractPageContent(page, quality);
          pages.push(content);
        }

        const totalParagraphs = pages.reduce((s, p) => s + p.paragraphs.length, 0);
        const totalTables = pages.reduce((s, p) => s + p.tables.length, 0);
        const totalImages = pages.reduce((s, p) => s + p.images.length, 0);
        const totalLinks = pages.reduce((s, p) => s + p.links.length, 0);

        if (totalParagraphs === 0 && totalImages === 0 && totalTables === 0) {
          setError(
            "No text or images could be extracted. This PDF may be a scanned document \u2014 OCR is not supported in the browser."
          );
          setLoading(false);
          setProgress(0);
          return;
        }

        setStatus("Building DOCX file...");
        const blob = await buildDocx(pages);
        downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + ".docx");

        const parts: string[] = [];
        if (totalParagraphs > 0) parts.push(`${totalParagraphs} paragraph${totalParagraphs !== 1 ? "s" : ""}`);
        if (totalTables > 0) parts.push(`${totalTables} table${totalTables !== 1 ? "s" : ""}`);
        if (totalImages > 0) parts.push(`${totalImages} image${totalImages !== 1 ? "s" : ""}`);
        if (totalLinks > 0) parts.push(`${totalLinks} link${totalLinks !== 1 ? "s" : ""}`);
        setStatus(`Done! Extracted ${parts.join(", ")}.`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("PDF to DOCX error:", e);
      if (msg.includes("password") || msg.includes("encrypted")) {
        setError("This PDF is password-protected. Please remove the password first.");
      } else {
        setError("Conversion failed: " + msg);
      }
    }
    setLoading(false);
  };

  const accentColor = "#2563eb";
  const bgTint = "var(--bg-tertiary)";

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: bgTint }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">
                  {pageCount} page{pageCount !== 1 ? "s" : ""} &middot;{" "}
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPageCount(0);
                setProgress(0);
                setError("");
                setWarning("");
                setStatus("");
              }}
              disabled={loading}
              className="theme-text-muted text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Quality selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Conversion Quality
            </label>
            <div className="flex gap-2">
              {(
                [
                  { key: "fast" as QualityMode, label: "Fast", desc: "Text only" },
                  { key: "full" as QualityMode, label: "Full", desc: "Text + tables + images + links" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setQuality(opt.key)}
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    quality === opt.key
                      ? "text-white"
                      : "theme-bg-secondary theme-border theme-text-secondary hover:border-blue-300"
                  }`}
                  style={
                    quality === opt.key
                      ? { backgroundColor: accentColor, borderColor: accentColor }
                      : {}
                  }
                >
                  <div>{opt.label}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      quality === opt.key ? "text-blue-100" : "theme-text-muted"
                    }`}
                  >
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Warning message */}
          {warning && (
            <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
              <p className="text-sm text-yellow-700">{warning}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Progress */}
          {loading && (
            <div className="p-4 rounded-xl border theme-border" style={{ backgroundColor: bgTint }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: accentColor }}>
                  {status}
                </span>
                <span className="text-xs theme-text-secondary">
                  {progress} / {pageCount}
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    backgroundColor: accentColor,
                    width: `${pageCount > 0 ? (progress / pageCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Success status */}
          {!loading && status && !error && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
              <p className="text-sm text-green-700">{status}</p>
            </div>
          )}

          {/* Convert button */}
          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading ? { backgroundColor: accentColor } : {}}
          >
            {loading
              ? progress > 0
                ? `Converting page ${progress} of ${pageCount}...`
                : "Analyzing PDF..."
              : "Convert to Word Document"}
          </button>

          {/* Info note */}
          <p className="text-xs theme-text-muted text-center leading-relaxed">
            Works best with text-based PDFs. Extracts text formatting, tables, hyperlinks, and images.
            Scanned documents will be embedded as page images.
          </p>
        </div>
      )}
    </div>
  );
}
