"use client";
import { Tool } from "../page";

interface ToolDef {
  id: Tool;
  label: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
}

/* ── SVG Icon helpers ─────────────────────────────────── */

const icon = (children: React.ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

// Merge: two documents converging into one
const mergeIcon = icon(<>
  <path d="M4 4h6v16H4z" /><path d="M14 4h6v16h-6z" /><path d="M10 12h4" />
</>);

// Split: scissors cutting a page
const splitIcon = icon(<>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  <polyline points="14 2 14 8 20 8" />
  <line x1="4" y1="13" x2="20" y2="13" strokeDasharray="3 2" />
</>);

// Compress: arrows pushing inward
const compressIcon = icon(<>
  <path d="M4 14l4-4" /><path d="M4 10h4v4" />
  <path d="M20 10l-4 4" /><path d="M20 14h-4v-4" />
  <rect x="8" y="6" width="8" height="12" rx="1" />
</>);

// Rotate: circular arrow
const rotateIcon = icon(<>
  <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" />
</>);

// Delete pages: page with X
const deleteIcon = icon(<>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  <polyline points="14 2 14 8 20 8" />
  <line x1="9" y1="13" x2="15" y2="19" /><line x1="15" y1="13" x2="9" y2="19" />
</>);

// Extract pages: page with arrow coming out
const extractIcon = icon(<>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  <polyline points="14 2 14 8 20 8" />
  <path d="M12 18v-6" /><path d="M9 15l3-3 3 3" />
</>);

// Watermark: layers
const watermarkIcon = icon(<>
  <path d="M12 2L2 7l10 5 10-5-10-5z" />
  <path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
</>);

// Number pages: hash/number sign
const numberIcon = icon(<>
  <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
  <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
</>);

// Crop: crop marks
const cropIcon = icon(<>
  <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
  <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
</>);

// Redact: eye-off (hidden content)
const redactIcon = icon(<>
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
  <line x1="1" y1="1" x2="23" y2="23" />
</>);

// Sign: pen tool
const signIcon = icon(<>
  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
</>);

// Image to PDF: image frame with arrow
const imageInIcon = icon(<>
  <rect x="3" y="3" width="18" height="18" rx="2" />
  <circle cx="8.5" cy="8.5" r="1.5" />
  <polyline points="21 15 16 10 5 21" />
</>);

// PDF to Image: page becoming image
const imageOutIcon = icon(<>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  <polyline points="14 2 14 8 20 8" />
  <circle cx="10" cy="13" r="1" /><path d="M8 18l2-3 2 2 3-4 3 5" />
</>);

// Word doc icon
const docIcon = icon(<>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  <polyline points="14 2 14 8 20 8" />
  <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" />
</>);

// PDF icon
const pdfIcon = icon(<>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  <polyline points="14 2 14 8 20 8" />
  <path d="M10 12v6" /><path d="M10 12h2a2 2 0 1 1 0 4h-2" />
</>);

// Excel: grid/table
const excelIcon = icon(<>
  <rect x="3" y="3" width="18" height="18" rx="2" />
  <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
  <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
</>);

// Slides: presentation
const slideIcon = icon(<>
  <rect x="2" y="3" width="20" height="14" rx="2" />
  <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
</>);

// Arrow icon for conversion direction
const arrowRight = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-40">
    <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
  </svg>
);

/* ── Data ─────────────────────────────────────────────── */

const popular: ToolDef[] = [
  { id: "merge", label: "Merge PDFs", desc: "Combine multiple PDFs into one", color: "#6d9eeb", icon: mergeIcon },
  { id: "split", label: "Split PDF", desc: "Extract specific pages or ranges", color: "#a78bfa", icon: splitIcon },
  { id: "compress", label: "Compress PDF", desc: "Reduce file size", color: "#6ee7b7", icon: compressIcon },
];

const organize: ToolDef[] = [
  { id: "rotate", label: "Rotate Pages", desc: "Rotate all or specific pages", color: "#fbbf24", icon: rotateIcon },
  { id: "delete", label: "Delete Pages", desc: "Remove unwanted pages", color: "#f87171", icon: deleteIcon },
  { id: "extract", label: "Extract Pages", desc: "Pick pages into a new PDF", color: "#c4b5fd", icon: extractIcon },
];

const edit: ToolDef[] = [
  { id: "watermark", label: "Watermark", desc: "Add text watermark", color: "#67e8f9", icon: watermarkIcon },
  { id: "number", label: "Number Pages", desc: "Add page numbers", color: "#a78bfa", icon: numberIcon },
  { id: "crop", label: "Crop PDF", desc: "Trim margins", color: "#5eead4", icon: cropIcon },
  { id: "redact", label: "Redact", desc: "Black out sensitive areas", color: "#94a3b8", icon: redactIcon },
];

const signTools: ToolDef[] = [
  { id: "sign", label: "Sign PDF", desc: "Draw and embed your signature", color: "#f0abfc", icon: signIcon },
];

interface ConvertPair {
  a: ToolDef;
  b: ToolDef;
}

