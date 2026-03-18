"use client";
import { Tool } from "../page";

interface ToolDef {
  id: Tool;
  label: string;
  desc: string;
  color: string;
  icon: React.ReactNode;
}

/* ── Icon helpers ─────────────────────────────────────── */

const mergeIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="8" height="14" rx="1" />
    <rect x="14" y="3" width="8" height="14" rx="1" />
    <path d="M10 14h4" />
    <path d="M12 12v4" />
  </svg>
);

const splitIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="11" x2="12" y2="17" strokeDasharray="2 2" />
  </svg>
);

const compressIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v6" />
    <path d="M8 6l4 3 4-3" />
    <path d="M12 21v-6" />
    <path d="M8 18l4-3 4 3" />
    <rect x="4" y="9" width="16" height="6" rx="1" />
  </svg>
);

const rotateIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6" />
    <path d="M21.34 15.57a10 10 0 1 1-.57-8.38L21.5 8" />
  </svg>
);

const deleteIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
  </svg>
);

const extractIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15l3-3 3 3" />
    <line x1="12" y1="12" x2="12" y2="18" />
  </svg>
);

const watermarkIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const numberIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <text x="8" y="17" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">123</text>
  </svg>
);

const cropIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
    <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
  </svg>
);

const redactIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <rect x="7" y="7" width="10" height="4" rx="1" fill="currentColor" />
  </svg>
);

const signIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const docIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <text x="7" y="17" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">W</text>
  </svg>
);

const pdfIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <text x="6" y="17" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">PDF</text>
  </svg>
);

const excelIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="12" y1="11" x2="12" y2="19" />
  </svg>
);

const slideIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <rect x="8" y="12" width="8" height="5" rx="0.5" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);

const imageOutIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <rect x="8" y="12" width="8" height="6" rx="1" />
  </svg>
);

const imageInIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

/* ── Data ─────────────────────────────────────────────── */

const popular: ToolDef[] = [
  { id: "merge", label: "Merge PDFs", desc: "Combine multiple PDFs into one", color: "#3b82f6", icon: mergeIcon },
  { id: "split", label: "Split PDF", desc: "Extract specific pages or ranges", color: "#6366f1", icon: splitIcon },
  { id: "compress", label: "Compress PDF", desc: "Reduce file size", color: "#10b981", icon: compressIcon },
];

const organize: ToolDef[] = [
  { id: "rotate", label: "Rotate Pages", desc: "Rotate all or specific pages", color: "#f59e0b", icon: rotateIcon },
  { id: "delete", label: "Delete Pages", desc: "Remove unwanted pages", color: "#ef4444", icon: deleteIcon },
  { id: "extract", label: "Extract Pages", desc: "Pick pages into a new PDF", color: "#8b5cf6", icon: extractIcon },
];

const edit: ToolDef[] = [
  { id: "watermark", label: "Watermark", desc: "Add text watermark", color: "#0ea5e9", icon: watermarkIcon },
  { id: "number", label: "Number Pages", desc: "Add page numbers", color: "#6366f1", icon: numberIcon },
  { id: "crop", label: "Crop PDF", desc: "Trim margins", color: "#14b8a6", icon: cropIcon },
  { id: "redact", label: "Redact", desc: "Black out sensitive areas", color: "#64748b", icon: redactIcon },
];

const sign: ToolDef[] = [
  { id: "sign", label: "Sign PDF", desc: "Draw and embed your signature", color: "#d946ef", icon: signIcon },
];

interface ConvertPair {
  a: ToolDef;
  b: ToolDef;
}

