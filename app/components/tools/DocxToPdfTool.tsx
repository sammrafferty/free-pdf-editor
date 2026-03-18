"use client";
import { useState, useRef } from "react";
import Dropzone from "../Dropzone";

export default function DocxToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const hiddenRef = useRef<HTMLDivElement>(null);

  const handleFile = (files: File[]) => {
    setFile(files[0]);
    setError("");
    setStatus("");
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setStatus("Reading Word document...");
    setError("");

    try {
      const mammoth = await import("mammoth");
      const buf = await file.arrayBuffer();

      setStatus("Converting to HTML...");
      const result = await mammoth.convertToHtml({ arrayBuffer: buf });

      if (!result.value || result.value.trim().length === 0) {
        setError("No content found in this document.");
        setLoading(false);
        return;
      }

      setStatus("Rendering document...");

      // Create a hidden container for rendering
      const container = hiddenRef.current;
      if (!container) throw new Error("Render container not found");

      container.innerHTML = `<div style="
        width: 595px; padding: 50px; font-family: 'Times New Roman', serif;
        font-size: 12pt; line-height: 1.5; color: #000; background: #fff;
      ">${result.value}</div>`;

      // Style tables, headings, etc.
      const style = document.createElement("style");
      style.textContent = `
        .docx-render-container table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        .docx-render-container td, .docx-render-container th { border: 1px solid #ccc; padding: 6px 8px; font-size: 11pt; }
        .docx-render-container h1 { font-size: 22pt; font-weight: bold; margin: 16px 0 8px; }
        .docx-render-container h2 { font-size: 18pt; font-weight: bold; margin: 14px 0 6px; }
        .docx-render-container h3 { font-size: 14pt; font-weight: bold; margin: 12px 0 6px; }
        .docx-render-container p { margin: 4px 0; }
        .docx-render-container ul, .docx-render-container ol { margin: 4px 0; padding-left: 24px; }
        .docx-render-container img { max-width: 100%; }
      `;
      container.appendChild(style);
      container.className = "docx-render-container";

      // Wait for images to load
      const imgs = container.querySelectorAll("img");
      if (imgs.length > 0) {
        await Promise.all(
          Array.from(imgs).map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) resolve();
                else {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                }
              })
          )
        );
      }

      setStatus("Generating PDF...");

      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default;
      const { jsPDF } = await import("jspdf");

      const renderTarget = container.firstElementChild as HTMLElement;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const canvas = await (html2canvas as any)(renderTarget, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "pt", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up
      container.innerHTML = "";

      pdf.save(file.name.replace(/\.docx$/i, "") + ".pdf");
      setStatus("Done! PDF downloaded.");
    } catch (e: unknown) {
      console.error("DOCX to PDF error:", e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
  };

  const accentColor = "#2563eb";
  const bgTint = "var(--bg-tertiary)";

  return (
    <div>
      {/* Hidden render container */}
      <div
        ref={hiddenRef}
        style={{ position: "absolute", left: "-9999px", top: 0, zIndex: -1 }}
      />

      {!file ? (
        <Dropzone
          onFiles={handleFile}
          label="Drop a Word document here (.docx)"
          accept={{
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
          }}
        />
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
                <p className="text-xs theme-text-muted">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setError(""); setStatus(""); }}
              className="theme-text-muted  text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Progress */}
          {loading && (
            <div className="p-4 rounded-xl border theme-border" style={{ backgroundColor: bgTint }}>
              <p className="text-sm font-medium" style={{ color: accentColor }}>{status}</p>
            </div>
          )}

          {/* Success */}
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
            {loading ? status : "Convert to PDF"}
          </button>

          <p className="text-xs theme-text-muted text-center leading-relaxed">
            Converts Word documents to PDF. Preserves headings, lists, tables, and images.
          </p>
        </div>
      )}
    </div>
  );
}
