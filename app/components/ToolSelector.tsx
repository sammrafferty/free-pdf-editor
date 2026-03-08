"use client";
import { Tool } from "../page";

const tools: { id: Tool; icon: string; label: string; desc: string }[] = [
  { id: "split", icon: "✂️", label: "Split PDF", desc: "Extract specific pages or ranges" },
  { id: "merge", icon: "🔗", label: "Merge PDFs", desc: "Combine multiple PDFs into one" },
  { id: "compress", icon: "🗜️", label: "Compress PDF", desc: "Reduce file size" },
  { id: "rotate", icon: "🔄", label: "Rotate Pages", desc: "Rotate all or specific pages" },
  { id: "delete", icon: "🗑️", label: "Delete Pages", desc: "Remove pages from a PDF" },
];

export default function ToolSelector({ onSelect }: { onSelect: (t: Tool) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className="flex items-start gap-4 p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition text-left"
        >
          <span className="text-2xl mt-0.5">{t.icon}</span>
          <div>
            <div className="font-semibold">{t.label}</div>
            <div className="text-sm text-white/50 mt-0.5">{t.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
