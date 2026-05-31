"use client";
import { useMemo, useRef, useState } from "react";
import { downloadBlob } from "@/app/lib/pdfHelpers";

/* ──────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */

interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strike?: boolean;
  href?: string;
}

interface RawItem {
  text: string;
  depth: number;
  ordered: boolean;
}

interface MarkedItem extends RawItem {
  marker: string;
}

type Block =
  | { type: "heading"; level: number; runs: Run[] }
  | { type: "paragraph"; runs: Run[] }
  | { type: "list"; items: RawItem[] }
  | { type: "code"; lang: string; text: string }
  | { type: "blockquote"; paragraphs: Run[][] }
  | { type: "hr" }
  | { type: "table"; header: string[]; aligns: string[]; rows: string[][] };

type FontFamily = "sans" | "serif" | "mono";
type PageSize = "letter" | "a4";
type MarginSize = "narrow" | "normal" | "wide";

/* ──────────────────────────────────────────────────────────
   Inline parsing (bold / italic / code / strike / links)
   ────────────────────────────────────────────────────────── */

function parseInline(src: string): Run[] {
  const runs: Run[] = [];
  let buf = "";
  let bold = false;
  let italic = false;
  let strike = false;
  const flush = () => {
    if (buf) {
      runs.push({ text: buf, bold, italic, strike });
      buf = "";
    }
  };
  const isAlnum = (ch: string | undefined) => !!ch && /[A-Za-z0-9]/.test(ch);

  let i = 0;
  while (i < src.length) {
    const c = src[i];

    // Backslash escape
    if (c === "\\" && i + 1 < src.length) {
      buf += src[i + 1];
      i += 2;
      continue;
    }

    // Inline code
    if (c === "`") {
      const end = src.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        runs.push({ text: src.slice(i + 1, end), code: true });
        i = end + 1;
        continue;
      }
    }

    // Image -> render alt text only (PDFs stay text-clean)
    if (c === "!" && src[i + 1] === "[") {
      const m = /^!\[([^\]]*)\]\([^)]*\)/.exec(src.slice(i));
      if (m) {
        buf += m[1];
        i += m[0].length;
        continue;
      }
    }

    // Link
    if (c === "[") {
      const m = /^\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/.exec(src.slice(i));
      if (m) {
        flush();
        runs.push({ text: m[1], href: m[2], bold, italic });
        i += m[0].length;
        continue;
      }
    }

    // Strikethrough
    if (c === "~" && src[i + 1] === "~") {
      flush();
      strike = !strike;
      i += 2;
      continue;
    }

    // Emphasis with *
    if (c === "*") {
      let n = 1;
      while (src[i + n] === "*") n++;
      flush();
      if (n >= 3) {
        bold = !bold;
        italic = !italic;
      } else if (n === 2) {
        bold = !bold;
      } else {
        italic = !italic;
      }
      i += n;
      continue;
    }

    // Emphasis with _ (ignore intra-word underscores, e.g. snake_case)
    if (c === "_") {
      let n = 1;
      while (src[i + n] === "_") n++;
      const prev = src[i - 1];
      const next = src[i + n];
      if (isAlnum(prev) && isAlnum(next)) {
        buf += "_".repeat(n);
        i += n;
        continue;
      }
      flush();
      if (n >= 3) {
        bold = !bold;
        italic = !italic;
      } else if (n === 2) {
        bold = !bold;
      } else {
        italic = !italic;
      }
      i += n;
      continue;
    }

    buf += c;
    i++;
  }
  flush();
  return runs;
}

function stripInline(src: string): string {
  return parseInline(src)
    .map((r) => r.text)
    .join("");
}

/* ──────────────────────────────────────────────────────────
   Block parsing
   ────────────────────────────────────────────────────────── */

