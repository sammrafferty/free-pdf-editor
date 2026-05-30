"use client";
import { useState } from "react";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

/* ──────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */

interface TextItem {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  width: number;
  height: number;
  isBold: boolean;
  isItalic: boolean;
  hasEOL: boolean;
}

interface LinkAnnotation {
  url: string;
  rect: [number, number, number, number];
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
  fontSize: number;
  fontName: string;
  isBold: boolean;
  isItalic: boolean;
  indent: number;
  isBullet: boolean;
  bulletChar: string;
  isNumberedList: boolean;
  listNumber: string;
}

interface DetectedTable {
  rows: TextItem[][][]; // rows -> columns -> items
  startY: number;
  endY: number;
  columnBoundaries: number[];
}

interface PageContent {
  paragraphs: ParagraphGroup[];
  tables: DetectedTable[];
  links: LinkAnnotation[];
}

interface ConvertStats {
  headings: number;
  paragraphs: number;
  tables: number;
  links: number;
  lists: number;
}

type Status = "idle" | "working" | "done" | "error";

/* ──────────────────────────────────────────────────────────
   Text extraction (font-aware: size, bold, italic)
   ────────────────────────────────────────────────────────── */

async function extractTextItems(
  page: import("pdfjs-dist").PDFPageProxy
): Promise<TextItem[]> {
  const textContent = await page.getTextContent();
  const items: TextItem[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles = (textContent as any).styles as
    | Record<string, { fontFamily?: string }>
    | undefined;

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
    const fontSize =
      Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]) || Math.abs(tx[0]) || 12;
    const x = tx[4];
    const y = tx[5];

    const fontName = ti.fontName || "";
    const fontFamily = styles?.[fontName]?.fontFamily || "";
    const nameToCheck = fontName + " " + fontFamily;

    const isBold =
      /bold|black|heavy|demi|semibold/i.test(nameToCheck) ||
      /[-_]B($|[-_])/i.test(fontName) ||
      /,Bold/i.test(fontName);
    const isItalic =
      /italic|oblique|slant/i.test(nameToCheck) ||
      /[-_]I($|[-_])/i.test(fontName) ||
      /,Italic/i.test(fontName);

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
      hasEOL: ti.hasEOL,
    });
  }
  return items;
}

async function extractLinks(
  page: import("pdfjs-dist").PDFPageProxy
): Promise<LinkAnnotation[]> {
  const links: LinkAnnotation[] = [];
  try {
    const annotations = await page.getAnnotations();
    for (const ann of annotations) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = ann as any;
      if (a.subtype === "Link" && a.url && a.rect) {
        links.push({ url: a.url, rect: a.rect as [number, number, number, number] });
      }
    }
  } catch {
    // best-effort
  }
  return links;
}

/* ──────────────────────────────────────────────────────────
   Line grouping
   ────────────────────────────────────────────────────────── */

function buildLineGroup(items: TextItem[]): LineGroup {
  const text = items.map((it) => it.str).join("");
  const avgFontSize =
    items.reduce((s, it) => s + it.fontSize, 0) / items.length;
  return {
    items,
    y: items[0].y,
    minX: Math.min(...items.map((it) => it.x)),
    maxX: Math.max(...items.map((it) => it.x + it.width)),
    avgFontSize,
    text,
  };
}

function groupItemsIntoLines(items: TextItem[]): LineGroup[] {
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
}

/* ──────────────────────────────────────────────────────────
   Multi-column detection (read each column top-to-bottom)
   ────────────────────────────────────────────────────────── */

