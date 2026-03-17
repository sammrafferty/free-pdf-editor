"use client";
import { useState } from "react";
import Link from "next/link";
import ToolSelector from "./components/ToolSelector";
import AdSlot from "./components/AdSlot";
import CookieConsent from "./components/CookieConsent";
import SplitTool from "./components/tools/SplitTool";
import MergeTool from "./components/tools/MergeTool";
import CompressTool from "./components/tools/CompressTool";
import RotateTool from "./components/tools/RotateTool";
import DeletePagesTool from "./components/tools/DeletePagesTool";
import ExtractPagesTool from "./components/tools/ExtractPagesTool";
import WatermarkTool from "./components/tools/WatermarkTool";
import NumberPagesTool from "./components/tools/NumberPagesTool";
import CropTool from "./components/tools/CropTool";
import RedactTool from "./components/tools/RedactTool";
import SignTool from "./components/tools/SignTool";
import ImageToPdfTool from "./components/tools/ImageToPdfTool";
import PdfToImageTool from "./components/tools/PdfToImageTool";
import PdfToDocxTool from "./components/tools/PdfToDocxTool";
import DocxToPdfTool from "./components/tools/DocxToPdfTool";
import PdfToExcelTool from "./components/tools/PdfToExcelTool";
import ExcelToPdfTool from "./components/tools/ExcelToPdfTool";
import PdfToPptxTool from "./components/tools/PdfToPptxTool";
import PptxToPdfTool from "./components/tools/PptxToPdfTool";

export type Tool = "split" | "merge" | "compress" | "rotate" | "delete" | "extract" | "watermark" | "number" | "crop" | "redact" | "sign" | "imagetopdf" | "pdftoimage" | "pdftodocx" | "docxtopdf" | "pdftoexcel" | "exceltopdf" | "pdftopptx" | "pptxtopdf";

const toolMeta: Record<Tool, { label: string; desc: string; color: string }> = {
  split: { label: "Split PDF", desc: "Extract specific pages or ranges from your PDF", color: "#6366f1" },
  merge: { label: "Merge PDFs", desc: "Combine multiple PDF files into one document", color: "#3b82f6" },
  compress: { label: "Compress PDF", desc: "Reduce your PDF file size", color: "#10b981" },
  rotate: { label: "Rotate Pages", desc: "Rotate all or specific pages in your PDF", color: "#f59e0b" },
  delete: { label: "Delete Pages", desc: "Remove unwanted pages from your PDF", color: "#ef4444" },
  extract: { label: "Extract Pages", desc: "Pick and extract specific pages into a new PDF", color: "#8b5cf6" },
  watermark: { label: "Watermark", desc: "Add text watermark to all pages", color: "#0ea5e9" },
  number: { label: "Number Pages", desc: "Add page numbers to your PDF", color: "#6366f1" },
  crop: { label: "Crop PDF", desc: "Trim margins from all pages", color: "#14b8a6" },
  redact: { label: "Redact", desc: "Black out sensitive areas in your PDF", color: "#64748b" },
  sign: { label: "Sign PDF", desc: "Draw and embed your signature", color: "#d946ef" },
  imagetopdf: { label: "Image to PDF", desc: "Combine images into a single PDF", color: "#f97316" },
  pdftoimage: { label: "PDF to Image", desc: "Convert PDF pages to PNG images", color: "#ec4899" },
  pdftodocx: { label: "PDF to Word", desc: "Convert PDF to editable Word document", color: "#2563eb" },
  docxtopdf: { label: "Word to PDF", desc: "Convert Word document to PDF", color: "#2563eb" },
  pdftoexcel: { label: "PDF to Excel", desc: "Extract tables and data to spreadsheet", color: "#16a34a" },
  exceltopdf: { label: "Excel to PDF", desc: "Convert spreadsheet to PDF document", color: "#16a34a" },
  pdftopptx: { label: "PDF to PowerPoint", desc: "Convert PDF pages to presentation slides", color: "#dc2626" },
  pptxtopdf: { label: "PowerPoint to PDF", desc: "Convert presentation slides to PDF", color: "#dc2626" },
};

