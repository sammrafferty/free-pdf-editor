"use client";
import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

type NumberFormat = "decimal" | "pageOfN" | "roman" | "letter";
type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type FontOption = "Helvetica" | "TimesRoman" | "Courier";

const ACCENT = "#a78bfa";

const COLOR_PRESETS: { label: string; hex: string; r: number; g: number; b: number }[] = [
  { label: "Black", hex: "#000000", r: 0, g: 0, b: 0 },
  { label: "Dark Gray", hex: "#4a4a4a", r: 0.29, g: 0.29, b: 0.29 },
  { label: "Light Gray", hex: "#999999", r: 0.6, g: 0.6, b: 0.6 },
  { label: "Blue", hex: "#2563eb", r: 0.145, g: 0.388, b: 0.922 },
  { label: "Red", hex: "#dc2626", r: 0.863, g: 0.149, b: 0.149 },
  { label: "Green", hex: "#16a34a", r: 0.086, g: 0.639, b: 0.29 },
];

const FONT_MAP: Record<FontOption, keyof typeof StandardFonts> = {
  Helvetica: "Helvetica",
  TimesRoman: "TimesRoman",
  Courier: "Courier",
};

const POSITIONS: { value: Position; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

function toRoman(num: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result;
}

function toLetter(num: number): string {
  let result = "";
  while (num > 0) {
    num--;
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

function formatPageNumber(
  pageIndex: number,
  totalPages: number,
  startNum: number,
  format: NumberFormat
): string {
  const num = startNum + pageIndex;
  switch (format) {
    case "decimal":
      return String(num);
    case "pageOfN":
      return `Page ${num} of ${startNum + totalPages - 1}`;
    case "roman":
      return num > 0 ? toRoman(num) : String(num);
    case "letter":
      return num > 0 ? toLetter(num) : String(num);
    default:
      return String(num);
  }
}

export default function NumberPagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [startNum, setStartNum] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [numberFormat, setNumberFormat] = useState<NumberFormat>("decimal");
  const [colorIndex, setColorIndex] = useState(1); // Dark Gray default
  const [fontOption, setFontOption] = useState<FontOption>("Helvetica");
  const [skipPages, setSkipPages] = useState(0);

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const count = pdf.getPageCount();
      if (count === 0) {
        setError("This PDF has no pages.");
        setFile(null);
        setPageCount(0);
        return;
      }
      setFile(f);
      setPageCount(count);
      setSkipPages(0);
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
      setPageCount(0);
    }
  };

  const handleNumber = async () => {
    if (!file) return;
    setError("");
    const clampedFontSize = Math.min(72, Math.max(4, fontSize || 12));
    const clampedSkipPages = Math.min(Math.max(0, skipPages), pageCount - 1);
    const clampedStartNum = Math.max(1, startNum || 1);
    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const font = await pdf.embedFont(StandardFonts[FONT_MAP[fontOption]]);
      const total = pdf.getPageCount();
      const color = COLOR_PRESETS[colorIndex];
      const margin = 30;

      if (clampedSkipPages >= total) {
        setError("All pages are skipped. Reduce the skip pages value.");
        setLoading(false);
        return;
      }

      for (let i = clampedSkipPages; i < total; i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        const rotation = page.getRotation().angle;

        // Account for page rotation: getSize() returns unrotated dimensions
        let effectiveWidth = width;
        let effectiveHeight = height;
        if (rotation === 90 || rotation === 270) {
          effectiveWidth = height;
          effectiveHeight = width;
        }

        const numText = formatPageNumber(i - clampedSkipPages, total - clampedSkipPages, clampedStartNum, numberFormat);
        const textWidth = font.widthOfTextAtSize(numText, clampedFontSize);

        let x: number;
        if (position.endsWith("center")) {
          x = effectiveWidth / 2 - textWidth / 2;
        } else if (position.endsWith("right")) {
          x = effectiveWidth - margin - textWidth;
        } else {
          x = margin;
        }

        let y: number;
        if (position.startsWith("top")) {
          y = effectiveHeight - margin;
        } else {
          y = margin;
        }

        // Transform coordinates for rotated pages
        let drawX = x;
        let drawY = y;
        if (rotation === 90) {
          drawX = y;
          drawY = height - x - textWidth;
        } else if (rotation === 180) {
          drawX = width - x - textWidth;
          drawY = height - y;
        } else if (rotation === 270) {
          drawX = width - y;
          drawY = x;
        }

        page.drawText(numText, {
          x: drawX,
          y: drawY,
          size: clampedFontSize,
          font,
          color: rgb(color.r, color.g, color.b),
        });
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes) as BlobPart], { type: "application/pdf" });
      downloadBlob(blob, `numbered_${file.name}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to add page numbers. Please try again.");
    }
    setLoading(false);
  };

  const FORMAT_OPTIONS: { value: NumberFormat; label: string; example: string }[] = [
    { value: "decimal", label: "1, 2, 3", example: "1" },
    { value: "pageOfN", label: "Page X of N", example: `Page 1 of ${pageCount || "N"}` },
    { value: "roman", label: "i, ii, iii", example: "i" },
    { value: "letter", label: "A, B, C", example: "A" },
  ];

  return (
    <div>
      {!file ? (
        <div>
          <Dropzone onFiles={handleFile} />
          {error && (
            <div className="mt-4 p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* File info row */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} pages</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setPageCount(0); setError(""); setSkipPages(0); }} className="theme-text-muted text-sm font-medium">Remove</button>
          </div>

          {/* Number format */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Number Format</label>
            <div className="grid grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setNumberFormat(opt.value)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors text-left ${
                    numberFormat === opt.value ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:border-purple-300"
                  }`}
                  style={numberFormat === opt.value ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position grid (2x3) */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Position</label>
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPosition(value)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    position === value ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:border-purple-300"
                  }`}
                  style={position === value ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Color presets */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Color</label>
            <div className="flex gap-3 items-center">
              {COLOR_PRESETS.map((c, i) => (
                <button
                  key={c.hex}
                  onClick={() => setColorIndex(i)}
                  title={c.label}
                  className="rounded-full transition-transform"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: c.hex,
                    border: colorIndex === i ? `3px solid ${ACCENT}` : "3px solid transparent",
                    outline: colorIndex === i ? `2px solid ${ACCENT}` : "none",
                    outlineOffset: 1,
                    transform: colorIndex === i ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Font selection */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Font</label>
            <div className="flex gap-2">
              {(["Helvetica", "TimesRoman", "Courier"] as FontOption[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFontOption(f)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    fontOption === f ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:border-purple-300"
                  }`}
                  style={
                    fontOption === f
                      ? { backgroundColor: ACCENT, borderColor: ACCENT, fontFamily: f === "TimesRoman" ? "Times New Roman, serif" : f === "Courier" ? "Courier New, monospace" : "Helvetica, Arial, sans-serif" }
                      : { fontFamily: f === "TimesRoman" ? "Times New Roman, serif" : f === "Courier" ? "Courier New, monospace" : "Helvetica, Arial, sans-serif" }
                  }
                >
                  {f === "TimesRoman" ? "Times Roman" : f}
                </button>
              ))}
            </div>
          </div>

          {/* Starting number, font size, skip pages */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">Start number</label>
              <input
                type="number"
                value={startNum}
                onChange={(e) => setStartNum(Number(e.target.value))}
                min={1}
                className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">Font size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!isNaN(v)) setFontSize(v);
                }}
                min={4}
                max={72}
                className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">Skip pages</label>
              <input
                type="number"
                value={skipPages}
                onChange={(e) => setSkipPages(Math.max(0, Number(e.target.value)))}
                min={0}
                max={pageCount > 0 ? pageCount - 1 : 0}
                className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleNumber}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading ? { backgroundColor: ACCENT } : {}}
          >
            {loading ? "Adding numbers..." : "Add Page Numbers & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