const LIST_ITEM_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const HR_RE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const HEADING_RE = /^(\s{0,3})(#{1,6})\s+(.*?)\s*#*\s*$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/;

function splitTableRow(row: string): string[] {
  let r = row.trim();
  if (r.startsWith("|")) r = r.slice(1);
  if (r.endsWith("|")) r = r.slice(0, -1);
  return r.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|").trim());
}

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank
    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code block
    const fence = line.match(/^(\s*)(```|~~~)(.*)$/);
    if (fence) {
      const marker = fence[2];
      const lang = fence[3].trim();
      const buf: string[] = [];
      i++;
      const closeRe = new RegExp("^\\s*" + marker);
      while (i < lines.length && !closeRe.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: "code", lang, text: buf.join("\n") });
      continue;
    }

    // Horizontal rule
    if (HR_RE.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // ATX heading
    const h = line.match(HEADING_RE);
    if (h) {
      blocks.push({
        type: "heading",
        level: h[2].length,
        runs: parseInline(h[3]),
      });
      i++;
      continue;
    }

    // Blockquote
    if (/^\s*>/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      const paras: Run[][] = [];
      let acc: string[] = [];
      const pushAcc = () => {
        const joined = acc.join(" ").trim();
        if (joined) paras.push(parseInline(joined));
        acc = [];
      };
      for (const bl of buf) {
        if (!bl.trim()) pushAcc();
        else acc.push(bl);
      }
      pushAcc();
      blocks.push({ type: "blockquote", paragraphs: paras });
      continue;
    }

    // Table (header row followed by a separator row)
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      lines[i + 1].includes("-") &&
      TABLE_SEP_RE.test(lines[i + 1])
    ) {
      const header = splitTableRow(line);
      const aligns = splitTableRow(lines[i + 1]).map((s) => {
        const l = s.startsWith(":");
        const r = s.endsWith(":");
        if (l && r) return "center";
        if (r) return "right";
        return "left";
      });
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim() && lines[j].includes("|")) {
        rows.push(splitTableRow(lines[j]));
        j++;
      }
      blocks.push({ type: "table", header, aligns, rows });
      i = j;
      continue;
    }

    // List
    if (LIST_ITEM_RE.test(line)) {
      const items: RawItem[] = [];
      while (i < lines.length) {
        const lm = lines[i].match(LIST_ITEM_RE);
        if (lm) {
          const indent = lm[1].replace(/\t/g, "    ").length;
          const depth = Math.min(Math.floor(indent / 2), 5);
          const ordered = /\d/.test(lm[2]);
          items.push({ text: lm[3], depth, ordered });
          i++;
        } else if (lines[i].trim() && /^\s+\S/.test(lines[i]) && items.length) {
          items[items.length - 1].text += " " + lines[i].trim();
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "list", items });
      continue;
    }

    // Paragraph
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !HEADING_RE.test(lines[i]) &&
      !/^(\s*)(```|~~~)/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !LIST_ITEM_RE.test(lines[i]) &&
      !HR_RE.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: "paragraph", runs: parseInline(buf.join(" ")) });
  }

  return blocks;
}

/* ──────────────────────────────────────────────────────────
   List markers (shared by preview + PDF)
   ────────────────────────────────────────────────────────── */

const BULLETS = ["•", "◦", "▪"];

function withMarkers(items: RawItem[]): MarkedItem[] {
  const counters: number[] = [];
  const out: MarkedItem[] = [];
  for (const it of items) {
    const d = it.depth;
    for (let k = d + 1; k < counters.length; k++) counters[k] = 0;
    if (it.ordered) {
      counters[d] = (counters[d] || 0) + 1;
      out.push({ ...it, marker: counters[d] + "." });
    } else {
      out.push({ ...it, marker: BULLETS[Math.min(d, BULLETS.length - 1)] });
    }
  }
  return out;
}

/* ──────────────────────────────────────────────────────────
   Settings helpers
   ────────────────────────────────────────────────────────── */

const PDF_FAMILY: Record<FontFamily, string> = {
  sans: "helvetica",
  serif: "times",
  mono: "courier",
};

const CSS_FAMILY: Record<FontFamily, string> = {
  sans: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", Times, serif',
  mono: '"SFMono-Regular", Menlo, Consolas, monospace',
};

const MARGIN_PT: Record<MarginSize, number> = {
  narrow: 36,
  normal: 54,
  wide: 72,
};

// Real page dimensions in PDF points (1pt = 1/72in). Used to scale the
// on-screen preview so it is a faithful miniature of the printed page.
const PAGE_PT: Record<PageSize, { w: number; h: number }> = {
  letter: { w: 612, h: 792 },
  a4: { w: 595.28, h: 841.89 },
};

// On-screen width (px) of the simulated sheet of paper in the preview.
const PREVIEW_PAGE_WIDTH = 460;