const convertPairs: ConvertPair[] = [
  {
    a: { id: "pdftodocx", label: "PDF → Word", desc: "Convert to editable DOCX", color: "#2563eb", icon: docIcon },
    b: { id: "docxtopdf", label: "Word → PDF", desc: "Convert DOCX to PDF", color: "#2563eb", icon: pdfIcon },
  },
  {
    a: { id: "pdftoexcel", label: "PDF → Excel", desc: "Extract tables to spreadsheet", color: "#16a34a", icon: excelIcon },
    b: { id: "exceltopdf", label: "Excel → PDF", desc: "Convert spreadsheet to PDF", color: "#16a34a", icon: pdfIcon },
  },
  {
    a: { id: "pdftopptx", label: "PDF → PPT", desc: "Convert to presentation slides", color: "#dc2626", icon: slideIcon },
    b: { id: "pptxtopdf", label: "PPT → PDF", desc: "Convert slides to PDF", color: "#dc2626", icon: pdfIcon },
  },
  {
    a: { id: "pdftoimage", label: "PDF → Image", desc: "Convert pages to PNG", color: "#ec4899", icon: imageOutIcon },
    b: { id: "imagetopdf", label: "Image → PDF", desc: "Combine images into PDF", color: "#f97316", icon: imageInIcon },
  },
];

/* ── Components ───────────────────────────────────────── */

function CategoryHeader({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-0.5 h-5" style={{ backgroundColor: color }} />
      <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)", fontFamily: "'Space Grotesk', sans-serif" }}>{label}</h2>
    </div>
  );
}

function ToolCard({ tool, onSelect, index = 0 }: { tool: ToolDef; onSelect: (t: Tool) => void; index?: number }) {
  return (
    <button
      onClick={() => onSelect(tool.id)}
      className="group flex items-center gap-3.5 p-3 sm:p-5 text-left w-full tool-card-enter theme-card"
      style={{
        animationDelay: `${index * 30}ms`,
      }}
    >
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
        style={{ backgroundColor: tool.color + "18", color: tool.color }}
      >
        {tool.icon}
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-sm sm:text-base leading-tight" style={{ color: "var(--text-primary)" }}>{tool.label}</div>
        <div className="text-xs sm:text-sm leading-snug mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{tool.desc}</div>
      </div>
    </button>
  );
}

function FeaturedCard({ tool, onSelect, index = 0 }: { tool: ToolDef; onSelect: (t: Tool) => void; index?: number }) {
  return (
    <button
      onClick={() => onSelect(tool.id)}
      className="group flex flex-col items-center text-center p-5 sm:p-7 tool-card-enter theme-card-featured"
      style={{
        animationDelay: `${index * 30}ms`,
      }}
    >
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200"
        style={{ backgroundColor: tool.color + "18", color: tool.color }}
      >
        {tool.icon}
      </div>
      <div className="font-semibold text-sm sm:text-base mb-0.5" style={{ color: "var(--text-primary)" }}>{tool.label}</div>
      <div className="text-xs sm:text-sm leading-snug" style={{ color: "var(--text-muted)" }}>{tool.desc}</div>
    </button>
  );
}

/* ── Main ─────────────────────────────────────────────── */

export default function ToolSelector({ onSelect }: { onSelect: (t: Tool) => void }) {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Most Popular */}
      <div>
        <CategoryHeader label="Most Popular" color="#e5322d" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {popular.map((t, i) => (
            <FeaturedCard key={t.id} tool={t} onSelect={onSelect} index={i} />
          ))}
        </div>
      </div>

      {/* Organize */}
      <div>
        <CategoryHeader label="Organize" color="#f59e0b" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {organize.map((t, i) => (
            <ToolCard key={t.id} tool={t} onSelect={onSelect} index={i} />
          ))}
        </div>
      </div>

      {/* Edit */}
      <div>
        <CategoryHeader label="Edit" color="#0ea5e9" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {edit.map((t, i) => (
            <ToolCard key={t.id} tool={t} onSelect={onSelect} index={i} />
          ))}
        </div>
      </div>

      {/* Sign */}
      <div>
        <CategoryHeader label="Sign" color="#d946ef" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {sign.map((t, i) => (
            <ToolCard key={t.id} tool={t} onSelect={onSelect} index={i} />
          ))}
        </div>
      </div>

      {/* Convert */}
      <div>
        <CategoryHeader label="Convert" color="#2563eb" />
        <div className="space-y-3">
          {convertPairs.map((pair, pi) => (
            <div key={pair.a.id} className="grid grid-cols-2 gap-3 sm:gap-4">
              <ToolCard tool={pair.a} onSelect={onSelect} index={pi * 2} />
              <ToolCard tool={pair.b} onSelect={onSelect} index={pi * 2 + 1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
