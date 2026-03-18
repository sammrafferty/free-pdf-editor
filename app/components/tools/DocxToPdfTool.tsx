"use client";
import { useState } from "react";
import Dropzone from "../Dropzone";

export default function DocxToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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

      setStatus("Generating PDF...");

      const { jsPDF } = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      const PAGE_WIDTH = 595.28;
      const PAGE_HEIGHT = 841.89;
      const MARGIN = 50;
      const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;
      const USABLE_HEIGHT = PAGE_HEIGHT - MARGIN * 2;

      const pdf = new jsPDF("p", "pt", "a4");
      let y = MARGIN;

      const HEADING_SIZES: Record<string, number> = {
        H1: 22, H2: 18, H3: 16, H4: 14, H5: 13, H6: 12,
      };
      const DEFAULT_SIZE = 12;
      const LINE_HEIGHT_FACTOR = 1.4;
      const PARAGRAPH_SPACING = 8;

      function ensureSpace(needed: number) {
        if (y + needed > PAGE_HEIGHT - MARGIN) {
          pdf.addPage();
          y = MARGIN;
        }
      }

      function setFont(style: "normal" | "bold" | "italic" | "bolditalic", size: number) {
        pdf.setFontSize(size);
        pdf.setFont("Helvetica", style);
      }

      function getFontStyle(bold: boolean, italic: boolean): "normal" | "bold" | "italic" | "bolditalic" {
        if (bold && italic) return "bolditalic";
        if (bold) return "bold";
        if (italic) return "italic";
        return "normal";
      }

      // Render inline text content from an element, handling nested bold/italic
      function renderInlineText(
        el: Element,
        fontSize: number,
        inheritBold: boolean,
        inheritItalic: boolean,
        indent: number,
        prefix: string
      ) {
        // Collect all text runs with their styles
        const runs: { text: string; bold: boolean; italic: boolean }[] = [];
        collectRuns(el, inheritBold, inheritItalic, runs);

        const fullText = (prefix + runs.map((r) => r.text).join("")).trim();
        if (!fullText) return;

        const lineHeight = fontSize * LINE_HEIGHT_FACTOR;
        const availWidth = MAX_WIDTH - indent;

        // If all runs share the same style, render simply
        const allSameStyle = runs.every(
          (r) => r.bold === runs[0]?.bold && r.italic === runs[0]?.italic
        );

        if (allSameStyle || runs.length <= 1) {
          const bold = runs[0]?.bold ?? inheritBold;
          const italic = runs[0]?.italic ?? inheritItalic;
          setFont(getFontStyle(bold, italic), fontSize);
          const lines: string[] = pdf.splitTextToSize(fullText, availWidth);
          for (const line of lines) {
            ensureSpace(lineHeight);
            pdf.text(line, MARGIN + indent, y);
            y += lineHeight;
          }
        } else {
          // Mixed styles: render all as single block with dominant style
          // (Full mixed-style inline rendering on a single line is complex;
          //  we approximate by using the outermost style for wrapping.)
          setFont(getFontStyle(inheritBold, inheritItalic), fontSize);
          const lines: string[] = pdf.splitTextToSize(fullText, availWidth);
          for (const line of lines) {
            ensureSpace(lineHeight);
            // Determine which runs contribute to this line and render segments
            pdf.text(line, MARGIN + indent, y);
            y += lineHeight;
          }
        }
      }

      function collectRuns(
        node: Node,
        bold: boolean,
        italic: boolean,
        runs: { text: string; bold: boolean; italic: boolean }[]
      ) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent || "";
            if (text) runs.push({ text, bold, italic });
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const tag = (child as Element).tagName;
            const nextBold = bold || tag === "STRONG" || tag === "B";
            const nextItalic = italic || tag === "EM" || tag === "I";
            if (tag === "BR") {
              runs.push({ text: "\n", bold, italic });
            } else {
              collectRuns(child, nextBold, nextItalic, runs);
            }
          }
        }
      }

      function renderElement(el: Element, indent: number, listCounter?: { count: number }) {
        const tag = el.tagName;

        // Headings
        if (HEADING_SIZES[tag]) {
          const size = HEADING_SIZES[tag];
          const lineHeight = size * LINE_HEIGHT_FACTOR;
          ensureSpace(lineHeight);
          y += 4; // small top margin before heading
          renderInlineText(el, size, true, false, indent, "");
          y += PARAGRAPH_SPACING;
          return;
        }

        // Paragraph
        if (tag === "P") {
          renderInlineText(el, DEFAULT_SIZE, false, false, indent, "");
          y += PARAGRAPH_SPACING;
          return;
        }

        // Line break
        if (tag === "BR") {
          y += DEFAULT_SIZE * LINE_HEIGHT_FACTOR;
          return;
        }

        // Unordered list
        if (tag === "UL") {
          for (let i = 0; i < el.children.length; i++) {
            const li = el.children[i];
            if (li.tagName === "LI") {
              // Check for nested lists
              let hasNestedList = false;
              for (let j = 0; j < li.children.length; j++) {
                const child = li.children[j];
                if (child.tagName === "UL" || child.tagName === "OL") {
                  // Render text content before nested list
                  const textContent = getDirectTextContent(li);
                  if (textContent.trim()) {
                    renderInlineText(li, DEFAULT_SIZE, false, false, indent + 20, "\u2022 ");
                    y += 2;
                  }
                  renderElement(child, indent + 20);
                  hasNestedList = true;
                }
              }
              if (!hasNestedList) {
                renderInlineText(li, DEFAULT_SIZE, false, false, indent + 20, "\u2022 ");
                y += 2;
              }
            }
          }
          y += PARAGRAPH_SPACING;
          return;
        }

        // Ordered list
        if (tag === "OL") {
          let counter = 1;
          for (let i = 0; i < el.children.length; i++) {
            const li = el.children[i];
            if (li.tagName === "LI") {
              let hasNestedList = false;
              for (let j = 0; j < li.children.length; j++) {
                const child = li.children[j];
                if (child.tagName === "UL" || child.tagName === "OL") {
                  const textContent = getDirectTextContent(li);
                  if (textContent.trim()) {
                    renderInlineText(li, DEFAULT_SIZE, false, false, indent + 20, `${counter}. `);
                    y += 2;
                  }
                  renderElement(child, indent + 20);
                  hasNestedList = true;
                }
              }
              if (!hasNestedList) {
                renderInlineText(li, DEFAULT_SIZE, false, false, indent + 20, `${counter}. `);
                y += 2;
              }
              counter++;
            }
          }
          y += PARAGRAPH_SPACING;
          return;
        }

        // Table
        if (tag === "TABLE") {
          const head: string[][] = [];
          const body: string[][] = [];

          const thead = el.querySelector("thead");
          const tbody = el.querySelector("tbody");

          if (thead) {
            thead.querySelectorAll("tr").forEach((tr) => {
              const row: string[] = [];
              tr.querySelectorAll("th, td").forEach((cell) => {
                row.push(cell.textContent?.trim() || "");
              });
              head.push(row);
            });
          }

          const bodySource = tbody || el;
          bodySource.querySelectorAll("tr").forEach((tr) => {
            // Skip rows that were already in thead
            if (thead && tr.parentElement === thead) return;
            const row: string[] = [];
            tr.querySelectorAll("th, td").forEach((cell) => {
              row.push(cell.textContent?.trim() || "");
            });
            if (row.length > 0) body.push(row);
          });

          if (body.length > 0 || head.length > 0) {
            ensureSpace(40);
            autoTable(pdf, {
              startY: y,
              head: head.length > 0 ? head : undefined,
              body: body,
              margin: { left: MARGIN + indent, right: MARGIN },
              styles: { fontSize: 10, font: "Helvetica" },
              headStyles: { fillColor: [66, 66, 66] },
              theme: "grid",
            });
            // @ts-expect-error lastAutoTable is added by jspdf-autotable
            y = pdf.lastAutoTable.finalY + PARAGRAPH_SPACING;
          }
          return;
        }

        // Image
        if (tag === "IMG") {
          const src = el.getAttribute("src");
          if (src && src.startsWith("data:")) {
            try {
              // Determine format from data URI
              let format = "PNG";
              if (src.includes("image/jpeg") || src.includes("image/jpg")) format = "JPEG";
              else if (src.includes("image/png")) format = "PNG";
              else if (src.includes("image/gif")) format = "GIF";

              // Create a temporary image to get dimensions
              const img = new Image();
              img.src = src;

              // Use reasonable defaults - scale to fit page width
              let imgWidth = MAX_WIDTH - indent;
              let imgHeight = imgWidth * 0.6; // default aspect ratio

              // Try to get actual dimensions
              if (img.naturalWidth && img.naturalHeight) {
                const ratio = img.naturalHeight / img.naturalWidth;
                imgWidth = Math.min(MAX_WIDTH - indent, img.naturalWidth);
                imgHeight = imgWidth * ratio;
              }

              // Cap height to usable page height
              if (imgHeight > USABLE_HEIGHT * 0.8) {
                imgHeight = USABLE_HEIGHT * 0.8;
                imgWidth = imgHeight / ((img.naturalHeight || 1) / (img.naturalWidth || 1));
              }

              ensureSpace(imgHeight + 10);
              pdf.addImage(src, format, MARGIN + indent, y, imgWidth, imgHeight);
              y += imgHeight + PARAGRAPH_SPACING;
            } catch (e) {
              console.warn("Failed to add image to PDF:", e);
            }
          }
          return;
        }

        // Generic container (div, span, etc.) — recurse into children
        for (let i = 0; i < el.children.length; i++) {
          renderElement(el.children[i], indent, listCounter);
        }
      }

      function getDirectTextContent(el: Element): string {
        let text = "";
        for (let i = 0; i < el.childNodes.length; i++) {
          const child = el.childNodes[i];
          if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent || "";
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const tag = (child as Element).tagName;
            if (tag !== "UL" && tag !== "OL") {
              text += child.textContent || "";
            }
          }
        }
        return text;
      }

      // Parse HTML and render
      setStatus("Rendering content to PDF...");
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.value, "text/html");
      const bodyChildren = doc.body.children;

      for (let i = 0; i < bodyChildren.length; i++) {
        renderElement(bodyChildren[i], 0);
      }

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
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
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