function detectColumns(items: TextItem[], pageWidth: number): TextItem[][] {
  if (items.length === 0) return [[]];

  const binSize = Math.max(1, pageWidth / 200);
  const numBins = Math.ceil(pageWidth / binSize) + 1;
  const histogram = new Array(numBins).fill(0);

  for (const item of items) {
    const bin = Math.floor(item.x / binSize);
    if (bin >= 0 && bin < numBins) histogram[bin]++;
    const endBin = Math.floor((item.x + item.width) / binSize);
    for (let b = bin; b <= Math.min(endBin, numBins - 1); b++) histogram[b]++;
  }

  const gapThreshold = Math.max(1, items.length * 0.01);
  const gaps: { center: number }[] = [];
  let gapStart = -1;

  for (let b = 0; b < numBins; b++) {
    if (histogram[b] <= gapThreshold) {
      if (gapStart === -1) gapStart = b;
    } else {
      if (gapStart !== -1) {
        const gapWidthPx = (b - gapStart) * binSize;
        const gapCenterPx = ((gapStart + b) / 2) * binSize;
        if (
          gapWidthPx > pageWidth * 0.05 &&
          gapCenterPx > pageWidth * 0.1 &&
          gapCenterPx < pageWidth * 0.9
        ) {
          gaps.push({ center: gapCenterPx });
        }
        gapStart = -1;
      }
    }
  }

  if (gaps.length === 0) return [items];

  const boundaries = gaps.map((g) => g.center);
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
}

function groupIntoLines(items: TextItem[], pageWidth: number): LineGroup[] {
  if (items.length === 0) return [];
  const columns = detectColumns(items, pageWidth);
  const allLines: LineGroup[] = [];
  for (const colItems of columns) {
    allLines.push(...groupItemsIntoLines(colItems));
  }
  return allLines;
}

/* ──────────────────────────────────────────────────────────
   Paragraph + list grouping
   ────────────────────────────────────────────────────────── */

const isBulletLine = (text: string): boolean =>
  /^\s*[•\-*•‣◦⁃∙]\s/.test(text);
const isNumberedLine = (text: string): boolean => /^\s*\d+[.)]\s/.test(text);

function buildParagraph(
  lines: LineGroup[],
  bodyLeftMargin: number
): ParagraphGroup {
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
    const match = text.match(/^\s*([•\-*•‣◦⁃∙])\s/);
    bulletChar = match ? match[1] : "•";
  }
  if (numbered) {
    const match = text.match(/^\s*(\d+[.)])\s/);
    listNumber = match ? match[1] : "";
  }

  return {
    lines,
    fontSize,
    fontName,
    isBold,
    isItalic,
    indent: indent > 10 ? indent : 0,
    isBullet: bullet,
    bulletChar,
    isNumberedList: numbered,
    listNumber,
  };
}

function groupIntoParagraphs(lines: LineGroup[]): ParagraphGroup[] {
  if (lines.length === 0) return [];

  const leftCounts: Record<number, number> = {};
  lines.forEach((l) => {
    const rounded = Math.round(l.minX / 5) * 5;
    leftCounts[rounded] = (leftCounts[rounded] || 0) + 1;
  });
  const bodyLeftMargin = Number(
    Object.entries(leftCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 0
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
      paragraphs.push(buildParagraph(currentLines, bodyLeftMargin));
      currentLines = [currLine];
    } else {
      currentLines.push(currLine);
    }
  }
  if (currentLines.length > 0) {
    paragraphs.push(buildParagraph(currentLines, bodyLeftMargin));
  }
  return paragraphs;
}

/* ──────────────────────────────────────────────────────────
   Table detection (histogram column clustering + scoring)
   ────────────────────────────────────────────────────────── */