export default function Home() {
  const [tool, setTool] = useState<Tool | null>(null);

  const reset = () => setTool(null);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80">
            <img src="/logo.svg" alt="PDF Tools" className="w-8 h-8 sm:w-9 sm:h-9" />
            <span className="font-bold text-lg text-gray-900 tracking-tight">PDF Tools</span>
          </button>
          {tool && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="hidden sm:inline">All Tools</span>
              <span className="sm:hidden">Back</span>
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {!tool ? (
          <div className="py-10 sm:py-16">
            {/* Hero */}
            <div className="text-center mb-8 sm:mb-14">
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
                We Make PDF Easy.
              </h1>
              <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                All the tools you need to work with PDFs. Free, fast, and entirely in your browser — nothing gets uploaded.
              </p>
            </div>

            {/* Ad: Below hero, above tools */}
            <AdSlot slot="hero-banner" format="horizontal" className="my-6 sm:my-8 max-w-3xl mx-auto" />

            <ToolSelector onSelect={setTool} />

            {/* Trust banner */}
            <div className="mt-10 sm:mt-16 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  100% Private
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  No Upload Required
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                  100% Free
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 sm:py-12 max-w-2xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 sm:mb-6">
              <button onClick={reset} className="hover:text-gray-600 transition-colors">All Tools</button>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="text-gray-600 font-medium">{toolMeta[tool].label}</span>
            </div>

            {/* Accent bar */}
            <div className="flex justify-center mb-6">
              <div
                className="h-1 w-16 rounded-full"
                style={{ backgroundColor: toolMeta[tool].color }}
              />
            </div>

            {/* Tool header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{toolMeta[tool].label}</h1>
              <p className="text-gray-500 text-sm sm:text-base">{toolMeta[tool].desc}</p>
            </div>

            {tool === "split" && <SplitTool />}
            {tool === "merge" && <MergeTool />}
            {tool === "compress" && <CompressTool />}
            {tool === "rotate" && <RotateTool />}
            {tool === "delete" && <DeletePagesTool />}
            {tool === "extract" && <ExtractPagesTool />}
            {tool === "watermark" && <WatermarkTool />}
            {tool === "number" && <NumberPagesTool />}
            {tool === "crop" && <CropTool />}
            {tool === "redact" && <RedactTool />}
            {tool === "sign" && <SignTool />}
            {tool === "imagetopdf" && <ImageToPdfTool />}
            {tool === "pdftoimage" && <PdfToImageTool />}
            {tool === "pdftodocx" && <PdfToDocxTool />}
            {tool === "docxtopdf" && <DocxToPdfTool />}
            {tool === "pdftoexcel" && <PdfToExcelTool />}
            {tool === "exceltopdf" && <ExcelToPdfTool />}
            {tool === "pdftopptx" && <PdfToPptxTool />}
            {tool === "pptxtopdf" && <PptxToPdfTool />}

            {/* Ad: After tool completion */}
            <AdSlot slot="tool-complete" format="rectangle" className="my-8" />
          </div>
        )}
      </div>

      {/* Ad: Above footer */}
      <AdSlot slot="footer-banner" format="horizontal" className="my-6 sm:my-8 max-w-3xl mx-auto px-4" />

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            {/* Brand */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <img src="/logo.svg" alt="PDF Tools" className="w-6 h-6" />
                <span className="font-semibold text-gray-900 text-sm">PDF Tools</span>
              </div>
              <p className="text-xs text-gray-400 max-w-xs">
                Free, browser-based PDF tools. All processing happens locally — your files never leave your device.
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/about" className="hover:text-gray-600 transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-300">© {new Date().getFullYear()} PDF Tools. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cookie Consent */}
      <CookieConsent />
    </main>
  );
}
