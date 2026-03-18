"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ThemeProvider, { ThemeToggle } from "./components/ThemeProvider";
import ToolSelector from "./components/ToolSelector";
import AdSlot from "./components/AdSlot";
import CookieConsent from "./components/CookieConsent";

const SplitTool = dynamic(() => import("./components/tools/SplitTool"));
const MergeTool = dynamic(() => import("./components/tools/MergeTool"));
const CompressTool = dynamic(() => import("./components/tools/CompressTool"));
const RotateTool = dynamic(() => import("./components/tools/RotateTool"));
const DeletePagesTool = dynamic(() => import("./components/tools/DeletePagesTool"));
const ExtractPagesTool = dynamic(() => import("./components/tools/ExtractPagesTool"));
const WatermarkTool = dynamic(() => import("./components/tools/WatermarkTool"));
const NumberPagesTool = dynamic(() => import("./components/tools/NumberPagesTool"));
const CropTool = dynamic(() => import("./components/tools/CropTool"));
const RedactTool = dynamic(() => import("./components/tools/RedactTool"));
const SignTool = dynamic(() => import("./components/tools/SignTool"));
const ImageToPdfTool = dynamic(() => import("./components/tools/ImageToPdfTool"));
const PdfToImageTool = dynamic(() => import("./components/tools/PdfToImageTool"));
const PdfToDocxTool = dynamic(() => import("./components/tools/PdfToDocxTool"));
const DocxToPdfTool = dynamic(() => import("./components/tools/DocxToPdfTool"));
const PdfToExcelTool = dynamic(() => import("./components/tools/PdfToExcelTool"));
const ExcelToPdfTool = dynamic(() => import("./components/tools/ExcelToPdfTool"));
const PdfToPptxTool = dynamic(() => import("./components/tools/PdfToPptxTool"));
const PptxToPdfTool = dynamic(() => import("./components/tools/PptxToPdfTool"));

export type Tool = "split" | "merge" | "compress" | "rotate" | "delete" | "extract" | "watermark" | "number" | "crop" | "redact" | "sign" | "imagetopdf" | "pdftoimage" | "pdftodocx" | "docxtopdf" | "pdftoexcel" | "exceltopdf" | "pdftopptx" | "pptxtopdf";

const toolMeta: Record<Tool, { label: string; desc: string; color: string }> = {
  split: { label: "Split PDF", desc: "Extract specific pages or ranges from your PDF", color: "#a78bfa" },
  merge: { label: "Merge PDFs", desc: "Combine multiple PDF files into one document", color: "#6d9eeb" },
  compress: { label: "Compress PDF", desc: "Reduce your PDF file size", color: "#6ee7b7" },
  rotate: { label: "Rotate Pages", desc: "Rotate all or specific pages in your PDF", color: "#fbbf24" },
  delete: { label: "Delete Pages", desc: "Remove unwanted pages from your PDF", color: "#f87171" },
  extract: { label: "Extract Pages", desc: "Pick and extract specific pages into a new PDF", color: "#c4b5fd" },
  watermark: { label: "Watermark", desc: "Add text watermark to all pages", color: "#67e8f9" },
  number: { label: "Number Pages", desc: "Add page numbers to your PDF", color: "#a78bfa" },
  crop: { label: "Crop PDF", desc: "Trim margins from all pages", color: "#5eead4" },
  redact: { label: "Redact", desc: "Black out sensitive areas in your PDF", color: "#94a3b8" },
  sign: { label: "Sign PDF", desc: "Draw and embed your signature", color: "#f0abfc" },
  imagetopdf: { label: "Image to PDF", desc: "Combine images into a single PDF", color: "#fb923c" },
  pdftoimage: { label: "PDF to Image", desc: "Convert PDF pages to PNG images", color: "#f472b6" },
  pdftodocx: { label: "PDF to Word", desc: "Convert PDF to editable Word document", color: "#60a5fa" },
  docxtopdf: { label: "Word to PDF", desc: "Convert Word document to PDF", color: "#60a5fa" },
  pdftoexcel: { label: "PDF to Excel", desc: "Extract tables and data to spreadsheet", color: "#4ade80" },
  exceltopdf: { label: "Excel to PDF", desc: "Convert spreadsheet to PDF document", color: "#4ade80" },
  pdftopptx: { label: "PDF to PowerPoint", desc: "Convert PDF pages to presentation slides", color: "#fb923c" },
  pptxtopdf: { label: "PowerPoint to PDF", desc: "Convert presentation slides to PDF", color: "#fb923c" },
};