function buildTable(
  tableLines: LineGroup[],
  columnBoundaries: number[]
): DetectedTable {
  const sortedBounds = [...columnBoundaries].sort((a, b) => a - b);
  const rows: TextItem[][][] = [];
  for (const line of tableLines) {
    const row: TextItem[][] = sortedBounds.map(() => []);
    for (const item of line.items) {
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
}

function isLikelyTable(
  candidateLines: LineGroup[],
  colBounds: number[]
): boolean {
  const tempTable = buildTable(candidateLines, colBounds);
  const allCellWordCounts: number[] = [];
  const rowNonEmptyCounts: number[] = [];
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

  const sortedWords = [...allCellWordCounts].sort((a, b) => a - b);
  const medianWords = sortedWords[Math.floor(sortedWords.length / 2)];
  if (medianWords < 5) score += 2;
  else if (medianWords <= 10) score += 1;
  else if (medianWords <= 15) score -= 1;
  else score -= 3;

  const avgNonEmpty =
    rowNonEmptyCounts.reduce((s, v) => s + v, 0) / rowNonEmptyCounts.length;
  const variance =
    rowNonEmptyCounts.reduce((s, v) => s + (v - avgNonEmpty) ** 2, 0) /
    rowNonEmptyCounts.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev < 0.5) score += 2;
  else if (stdDev > 1.5) score -= 2;

  const avgWords =
    allCellWordCounts.reduce((s, v) => s + v, 0) / allCellWordCounts.length;
  if (colBounds.length === 2 && avgWords > 10) score -= 3;

  for (const lengths of columnTextLengths) {
    const nonZero = lengths.filter((l) => l > 0);
    if (nonZero.length < 2) continue;
    const mean = nonZero.reduce((s, v) => s + v, 0) / nonZero.length;
    if (mean === 0) continue;
    const colVariance =
      nonZero.reduce((s, v) => s + (v - mean) ** 2, 0) / nonZero.length;
    const cv = Math.sqrt(colVariance) / mean;
    if (cv < 0.5) score += 1;
    else if (cv > 1.0) score -= 1;
  }

  return score >= 0;
}

function detectTables(
  items: TextItem[],
  pageWidth: number
): { tables: DetectedTable[]; nonTableItems: TextItem[] } {
  if (items.length < 6) return { tables: [], nonTableItems: items };

  const lines = groupItemsIntoLines(items);
  if (lines.length < 2) return { tables: [], nonTableItems: items };

  const lineXPositions: { line: LineGroup; xStarts: number[] }[] = [];
  for (const line of lines) {
    const sortedItems = [...line.items].sort((a, b) => a.x - b.x);
    const segments: { startX: number; endX: number }[] = [];
    let segStart = sortedItems[0].x;
    let segEnd = sortedItems[0].x + sortedItems[0].width;

    for (let i = 1; i < sortedItems.length; i++) {
      const gap = sortedItems[i].x - segEnd;
      if (gap > line.avgFontSize * 1.5) {
        segments.push({ startX: segStart, endX: segEnd });
        segStart = sortedItems[i].x;
      }
      segEnd = Math.max(segEnd, sortedItems[i].x + sortedItems[i].width);
    }
    segments.push({ startX: segStart, endX: segEnd });

    if (segments.length >= 2) {
      lineXPositions.push({ line, xStarts: segments.map((s) => s.startX) });
    }
  }

  if (lineXPositions.length < 2) return { tables: [], nonTableItems: items };

  const allXStarts: number[] = [];
  for (const lp of lineXPositions) allXStarts.push(...lp.xStarts);

  const tolerance = pageWidth * 0.02;
  const xClusters: { center: number; count: number }[] = [];
  const sortedXStarts = [...allXStarts].sort((a, b) => a - b);

  for (const x of sortedXStarts) {
    const existing = xClusters.find((c) => Math.abs(x - c.center) < tolerance);
    if (existing) {
      existing.center =
        (existing.center * existing.count + x) / (existing.count + 1);
      existing.count++;
    } else {
      xClusters.push({ center: x, count: 1 });
    }
  }

  const minLines = Math.max(2, lineXPositions.length * 0.3);
  const significantClusters = xClusters
    .filter((c) => c.count >= minLines)
    .sort((a, b) => a.center - b.center);

  if (significantClusters.length < 2) return { tables: [], nonTableItems: items };

  const columnBoundaries = significantClusters.map((c) => c.center);

  const tableLines: LineGroup[] = [];
  const nonTableLines: LineGroup[] = [];

  for (const lp of lineXPositions) {
    let matchingColumns = 0;
    for (const xs of lp.xStarts) {
      if (columnBoundaries.some((cb) => Math.abs(xs - cb) < tolerance * 2)) {
        matchingColumns++;
      }
    }
    if (matchingColumns >= 2) tableLines.push(lp.line);
    else nonTableLines.push(lp.line);
  }

  const lineXPosSet = new Set(lineXPositions.map((lp) => lp.line));
  for (const line of lines) {
    if (!lineXPosSet.has(line)) nonTableLines.push(line);
  }

  if (tableLines.length < 2) return { tables: [], nonTableItems: items };

  const sortedTableLines = [...tableLines].sort((a, b) => b.y - a.y);
  const tables: DetectedTable[] = [];
  let currentTableLines: LineGroup[] = [sortedTableLines[0]];

  for (let i = 1; i < sortedTableLines.length; i++) {
    const gap =
      currentTableLines[currentTableLines.length - 1].y - sortedTableLines[i].y;
    const avgSize = sortedTableLines[i].avgFontSize;
    if (gap > avgSize * 3) {
      if (
        currentTableLines.length >= 2 &&
        isLikelyTable(currentTableLines, columnBoundaries)
      ) {
        tables.push(buildTable(currentTableLines, columnBoundaries));
      }
      currentTableLines = [sortedTableLines[i]];
    } else {
      currentTableLines.push(sortedTableLines[i]);
    }
  }
  if (
    currentTableLines.length >= 2 &&
    isLikelyTable(currentTableLines, columnBoundaries)
  ) {
    tables.push(buildTable(currentTableLines, columnBoundaries));
  }

  const tableItemSet = new Set<TextItem>();
  for (const table of tables) {
    for (const row of table.rows) {
      for (const col of row) {
        for (const item of col) tableItemSet.add(item);
      }
    }
  }
  const nonTableItems = items.filter((it) => !tableItemSet.has(it));
  return { tables, nonTableItems };
}

/* ──────────────────────────────────────────────────────────
   Per-page content
   ────────────────────────────────────────────────────────── */

async function extractPageContent(
  page: import("pdfjs-dist").PDFPageProxy
): Promise<PageContent> {
  const viewport = page.getViewport({ scale: 1 });
  const pageWidth = viewport.width;

  const textItems = await extractTextItems(page);
  const links = await extractLinks(page);

  const { tables, nonTableItems } = detectTables(textItems, pageWidth);
  const lines = groupIntoLines(nonTableItems, pageWidth);
  const paragraphs = groupIntoParagraphs(lines);

  return { paragraphs, tables, links };
}

/* ──────────────────────────────────────────────────────────
   Markdown serialization
   ────────────────────────────────────────────────────────── */

function findLinkForItem(
  item: TextItem,
  links: LinkAnnotation[]
): LinkAnnotation | undefined {
  if (links.length === 0) return undefined;
  const cx = item.x + item.width / 2;
  const cy = item.y;
  for (const link of links) {
    const [x1, y1, x2, y2] = link.rect;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    if (cx >= minX - 2 && cx <= maxX + 2 && cy >= minY - 2 && cy <= maxY + 2) {
      return link;
    }
  }
  return undefined;
}

// Escape characters that would otherwise be interpreted as Markdown syntax.
// Intentionally minimal — GFM does not treat intra-word underscores as
// emphasis, so leaving `_` alone keeps output readable.
function escapeInline(s: string): string {
  return s.replace(/([\\`*])/g, "\\$1");
}

function emphasize(text: string, bold: boolean, italic: boolean): string {
  if (!text || (!bold && !italic)) return text;
  const lead = text.match(/^\s*/)?.[0] ?? "";
  const trail = text.match(/\s*$/)?.[0] ?? "";
  const core = text.slice(lead.length, text.length - trail.length);
  if (!core) return text;
  const marker = bold && italic ? "***" : bold ? "**" : "*";
  return `${lead}${marker}${core}${marker}${trail}`;
}

// Convert a run of text items into inline Markdown, grouping consecutive
// items that share formatting + link target into single emphasis/link spans.
function inlineFromItems(
  items: TextItem[],
  links: LinkAnnotation[],
  plain = false
): string {
  let out = "";
  let i = 0;
  while (i < items.length) {
    const start = items[i];
    const bold = plain ? false : start.isBold;
    const italic = plain ? false : start.isItalic;
    const link = findLinkForItem(start, links);

    let text = "";
    while (i < items.length) {
      const it = items[i];
      const itBold = plain ? false : it.isBold;
      const itItalic = plain ? false : it.isItalic;
      const itLink = findLinkForItem(it, links);
      if (itBold !== bold || itItalic !== italic || itLink?.url !== link?.url) {
        break;
      }
      text += it.str;
      i++;
    }

    let piece = emphasize(escapeInline(text), bold, italic);
    if (link) piece = `[${piece}](${link.url})`;
    out += piece;
  }
  return out;
}

const normalizeInline = (s: string): string =>
  s.replace(/[ \t ]+/g, " ").trim();

// Prevent body text from being mistaken for block-level Markdown syntax.
function guardLineStart(s: string): string {
  return s
    .replace(/^(\s*)([#>|])/, "$1\\$2")
    .replace(/^(\s*)(\d+)([.)])(\s)/, "$1$2\\$3$4")
    .replace(/^(\s*)([-+])(\s)/, "$1\\$2$3");
}

// Flatten a paragraph's lines into one item list, inserting synthetic spaces
// at soft line breaks, and strip any leading bullet/number marker items.
function paragraphContentItems(para: ParagraphGroup): TextItem[] {
  const allItems: TextItem[] = [];
  for (let lineIdx = 0; lineIdx < para.lines.length; lineIdx++) {
    const line = para.lines[lineIdx];
    allItems.push(...line.items);
    if (lineIdx < para.lines.length - 1) {
      const lastItem = line.items[line.items.length - 1];
      if (lastItem && !lastItem.str.endsWith(" ")) {
        allItems.push({ ...lastItem, str: " ", width: 0, x: lastItem.x + lastItem.width });
      }
    }
  }

  if (!para.isBullet && !para.isNumberedList) return allItems;

  // Strip exactly the leading marker ("• ", "- ", "1. ", etc.) by character
  // count. pdf.js may emit the marker as its own text item OR inline with the
  // text, so we trim N characters across the leading items rather than dropping
  // whole items (which would delete the content when marker + text share one item).
  const fullText = allItems.map((it) => it.str).join("");
  const markerMatch = para.isBullet
    ? fullText.match(/^\s*[•\-*‣◦⁃∙]\s+/)
    : fullText.match(/^\s*\d+[.)]\s+/);
  if (!markerMatch) return allItems;

  let toTrim = markerMatch[0].length;
  const result: TextItem[] = [];
  for (const it of allItems) {
    if (toTrim <= 0) {
      result.push(it);
    } else if (it.str.length <= toTrim) {
      toTrim -= it.str.length;
    } else {
      result.push({ ...it, str: it.str.slice(toTrim) });
      toTrim = 0;
    }
  }
  return result;
}

function tableToMarkdown(table: DetectedTable, links: LinkAnnotation[]): string {
  const numCols = table.columnBoundaries.length;
  if (numCols === 0) return "";

  const cellText = (items: TextItem[]): string =>
    normalizeInline(inlineFromItems(items, links))
      .replace(/\|/g, "\\|")
      .trim() || " ";

  const rowStrings = table.rows.map((row) => {
    const cells: string[] = [];
    for (let c = 0; c < numCols; c++) {
      cells.push(cellText(c < row.length ? row[c] : []));
    }
    return `| ${cells.join(" | ")} |`;
  });

  if (rowStrings.length === 0) return "";
  const separator = `| ${Array(numCols).fill("---").join(" | ")} |`;
  return [rowStrings[0], separator, ...rowStrings.slice(1)].join("\n");
}

interface Block {
  md: string;
  kind: "block" | "list";
  y: number;
}

function headingLevel(fontSize: number, bodySize: number, isBold: boolean): number {
  const ratio = fontSize / bodySize;
  if (ratio >= 2.0) return 1;
  if (ratio >= 1.6) return 2;
  if (ratio >= 1.3) return 3;
  if (ratio >= 1.15 && isBold) return 4;
  return 0;
}

function buildMarkdown(
  pages: PageContent[]
): { markdown: string; stats: ConvertStats } {
  // Most common rounded font size = body text size.
  const sizeFreq: Record<number, number> = {};
  for (const page of pages) {
    for (const p of page.paragraphs) {
      const rounded = Math.round(p.fontSize);
      sizeFreq[rounded] = (sizeFreq[rounded] || 0) + 1;
    }
  }
  const bodySize = Number(
    Object.entries(sizeFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 12
  );

  const stats: ConvertStats = {
    headings: 0,
    paragraphs: 0,
    tables: 0,
    links: 0,
    lists: 0,
  };

  const finalBlocks: Block[] = [];

  for (const page of pages) {
    const pageBlocks: Block[] = [];

    for (const para of page.paragraphs) {
      const contentItems = paragraphContentItems(para);
      if (contentItems.length === 0 || contentItems.every((it) => !it.str.trim())) {
        continue;
      }
      const y = para.lines[0]?.y || 0;
      const level = para.isBullet || para.isNumberedList
        ? 0
        : headingLevel(para.fontSize, bodySize, para.isBold);

      if (level > 0) {
        const text = normalizeInline(inlineFromItems(contentItems, page.links, true));
        if (!text) continue;
        pageBlocks.push({ md: `${"#".repeat(level)} ${text}`, kind: "block", y });
        stats.headings++;
      } else if (para.isBullet) {
        const text = normalizeInline(inlineFromItems(contentItems, page.links));
        if (!text) continue;
        const depth = Math.min(Math.round(para.indent / 24), 3);
        pageBlocks.push({ md: `${"  ".repeat(depth)}- ${text}`, kind: "list", y });
        stats.lists++;
      } else if (para.isNumberedList) {
        const text = normalizeInline(inlineFromItems(contentItems, page.links));
        if (!text) continue;
        const depth = Math.min(Math.round(para.indent / 24), 3);
        const marker = para.listNumber || "1.";
        pageBlocks.push({ md: `${"  ".repeat(depth)}${marker} ${text}`, kind: "list", y });
        stats.lists++;
      } else {
        const text = normalizeInline(inlineFromItems(contentItems, page.links));
        if (!text) continue;
        pageBlocks.push({ md: guardLineStart(text), kind: "block", y });
        stats.paragraphs++;
      }
    }

    for (const table of page.tables) {
      const md = tableToMarkdown(table, page.links);
      if (md) {
        pageBlocks.push({ md, kind: "block", y: table.startY });
        stats.tables++;
      }
    }

    // Top of page first (PDF y grows upward).
    pageBlocks.sort((a, b) => b.y - a.y);
    finalBlocks.push(...pageBlocks);
  }

  stats.links = pages.reduce((s, p) => s + p.links.length, 0);

  let out = "";
  for (let i = 0; i < finalBlocks.length; i++) {
    const block = finalBlocks[i];
    if (i === 0) {
      out = block.md;
      continue;
    }
    const prev = finalBlocks[i - 1];
    const tight = prev.kind === "list" && block.kind === "list";
    out += (tight ? "\n" : "\n\n") + block.md;
  }

  return { markdown: out.trim() + "\n", stats };
}

/* ──────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────── */

const PREVIEW_LIMIT = 60000;

export default function PdfToMarkdownTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [statusText, setStatusText] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [stats, setStats] = useState<ConvertStats | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setProgress(0);
    setStatus("idle");
    setStatusText("");
    setMarkdown("");
    setStats(null);
    setError("");
    setCopied(false);
  };

  const handleFile = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    setFile(f);
    setError("");
    setMarkdown("");
    setStats(null);
    setCopied(false);
    setProgress(0);
    setStatus("working");
    setStatusText("Loading PDF...");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const buf = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      const totalPages = doc.numPages;
      setPageCount(totalPages);

      const pages: PageContent[] = [];
      let totalItems = 0;
      for (let i = 1; i <= totalPages; i++) {
        setProgress(i);
        setStatusText(`Extracting page ${i} of ${totalPages}...`);
        const page = await doc.getPage(i);
        const content = await extractPageContent(page);
        pages.push(content);
        totalItems +=
          content.paragraphs.reduce(
            (s, p) => s + p.lines.reduce((ss, l) => ss + l.items.length, 0),
            0
          ) +
          content.tables.reduce(
            (s, t) =>
              s +
              t.rows.reduce(
                (rs, r) => rs + r.reduce((cs, c) => cs + c.length, 0),
                0
              ),
            0
          );
      }

      if (totalItems < 8) {
        setStatus("error");
        setError(
          "This looks like a scanned (image-only) PDF. There is no selectable text to convert to Markdown, and OCR is not supported in the browser."
        );
        return;
      }

      setStatusText("Building Markdown...");
      const { markdown: md, stats: s } = buildMarkdown(pages);

      setMarkdown(md);
      setStats(s);
      setStatus("done");

      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      downloadBlob(blob, f.name.replace(/\.pdf$/i, "") + ".md");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("password") || msg.includes("encrypted")) {
        setError("This PDF is password-protected. Please remove the password first.");
      } else {
        setError("Could not convert this PDF. It may be corrupted.");
      }
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!file || !markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + ".md");
  };

  const handleCopy = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy to clipboard. Use the Download button instead.");
    }
  };

  const accentColor = "#818cf8";
  const bgTint = "var(--bg-tertiary)";
  const previewTruncated = markdown.length > PREVIEW_LIMIT;

  if (!file) {
    return (
      <Dropzone
        onFiles={handleFile}
        label="Drop a PDF to convert to Markdown"
      />
    );
  }

  return (
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
              {pageCount > 0 && (
                <>
                  {pageCount} page{pageCount !== 1 ? "s" : ""} &middot;{" "}
                </>
              )}
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        </div>
        <button
          onClick={reset}
          disabled={status === "working"}
          className="theme-text-muted text-sm font-medium"
        >
          Remove
        </button>
      </div>

      {/* Progress */}
      {status === "working" && (
        <div
          className="p-4 rounded-xl border theme-border"
          style={{ backgroundColor: bgTint }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: accentColor }}>
              {statusText}
            </span>
            {pageCount > 0 && (
              <span className="text-xs theme-text-secondary">
                {progress} / {pageCount}
              </span>
            )}
          </div>
          <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                backgroundColor: accentColor,
                width: `${pageCount > 0 ? (progress / pageCount) * 100 : 10}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {status === "done" && markdown && (
        <>
          <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
            <p className="text-sm text-green-700">
              Done! Your Markdown file has been downloaded
              {stats && (
                <>
                  {" "}
                  — {describeStats(stats)}
                </>
              )}
              .
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 text-white rounded-xl font-semibold text-sm transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              Download .md
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 py-3 rounded-xl font-semibold text-sm theme-bg-secondary theme-border border theme-text-secondary transition-colors"
            >
              {copied ? "Copied!" : "Copy Markdown"}
            </button>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Preview
            </label>
            <pre
              className="text-xs leading-relaxed rounded-xl border theme-border p-4 overflow-auto whitespace-pre-wrap break-words"
              style={{
                backgroundColor: bgTint,
                color: "var(--text-secondary)",
                maxHeight: 360,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              }}
            >
              {previewTruncated ? markdown.slice(0, PREVIEW_LIMIT) : markdown}
              {previewTruncated && (
                <span className="theme-text-muted">
                  {"\n\n… preview truncated. Download the file for the full Markdown."}
                </span>
              )}
            </pre>
          </div>
        </>
      )}

      {/* Info note */}
      <p className="text-xs theme-text-muted text-center leading-relaxed">
        Conversion runs entirely in your browser — your PDF never leaves your device.
        Headings, bold/italic text, links, lists, and tables are detected automatically.
        Works best with text-based PDFs; scanned documents need OCR first.
      </p>
    </div>
  );
}

function describeStats(stats: ConvertStats): string {
  const parts: string[] = [];
  if (stats.headings > 0)
    parts.push(`${stats.headings} heading${stats.headings !== 1 ? "s" : ""}`);
  if (stats.paragraphs > 0)
    parts.push(`${stats.paragraphs} paragraph${stats.paragraphs !== 1 ? "s" : ""}`);
  if (stats.lists > 0)
    parts.push(`${stats.lists} list item${stats.lists !== 1 ? "s" : ""}`);
  if (stats.tables > 0)
    parts.push(`${stats.tables} table${stats.tables !== 1 ? "s" : ""}`);
  if (stats.links > 0)
    parts.push(`${stats.links} link${stats.links !== 1 ? "s" : ""}`);
  if (parts.length === 0) return "no structured content detected";
  return parts.join(", ");
}