const convertPairs: ConvertPair[] = [
  {
    a: { id: "pdftodocx", label: "PDF to Word", desc: "Convert to editable DOCX", color: "#60a5fa", icon: pdfIcon },
    b: { id: "docxtopdf", label: "Word to PDF", desc: "Convert DOCX to PDF", color: "#60a5fa", icon: docIcon },
  },
  {
    a: { id: "pdftoexcel", label: "PDF to Excel", desc: "Extract tables to spreadsheet", color: "#4ade80", icon: pdfIcon },
    b: { id: "exceltopdf", label: "Excel to PDF", desc: "Convert spreadsheet to PDF", color: "#4ade80", icon: excelIcon },
  },
  {
    a: { id: "pdftopptx", label: "PDF to PPT", desc: "Convert to presentation slides", color: "#fb923c", icon: pdfIcon },
    b: { id: "pptxtopdf", label: "PPT to PDF", desc: "Convert slides to PDF", color: "#fb923c", icon: slideIcon },
  },
  {
    a: { id: "pdftoimage", label: "PDF to Image", desc: "Convert pages to PNG", color: "#f472b6", icon: imageOutIcon },
    b: { id: "imagetopdf", label: "Image to PDF", desc: "Combine images into PDF", color: "#fb923c", icon: imageInIcon },
  },
];

/* ── Components ───────────────────────────────────────── */

function CategoryHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2
        className="text-xs font-medium uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </h2>
      <div className="flex-1 h-px" style={{ background: "var(--border-primary)" }} />
    </div>
  );
}

function ToolCard({ tool, onSelect, index = 0 }: { tool: ToolDef; onSelect: (t: Tool) => void; index?: number }) {
  return (
    <button
      onClick={() => onSelect(tool.id)}
      className="group flex items-center gap-3.5 p-3.5 sm:p-4 text-left w-full tool-card-enter theme-card cursor-pointer"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 rounded-lg group-hover:scale-110 transition-transform duration-200"
        style={{ backgroundColor: tool.color + "15", color: tool.color }}
      >
        {tool.icon}
      </div>
      <div className="min-w-0">
        <div className="font-medium text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
          {tool.label}
        </div>
        <div className="text-xs leading-snug mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
          {tool.desc}
        </div>
      </div>
    </button>
  );
}

function FeaturedCard({ tool, onSelect, index = 0 }: { tool: ToolDef; onSelect: (t: Tool) => void; index?: number }) {
  return (
    <button
      onClick={() => onSelect(tool.id)}
      className="group flex flex-col items-center text-center p-5 sm:p-6 tool-card-enter theme-card-featured cursor-pointer"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div
        className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center mb-3 rounded-xl group-hover:scale-110 transition-transform duration-200"
        style={{ backgroundColor: tool.color + "15", color: tool.color }}
      >
        {tool.icon}
      </div>
      <div className="font-medium text-sm sm:text-base mb-0.5" style={{ color: "var(--text-primary)" }}>
        {tool.label}
      </div>
      <div className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>
        {tool.desc}
      </div>
    </button>
  );
}

function ConvertCard({ pair, onSelect, index = 0 }: { pair: ConvertPair; onSelect: (t: Tool) => void; index: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:gap-3 tool-card-enter"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <button
        onClick={() => onSelect(pair.a.id)}
        className="group flex items-center gap-2.5 p-3.5 sm:p-4 text-left w-full theme-card cursor-pointer"
      >
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 rounded-lg group-hover:scale-110 transition-transform duration-200"
          style={{ backgroundColor: pair.a.color + "15", color: pair.a.color }}
        >
          {pair.a.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-xs sm:text-sm leading-tight flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
            {pair.a.label}
          </div>
          <div className="text-xs leading-snug mt-0.5 truncate hidden sm:block" style={{ color: "var(--text-muted)" }}>
            {pair.a.desc}
          </div>
        </div>
      </button>
      <button
        onClick={() => onSelect(pair.b.id)}
        className="group flex items-center gap-2.5 p-3.5 sm:p-4 text-left w-full theme-card cursor-pointer"
      >
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 rounded-lg group-hover:scale-110 transition-transform duration-200"
          style={{ backgroundColor: pair.b.color + "15", color: pair.b.color }}
        >
          {pair.b.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-xs sm:text-sm leading-tight flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
            {pair.b.label}
          </div>
          <div className="text-xs leading-snug mt-0.5 truncate hidden sm:block" style={{ color: "var(--text-muted)" }}>
            {pair.b.desc}
          </div>
        </div>
      </button>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────── */

export default function ToolSelector({ onSelect }: { onSelect: (t: Tool) => void }) {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Most Popular */}
      <div>
        <CategoryHeader label="Most Popular" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {popular.map((t, i) => (
            <FeaturedCard key={t.id} tool={t} onSelect={onSelect} index={i} />
          ))}
        </div>
      </div>

      {/* Organize */}
      <div>
        <CategoryHeader label="Organize" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {organize.map((t, i) => (
            <ToolCard key={t.id} tool={t} onSelect={onSelect} index={i} />
          ))}
        </div>
      </div>

      {/* Edit */}
      <div>
        <CategoryHeader label="Edit" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {edit.map((t, i) => (
            <ToolCard key={t.id} tool={t} onSelect={onSelect} index={i} />
          ))}
        </div>
      </div>

      {/* Sign */}
      <div>
        <CategoryHeader label="Sign" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {signTools.map((t, i) => (
            <ToolCard key={t.id} tool={t} onSelect={onSelect} index={i} />
          ))}
        </div>
      </div>

      {/* Convert */}
      <div>
        <CategoryHeader label="Convert" />
        <div className="space-y-3">
          {convertPairs.map((pair, pi) => (
            <ConvertCard key={pair.a.id} pair={pair} onSelect={onSelect} index={pi} />
          ))}
        </div>
      </div>
    </div>
  );
}