const toolComponents: Record<Tool, React.ComponentType> = {
  split: SplitTool,
  merge: MergeTool,
  compress: CompressTool,
  rotate: RotateTool,
  delete: DeletePagesTool,
  extract: ExtractPagesTool,
  watermark: WatermarkTool,
  number: NumberPagesTool,
  crop: CropTool,
  redact: RedactTool,
  sign: SignTool,
  imagetopdf: ImageToPdfTool,
  pdftoimage: PdfToImageTool,
  pdftodocx: PdfToDocxTool,
  docxtopdf: DocxToPdfTool,
  pdftoexcel: PdfToExcelTool,
  exceltopdf: ExcelToPdfTool,
  pdftopptx: PdfToPptxTool,
  pptxtopdf: PptxToPdfTool,
};

function HomeContent() {
  const [tool, setTool] = useState<Tool | null>(null);
  const reset = () => setTool(null);

  const ActiveTool = tool ? toolComponents[tool] : null;

  return (
    <main className="min-h-screen grid-bg">
      {/* Header */}
      <header className="theme-header sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-primary)", color: "#fff" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--text-primary)" }}>
              PDF Tools
            </span>
          </button>

          <div className="flex items-center gap-2">
            {tool && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)", background: "var(--bg-tertiary)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                All Tools
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {!tool ? (
          <div className="py-12 sm:py-20">
            {/* Hero */}
            <div className="text-center mb-10 sm:mb-14">
              <h1
                className="text-3xl sm:text-5xl font-bold mb-3 tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                We Make PDF Easy.
              </h1>
              <p
                className="text-sm sm:text-base max-w-md mx-auto leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                All the tools you need to work with PDFs. Free, fast, and entirely in your browser — nothing gets uploaded.
              </p>
            </div>

            {/* Ad: Below hero */}
            <AdSlot slot="hero-banner" format="horizontal" className="my-6 sm:my-8 max-w-3xl mx-auto" />

            <ToolSelector onSelect={setTool} />

            {/* Trust pills */}
            <div className="mt-12 sm:mt-16 flex justify-center">
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {[
                  { icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>, label: "100% Private" },
                  { icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>, label: "No Upload Required" },
                  { icon: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></>, label: "100% Free" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                    style={{
                      color: "var(--text-muted)",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-primary)",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {item.icon}
                    </svg>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 sm:py-12 max-w-2xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
              <button onClick={reset} className="hover:opacity-80 transition-opacity">All Tools</button>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{toolMeta[tool].label}</span>
            </div>

            {/* Tool header */}
            <div className="text-center mb-8">
              <div
                className="inline-flex w-10 h-10 rounded-xl items-center justify-center mb-3"
                style={{ backgroundColor: toolMeta[tool].color + "15", color: toolMeta[tool].color }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h1
                className="text-xl sm:text-2xl font-bold mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                {toolMeta[tool].label}
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {toolMeta[tool].desc}
              </p>
            </div>

            {ActiveTool && <ActiveTool />}

            <AdSlot slot="tool-complete" format="rectangle" className="my-8" />
          </div>
        )}
      </div>

      {/* Ad: Above footer */}
      <AdSlot slot="footer-banner" format="horizontal" className="my-6 sm:my-8 max-w-3xl mx-auto px-4" />

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-primary)" }} className="mt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "var(--accent-primary)", color: "#fff" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <span className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>PDF Tools</span>
              </div>
              <p className="text-xs max-w-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Free, browser-based PDF tools. All processing happens locally — your files never leave your device.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <Link href="/guides" className="hover:opacity-80 transition-opacity">Guides</Link>
              <Link href="/faq" className="hover:opacity-80 transition-opacity">FAQ</Link>
              <Link href="/about" className="hover:opacity-80 transition-opacity">About</Link>
              <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</Link>
              <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms</Link>
            </div>
          </div>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid var(--border-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-dim)" }}>
              &copy; {new Date().getFullYear()} PDF Tools. All rights reserved.
            </p>
            {process.env.NEXT_PUBLIC_COMMIT_HASH && (
              <p className="text-[10px] mt-1 opacity-40" style={{ color: "var(--text-dim)" }}>
                v{process.env.NEXT_PUBLIC_COMMIT_HASH} &middot; {new Date(process.env.NEXT_PUBLIC_COMMIT_DATE || "").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      </footer>

      <CookieConsent />
    </main>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}