const HEADING_SCALE = [2.0, 1.6, 1.35, 1.15, 1.0, 0.92];
const ACCENT = "#818cf8";
const ACCENT_RGB: [number, number, number] = [129, 140, 248];

interface Settings {
  family: FontFamily;
  size: number;
  lineHeight: number;
  page: PageSize;
  margin: MarginSize;
}

/* ──────────────────────────────────────────────────────────
   PDF generation
   ────────────────────────────────────────────────────────── */

async function generatePdf(markdown: string, s: Settings): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: s.page });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const MARGIN = MARGIN_PT[s.margin];
  const contentWidth = pageW - MARGIN * 2;
  const family = PDF_FAMILY[s.family];
  const baseSize = s.size;
  const lhFactor = s.lineHeight;

  const cur = { y: MARGIN + baseSize };

  const ensureSpace = (needed: number) => {
    if (cur.y + needed > pageH - MARGIN) {
      doc.addPage();
      cur.y = MARGIN + baseSize;
    }
  };

  const fontStyle = (bold: boolean, italic: boolean) =>
    bold && italic ? "bolditalic" : bold ? "bold" : italic ? "italic" : "normal";

  interface DrawOpts {
    x?: number;
    width?: number;
    size?: number;
    color?: [number, number, number];
    forceBold?: boolean;
  }

  // Lay out a sequence of styled runs with word wrapping + page breaks.
  function drawRuns(runs: Run[], opts: DrawOpts = {}) {
    const x = opts.x ?? MARGIN;
    const maxWidth = opts.width ?? contentWidth;
    const size = opts.size ?? baseSize;
    const color = opts.color ?? [25, 25, 30];
    const forceBold = opts.forceBold ?? false;
    const lh = size * lhFactor;

    type Tok = { text: string; space: boolean; run: Run };
    const toks: Tok[] = [];
    for (const r of runs) {
      const segs = r.text.split(/(\s+)/);
      for (const seg of segs) {
        if (seg === "") continue;
        const space = /^\s+$/.test(seg);
        toks.push({ text: space ? " " : seg, space, run: r });
      }
    }

    const applyFont = (run: Run) => {
      const fam = run.code ? "courier" : family;
      doc.setFont(fam, fontStyle(!!run.bold || forceBold, !!run.italic));
      doc.setFontSize(size);
    };

    doc.setFont(family, "normal");
    doc.setFontSize(size);
    const spaceW = doc.getTextWidth(" ");

    let lineToks: Tok[] = [];
    let lineW = 0;

    const flushLine = () => {
      while (lineToks.length && lineToks[lineToks.length - 1].space) lineToks.pop();
      if (lineToks.length === 0) {
        lineW = 0;
        return;
      }
      ensureSpace(lh);
      let cx = x;
      for (const t of lineToks) {
        if (t.space) {
          cx += spaceW;
          continue;
        }
        applyFont(t.run);
        const w = doc.getTextWidth(t.text);
        const isLink = !!t.run.href;
        if (t.run.code) {
          doc.setFillColor(237, 237, 242);
          doc.rect(cx - 1, cur.y - size * 0.78, w + 2, size * 1.02, "F");
        }
        if (isLink) doc.setTextColor(37, 99, 235);
        else if (t.run.code) doc.setTextColor(60, 60, 70);
        else doc.setTextColor(color[0], color[1], color[2]);
        doc.text(t.text, cx, cur.y);
        if (isLink) {
          doc.setDrawColor(37, 99, 235);
          doc.setLineWidth(0.5);
          doc.line(cx, cur.y + 1.5, cx + w, cur.y + 1.5);
          doc.link(cx, cur.y - size * 0.8, w, size, { url: t.run.href });
        }
        if (t.run.strike) {
          doc.setDrawColor(color[0], color[1], color[2]);
          doc.setLineWidth(0.6);
          doc.line(cx, cur.y - size * 0.3, cx + w, cur.y - size * 0.3);
        }
        cx += w;
      }
      cur.y += lh;
      lineToks = [];
      lineW = 0;
    };

    for (const t of toks) {
      if (t.space) {
        if (lineToks.length === 0) continue;
        lineToks.push(t);
        lineW += spaceW;
        continue;
      }
      applyFont(t.run);
      const w = doc.getTextWidth(t.text);
      if (lineW + w > maxWidth && lineToks.length > 0) flushLine();

      if (w > maxWidth) {
        // Hard-break a single token that is wider than the line.
        applyFont(t.run);
        let chunk = "";
        for (const ch of t.text) {
          if (doc.getTextWidth(chunk + ch) > maxWidth && chunk) {
            lineToks.push({ text: chunk, space: false, run: t.run });
            flushLine();
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        if (chunk) {
          lineToks.push({ text: chunk, space: false, run: t.run });
          lineW = doc.getTextWidth(chunk);
        }
        continue;
      }

      lineToks.push(t);
      lineW += w;
    }
    flushLine();
    doc.setTextColor(0, 0, 0);
  }

  const renderBlock = (b: Block) => {
    switch (b.type) {
      case "heading": {
        const hsize = baseSize * HEADING_SCALE[b.level - 1];
        cur.y += hsize * 0.5;
        ensureSpace(hsize * lhFactor);
        drawRuns(b.runs, {
          size: hsize,
          forceBold: true,
          color: [17, 17, 20],
        });
        cur.y += baseSize * 0.3;
        break;
      }
      case "paragraph": {
        drawRuns(b.runs);
        cur.y += baseSize * 0.55;
        break;
      }
      case "list": {
        const marked = withMarkers(b.items);
        const indentUnit = baseSize * 1.4;
        for (const it of marked) {
          const markerX = MARGIN + it.depth * indentUnit;
          const textX = markerX + indentUnit;
          ensureSpace(baseSize * lhFactor);
          doc.setFont(family, "normal");
          doc.setFontSize(baseSize);
          doc.setTextColor(60, 60, 70);
          doc.text(it.marker, markerX, cur.y);
          doc.setTextColor(0, 0, 0);
          drawRuns(parseInline(it.text), {
            x: textX,
            width: contentWidth - (textX - MARGIN),
          });
          cur.y += baseSize * 0.18;
        }
        cur.y += baseSize * 0.4;
        break;
      }
      case "blockquote": {
        const startY = cur.y - baseSize * 0.8;
        cur.y += baseSize * 0.1;
        for (const para of b.paragraphs) {
          drawRuns(para, {
            x: MARGIN + 16,
            width: contentWidth - 16,
            color: [90, 90, 105],
          });
          cur.y += baseSize * 0.3;
        }
        const endY = cur.y - baseSize * 0.3;
        doc.setFillColor(190, 190, 205);
        doc.rect(MARGIN, startY, 3, Math.max(endY - startY, baseSize), "F");
        cur.y += baseSize * 0.35;
        break;
      }
      case "code": {
        const codeSize = baseSize * 0.92;
        const clh = codeSize * 1.4;
        doc.setFont("courier", "normal");
        doc.setFontSize(codeSize);
        const wrapped: string[] = [];
        for (const raw of b.text.split("\n")) {
          const sub = doc.splitTextToSize(
            raw === "" ? " " : raw,
            contentWidth - 16
          ) as string[];
          wrapped.push(...sub);
        }
        cur.y += baseSize * 0.2;
        for (const ln of wrapped) {
          ensureSpace(clh);
          doc.setFillColor(245, 245, 248);
          doc.rect(MARGIN, cur.y - codeSize * 0.85, contentWidth, clh, "F");
          doc.setFont("courier", "normal");
          doc.setFontSize(codeSize);
          doc.setTextColor(40, 40, 50);
          doc.text(ln, MARGIN + 8, cur.y);
          cur.y += clh;
        }
        doc.setTextColor(0, 0, 0);
        cur.y += baseSize * 0.45;
        break;
      }
      case "hr": {
        cur.y += baseSize * 0.3;
        ensureSpace(baseSize);
        doc.setDrawColor(205, 205, 212);
        doc.setLineWidth(0.5);
        doc.line(MARGIN, cur.y, MARGIN + contentWidth, cur.y);
        cur.y += baseSize * 0.9;
        break;
      }
      case "table": {
        const head = [b.header.map((c) => stripInline(c))];
        const body = b.rows.map((row) => {
          const cells: string[] = [];
          for (let c = 0; c < b.header.length; c++) {
            cells.push(stripInline(row[c] ?? ""));
          }
          return cells;
        });
        const columnStyles: Record<number, { halign: "left" | "center" | "right" }> = {};
        b.aligns.forEach((a, idx) => {
          columnStyles[idx] = { halign: a as "left" | "center" | "right" };
        });
        ensureSpace(40);
        autoTable(doc, {
          startY: cur.y,
          head,
          body,
          margin: { left: MARGIN, right: MARGIN },
          tableWidth: contentWidth,
          styles: {
            font: family,
            fontSize: baseSize * 0.92,
            cellPadding: 5,
            lineColor: [221, 221, 228],
            lineWidth: 0.5,
            textColor: [30, 30, 38],
            overflow: "linebreak",
          },
          headStyles: {
            fillColor: ACCENT_RGB,
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          columnStyles,
          theme: "grid",
        });
        // @ts-expect-error lastAutoTable is added by jspdf-autotable
        cur.y = doc.lastAutoTable.finalY + baseSize * 0.6;
        break;
      }
    }
  };

  const blocks = parseBlocks(markdown);
  for (const b of blocks) renderBlock(b);

  return doc.output("blob");
}

/* ──────────────────────────────────────────────────────────
   Live preview (mirrors the PDF layout)
   ────────────────────────────────────────────────────────── */

function InlineRuns({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((r, i) => {
        if (r.code) {
          return (
            <code
              key={i}
              style={{
                fontFamily: CSS_FAMILY.mono,
                background: "#eeeef3",
                color: "#3c3c46",
                padding: "1px 4px",
                borderRadius: 3,
                fontSize: "0.9em",
              }}
            >
              {r.text}
            </code>
          );
        }
        const style: React.CSSProperties = {};
        if (r.bold) style.fontWeight = 700;
        if (r.italic) style.fontStyle = "italic";
        if (r.strike) style.textDecoration = "line-through";
        if (r.href) {
          return (
            <a
              key={i}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563eb", textDecoration: "underline", ...style }}
            >
              {r.text}
            </a>
          );
        }
        return (
          <span key={i} style={style}>
            {r.text}
          </span>
        );
      })}
    </>
  );
}

function PreviewBlock({ block, base }: { block: Block; base: number }) {
  switch (block.type) {
    case "heading": {
      const size = base * HEADING_SCALE[block.level - 1];
      return (
        <div
          style={{
            fontSize: size,
            fontWeight: 700,
            color: "#111114",
            margin: `${base * 0.7}px 0 ${base * 0.3}px`,
            lineHeight: 1.25,
          }}
        >
          <InlineRuns runs={block.runs} />
        </div>
      );
    }
    case "paragraph":
      return (
        <p style={{ margin: `0 0 ${base * 0.7}px` }}>
          <InlineRuns runs={block.runs} />
        </p>
      );
    case "list": {
      const marked = withMarkers(block.items);
      return (
        <div style={{ margin: `0 0 ${base * 0.7}px` }}>
          {marked.map((it, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                paddingLeft: it.depth * (base * 1.3),
                marginBottom: base * 0.2,
              }}
            >
              <span style={{ color: "#5a5a66", minWidth: base * 0.9 }}>
                {it.marker}
              </span>
              <span style={{ flex: 1 }}>
                <InlineRuns runs={parseInline(it.text)} />
              </span>
            </div>
          ))}
        </div>
      );
    }
    case "blockquote":
      return (
        <div
          style={{
            borderLeft: "3px solid #bebecd",
            paddingLeft: 12,
            color: "#5a5a69",
            margin: `0 0 ${base * 0.7}px`,
          }}
        >
          {block.paragraphs.map((p, i) => (
            <p key={i} style={{ margin: `0 0 ${base * 0.3}px` }}>
              <InlineRuns runs={p} />
            </p>
          ))}
        </div>
      );
    case "code":
      return (
        <pre
          style={{
            background: "#f5f5f8",
            color: "#28282f",
            fontFamily: CSS_FAMILY.mono,
            fontSize: base * 0.9,
            padding: "10px 12px",
            borderRadius: 5,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: `0 0 ${base * 0.7}px`,
            lineHeight: 1.45,
          }}
        >
          {block.text}
        </pre>
      );
    case "hr":
      return (
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #d2d2d8",
            margin: `${base * 0.6}px 0`,
          }}
        />
      );
    case "table":
      return (
        <div style={{ overflowX: "auto", margin: `0 0 ${base * 0.7}px` }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: base * 0.92,
            }}
          >
            <thead>
              <tr>
                {block.header.map((c, i) => (
                  <th
                    key={i}
                    style={{
                      background: ACCENT,
                      color: "#fff",
                      border: "1px solid #ddd",
                      padding: "5px 8px",
                      textAlign:
                        (block.aligns[i] as "left" | "center" | "right") || "left",
                    }}
                  >
                    <InlineRuns runs={parseInline(c)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {block.header.map((_, ci) => (
                    <td
                      key={ci}
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px 8px",
                        textAlign:
                          (block.aligns[ci] as "left" | "center" | "right") ||
                          "left",
                      }}
                    >
                      <InlineRuns runs={parseInline(row[ci] ?? "")} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/* ──────────────────────────────────────────────────────────
   Sample content
   ────────────────────────────────────────────────────────── */

const SAMPLE = `# Markdown to PDF

Paste your **Markdown** here or upload a \`.md\` file, then download a clean, simple-font PDF. Adjust the font and size on the left and watch the preview update.

## What it handles

- Headings, **bold**, *italic*, and \`inline code\`
- [Links](https://free-pdf-editor.org) stay clickable
- Ordered and unordered lists
- Block quotes, code blocks, and tables

1. Pick a font family
2. Set the size and spacing
3. Download your PDF

> Everything runs in your browser — your text never leaves your device.

| Feature      | Supported |
| ------------ | :-------: |
| Tables       | Yes       |
| Code blocks  | Yes       |
| Page sizes   | Letter/A4 |

\`\`\`
function greet(name) {
  return "Hello, " + name;
}
\`\`\`
`;

/* ──────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────── */

export default function MarkdownToPdfTool() {
  const [markdown, setMarkdown] = useState(SAMPLE);
  const [family, setFamily] = useState<FontFamily>("sans");
  const [size, setSize] = useState(11);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [page, setPage] = useState<PageSize>("letter");
  const [margin, setMargin] = useState<MarginSize>("normal");
  const [fileName, setFileName] = useState("document");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const blocks = useMemo(() => parseBlocks(markdown), [markdown]);

  // Scale the preview so it is a true-to-proportion miniature of the printed
  // page: px-per-point derived from the real sheet width, then applied to the
  // body font, margins, and page height alike.
  const pageDims = PAGE_PT[page];
  const previewScale = PREVIEW_PAGE_WIDTH / pageDims.w;
  const previewBasePx = size * previewScale;
  const previewPadPx = MARGIN_PT[margin] * previewScale;
  const previewPageHeight = pageDims.h * previewScale;

  const loadFileText = async (f: File) => {
    setError("");
    try {
      const text = await f.text();
      setMarkdown(text);
      setFileName(f.name.replace(/\.(md|markdown|txt)$/i, "") || "document");
    } catch {
      setError("Could not read that file. Please paste the Markdown text instead.");
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFileText(f);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFileText(f);
  };

  const handleDownload = async () => {
    setError("");
    if (!markdown.trim()) {
      setError("Add some Markdown first — paste text or upload a .md file.");
      return;
    }
    setBusy(true);
    try {
      const blob = await generatePdf(markdown, {
        family,
        size,
        lineHeight,
        page,
        margin,
      });
      downloadBlob(blob, (fileName || "document") + ".pdf");
    } catch {
      setError("Could not generate the PDF. Please check your Markdown and try again.");
    } finally {
      setBusy(false);
    }
  };

  const familyOptions: { id: FontFamily; label: string }[] = [
    { id: "sans", label: "Sans" },
    { id: "serif", label: "Serif" },
    { id: "mono", label: "Mono" },
  ];

  const lineHeightOptions: { value: number; label: string }[] = [
    { value: 1.15, label: "Tight" },
    { value: 1.35, label: "Snug" },
    { value: 1.5, label: "Normal" },
    { value: 1.75, label: "Relaxed" },
    { value: 2.0, label: "Loose" },
  ];

  const selectStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color, rgba(255,255,255,0.1))",
    borderRadius: 8,
    padding: "7px 10px",
    fontSize: 13,
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Font family */}
        <div>
          <label className="block text-xs font-medium theme-text-muted mb-1.5">
            Font
          </label>
          <div
            className="inline-flex rounded-lg p-0.5"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            {familyOptions.map((opt) => {
              const active = family === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFamily(opt.id)}
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: active ? ACCENT : "transparent",
                    color: active ? "#fff" : "var(--text-secondary)",
                    fontFamily: CSS_FAMILY[opt.id],
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-xs font-medium theme-text-muted mb-1.5">
            Size
          </label>
          <div
            className="inline-flex items-center rounded-lg overflow-hidden"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            <button
              onClick={() => setSize((v) => Math.max(8, v - 1))}
              className="px-3 py-1.5 text-sm font-semibold theme-text-secondary"
              aria-label="Decrease font size"
            >
              −
            </button>
            <span className="px-2 text-sm font-medium theme-text tabular-nums w-12 text-center">
              {size} pt
            </span>
            <button
              onClick={() => setSize((v) => Math.min(24, v + 1))}
              className="px-3 py-1.5 text-sm font-semibold theme-text-secondary"
              aria-label="Increase font size"
            >
              +
            </button>
          </div>
        </div>

        {/* Line spacing */}
        <div>
          <label className="block text-xs font-medium theme-text-muted mb-1.5">
            Spacing
          </label>
          <select
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
            style={selectStyle}
          >
            {lineHeightOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Page size */}
        <div>
          <label className="block text-xs font-medium theme-text-muted mb-1.5">
            Page
          </label>
          <select
            value={page}
            onChange={(e) => setPage(e.target.value as PageSize)}
            style={selectStyle}
          >
            <option value="letter">Letter</option>
            <option value="a4">A4</option>
          </select>
        </div>

        {/* Margins */}
        <div>
          <label className="block text-xs font-medium theme-text-muted mb-1.5">
            Margins
          </label>
          <select
            value={margin}
            onChange={(e) => setMargin(e.target.value as MarginSize)}
            style={selectStyle}
          >
            <option value="narrow">Narrow</option>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </div>
      </div>

      {/* Editor + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium theme-text-secondary">
              Markdown
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium"
                style={{ color: ACCENT }}
              >
                Upload .md
              </button>
              <button
                onClick={() => {
                  setMarkdown("");
                  setFileName("document");
                }}
                className="text-sm font-medium theme-text-muted"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            spellCheck={false}
            placeholder="# Paste your Markdown here..."
            className="w-full rounded-xl border p-4 text-sm outline-none resize-y"
            style={{
              minHeight: 460,
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              borderColor: dragging ? ACCENT : "var(--border-color, rgba(255,255,255,0.1))",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              lineHeight: 1.6,
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            onChange={onFileInput}
            className="hidden"
          />
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium theme-text-secondary mb-2">
            PDF preview
          </label>
          <div
            className="rounded-xl border p-4 overflow-auto flex justify-center"
            style={{
              minHeight: 460,
              maxHeight: 640,
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color, rgba(255,255,255,0.1))",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                color: "#1a1a1f",
                fontFamily: CSS_FAMILY[family],
                fontSize: previewBasePx,
                lineHeight: lineHeight,
                padding: previewPadPx,
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.28)",
                width: PREVIEW_PAGE_WIDTH,
                minWidth: PREVIEW_PAGE_WIDTH,
                minHeight: previewPageHeight,
                height: "max-content",
                alignSelf: "flex-start",
                boxSizing: "border-box",
              }}
            >
              {blocks.length === 0 ? (
                <p style={{ color: "#9a9aa5" }}>
                  Your formatted document will appear here.
                </p>
              ) : (
                blocks.map((b, i) => (
                  <PreviewBlock key={i} block={b} base={previewBasePx} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Download */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <button
          onClick={handleDownload}
          disabled={busy}
          className="flex-1 py-3 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
          style={{ backgroundColor: ACCENT }}
        >
          {busy ? "Generating PDF…" : "Download PDF"}
        </button>
      </div>

      {/* Info note */}
      <p className="text-xs theme-text-muted text-center leading-relaxed">
        Your PDF is built entirely in your browser with a clean, standard font —
        nothing is uploaded. Headings, bold and italic text, links, lists, quotes,
        code blocks, and tables are all rendered as crisp, selectable text.
      </p>
    </div>
  );
}
