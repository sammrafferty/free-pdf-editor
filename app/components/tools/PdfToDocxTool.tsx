"use client";
import { useState } from "react";
import Dropzone from "../Dropzone";

type QualityMode = "fast" | "full";

interface TextItem {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  width: number;
  height: number;
  color?: { r: number; g: number; b: number };
  hasEOL: boolean;
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
  alignment: "left" | "center" | "right";
  fontSize: number;
  fontName: string;
  isBold: boolean;
  isItalic: boolean;
  indent: number;
  isBullet: boolean;
  bulletChar: string;
  isNumberedList: boolean;
  listNumber: string;
  color?: { r: number; g: number; b: number };
}

interface ExtractedImage {
  data: Uint8Array;
  width: number;
  height: number;
  format: "png" | "jpeg";
}

interface PageContent {
  paragraphs: ParagraphGroup[];
  images: ExtractedImage[];
  width: number;
  height: number;
}

export default function PdfToDocxTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [quality, setQuality] = useState<QualityMode>("full");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setError("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const buf = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      setPageCount(doc.numPages);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("password") || msg.includes("encrypted")) {
        setError("This PDF is password-protected. Please remove the password first.");
      } else {
        setError("Could not read this PDF. It may be corrupted.");
      }
      setFile(null);
    }
  };

  const extractTextItems = async (page: import("pdfjs-dist").PDFPageProxy): Promise<TextItem[]> => {
    const textContent = await page.getTextContent();
    const items: TextItem[] = [];

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
      // Font size from transform matrix
      const fontSize = Math.abs(tx[0]) || Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]) || 12;
      const x = tx[4];
      const y = tx[5];

      items.push({
        str: ti.str,
        x,
        y,
        fontSize: Math.round(fontSize * 10) / 10,
        fontName: ti.fontName || "",
        width: ti.width || 0,
        height: ti.height || fontSize,
        hasEOL: ti.hasEOL,
      });
    }
    return items;
  };

  const groupIntoLines = (items: TextItem[], pageHeight: number): LineGroup[] => {
    if (items.length === 0) return [];

    // Sort by Y descending (PDF coords: bottom-up), then X ascending
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
        // Sort current line items by X
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

    // Detect columns: if items cluster into distinct X regions
    void pageHeight; // page height available for future use
    return lines;
  };

  const buildLineGroup = (items: TextItem[]): LineGroup => {
    const text = items.map((it) => it.str).join("");
    const avgFontSize = items.reduce((s, it) => s + it.fontSize, 0) / items.length;
    return {
      items,
      y: items[0].y,
      minX: Math.min(...items.map((it) => it.x)),
      maxX: Math.max(...items.map((it) => it.x + it.width)),
      avgFontSize,
      text,
    };
  };

  const detectAlignment = (
    lines: LineGroup[],
    pageWidth: number,
    leftMargin: number
  ): "left" | "center" | "right" => {
    if (lines.length === 0) return "left";
    if (lines.length === 1) {
      const line = lines[0];
      const lineCenter = (line.minX + line.maxX) / 2;
      const pageCenter = pageWidth / 2;
      if (Math.abs(lineCenter - pageCenter) < pageWidth * 0.1) return "center";
      if (line.minX > pageWidth * 0.6) return "right";
      return "left";
    }

    // Check if lines are centered
    const centers = lines.map((l) => (l.minX + l.maxX) / 2);
    const avgCenter = centers.reduce((s, c) => s + c, 0) / centers.length;
    const centerDeviation = centers.reduce((s, c) => s + Math.abs(c - avgCenter), 0) / centers.length;
    const pageCenter = pageWidth / 2;
    if (Math.abs(avgCenter - pageCenter) < pageWidth * 0.1 && centerDeviation < pageWidth * 0.05) {
      return "center";
    }

    // Check right alignment
    const rightEdges = lines.map((l) => l.maxX);
    const avgRight = rightEdges.reduce((s, r) => s + r, 0) / rightEdges.length;
    const rightDeviation = rightEdges.reduce((s, r) => s + Math.abs(r - avgRight), 0) / rightEdges.length;
    const leftEdges = lines.map((l) => l.minX);
    const leftDeviation = leftEdges.reduce((s, l) => s + Math.abs(l - leftMargin), 0) / leftEdges.length;

    if (rightDeviation < 5 && leftDeviation > 20) return "right";
    return "left";
  };

  const groupIntoParagraphs = (lines: LineGroup[], pageWidth: number): ParagraphGroup[] => {
    if (lines.length === 0) return [];

    // Find most common left margin and font size (body text)
    const leftPositions = lines.map((l) => Math.round(l.minX));
    const leftCounts: Record<number, number> = {};
    leftPositions.forEach((p) => {
      const rounded = Math.round(p / 5) * 5;
      leftCounts[rounded] = (leftCounts[rounded] || 0) + 1;
    });
    const bodyLeftMargin = Number(
      Object.entries(leftCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 0
    );

    const fontSizes = lines.map((l) => Math.round(l.avgFontSize));
    const sizeCounts: Record<number, number> = {};
    fontSizes.forEach((s) => {
      sizeCounts[s] = (sizeCounts[s] || 0) + 1;
    });
    const bodyFontSize = Number(
      Object.entries(sizeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 12
    );

    const paragraphs: ParagraphGroup[] = [];
    let currentLines: LineGroup[] = [lines[0]];

    for (let i = 1; i < lines.length; i++) {
      const prevLine = lines[i - 1];
      const currLine = lines[i];
      const gap = prevLine.y - currLine.y;
      const lineHeight = prevLine.avgFontSize * 1.4;
      const isNewParagraph =
        gap > lineHeight * 1.8 ||
        Math.abs(currLine.avgFontSize - prevLine.avgFontSize) > 1 ||
        isBulletLine(currLine.text) ||
        isNumberedLine(currLine.text);

      if (isNewParagraph) {
        paragraphs.push(buildParagraph(currentLines, pageWidth, bodyLeftMargin, bodyFontSize));
        currentLines = [currLine];
      } else {
        currentLines.push(currLine);
      }
    }
    if (currentLines.length > 0) {
      paragraphs.push(buildParagraph(currentLines, pageWidth, bodyLeftMargin, bodyFontSize));
    }

    return paragraphs;
  };

  const isBulletLine = (text: string): boolean => /^\s*[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s/.test(text);
  const isNumberedLine = (text: string): boolean => /^\s*\d+[\.\)]\s/.test(text);

  const buildParagraph = (
    lines: LineGroup[],
    pageWidth: number,
    bodyLeftMargin: number,
    bodyFontSize: number
  ): ParagraphGroup => {
    const firstLine = lines[0];
    const primaryItem = firstLine.items[0];
    const fontName = primaryItem?.fontName || "";
    const fontSize = firstLine.avgFontSize;
    const isBold = /bold/i.test(fontName) || /\-B$/.test(fontName);
    const isItalic = /italic|oblique/i.test(fontName) || /\-I$/.test(fontName);
    const indent = Math.max(0, Math.round(firstLine.minX - bodyLeftMargin));
    const text = firstLine.text;
    const bullet = isBulletLine(text);
    const numbered = isNumberedLine(text);

    let bulletChar = "";
    let listNumber = "";
    if (bullet) {
      const match = text.match(/^\s*([•\-\*\u2022\u2023\u25E6\u2043\u2219])\s/);
      bulletChar = match ? match[1] : "•";
    }
    if (numbered) {
      const match = text.match(/^\s*(\d+[\.\)])\s/);
      listNumber = match ? match[1] : "";
    }

    const alignment = detectAlignment(lines, pageWidth, bodyLeftMargin);

    return {
      lines,
      alignment,
      fontSize,
      fontName,
      isBold,
      isItalic,
      indent: indent > 10 ? indent : 0,
      isBullet: bullet,
      bulletChar,
      isNumberedList: numbered,
      listNumber,
      color: undefined,
    };
  };

  const extractImages = async (page: import("pdfjs-dist").PDFPageProxy): Promise<ExtractedImage[]> => {
    const images: ExtractedImage[] = [];
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const ops = await page.getOperatorList();
      const OPS = pdfjsLib.OPS;

      for (let i = 0; i < ops.fnArray.length; i++) {
        if (
          ops.fnArray[i] === OPS.paintImageXObject ||
          ops.fnArray[i] === (OPS as Record<string, number>)["paintJpegXObject"]
        ) {
          const imgName = ops.argsArray[i][0];
          try {
            const imgData = await new Promise<{
              width: number;
              height: number;
              data?: Uint8ClampedArray;
              src?: string;
              kind?: number;
            }>((resolve, reject) => {
              // Try page.objs first, then commonObjs
              page.objs.get(imgName, (data: unknown) => {
                if (data) resolve(data as { width: number; height: number; data?: Uint8ClampedArray; src?: string; kind?: number });
                else reject(new Error("No image data"));
              });
            }).catch(() => {
              return new Promise<{
                width: number;
                height: number;
                data?: Uint8ClampedArray;
                src?: string;
                kind?: number;
              }>((resolve, reject) => {
                page.commonObjs.get(imgName, (data: unknown) => {
                  if (data) resolve(data as { width: number; height: number; data?: Uint8ClampedArray; src?: string; kind?: number });
                  else reject(new Error("No image data"));
                });
              });
            });

            if (!imgData || imgData.width < 10 || imgData.height < 10) continue;

            // If it's already a JPEG (has src property)
            if (imgData.src) {
              try {
                const response = await fetch(imgData.src);
                const blob = await response.blob();
                const arrayBuf = await blob.arrayBuffer();
                images.push({
                  data: new Uint8Array(arrayBuf),
                  width: imgData.width,
                  height: imgData.height,
                  format: "jpeg",
                });
              } catch {
                // Skip if fetch fails
              }
              continue;
            }

            // Convert raw RGBA data to PNG using canvas
            if (imgData.data) {
              const canvas = document.createElement("canvas");
              canvas.width = imgData.width;
              canvas.height = imgData.height;
              const ctx = canvas.getContext("2d")!;

              // imgData.data might be RGB or RGBA
              let imageDataArr: Uint8ClampedArray;
              if (imgData.data.length === imgData.width * imgData.height * 4) {
                imageDataArr = imgData.data;
              } else if (imgData.data.length === imgData.width * imgData.height * 3) {
                // Convert RGB to RGBA
                imageDataArr = new Uint8ClampedArray(imgData.width * imgData.height * 4);
                for (let j = 0; j < imgData.width * imgData.height; j++) {
                  imageDataArr[j * 4] = imgData.data[j * 3];
                  imageDataArr[j * 4 + 1] = imgData.data[j * 3 + 1];
                  imageDataArr[j * 4 + 2] = imgData.data[j * 3 + 2];
                  imageDataArr[j * 4 + 3] = 255;
                }
              } else {
                continue;
              }

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const idata = new ImageData(imageDataArr as any, imgData.width, imgData.height);
              ctx.putImageData(idata, 0, 0);

              const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, "image/png")
              );
              if (blob) {
                const arrayBuf = await blob.arrayBuffer();
                images.push({
                  data: new Uint8Array(arrayBuf),
                  width: imgData.width,
                  height: imgData.height,
                  format: "png",
                });
              }
            }
          } catch {
            // Skip problematic images
          }
        }
      }
    } catch {
      // Image extraction failed, continue without images
    }
    return images;
  };

  const extractPageContent = async (
    page: import("pdfjs-dist").PDFPageProxy,
    mode: QualityMode
  ): Promise<PageContent> => {
    const viewport = page.getViewport({ scale: 1 });
    const pageWidth = viewport.width;
    const pageHeight = viewport.height;

    const textItems = await extractTextItems(page);
    const lines = groupIntoLines(textItems, pageHeight);
    const paragraphs = groupIntoParagraphs(lines, pageWidth);

    let images: ExtractedImage[] = [];
    if (mode === "full") {
      images = await extractImages(page);
    }

    return {
      paragraphs,
      images,
      width: pageWidth,
      height: pageHeight,
    };
  };

  const buildDocx = async (pages: PageContent[]) => {
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      HeadingLevel,
      AlignmentType,
      PageBreak,
      ImageRun,
      convertInchesToTwip,
    } = await import("docx");

    // Find body font size across all pages
    const allFontSizes: number[] = [];
    for (const page of pages) {
      for (const p of page.paragraphs) {
        allFontSizes.push(p.fontSize);
      }
    }
    const sizeFreq: Record<number, number> = {};
    allFontSizes.forEach((s) => {
      const rounded = Math.round(s);
      sizeFreq[rounded] = (sizeFreq[rounded] || 0) + 1;
    });
    const bodySize = Number(
      Object.entries(sizeFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 12
    );

    const docChildren: (
      | InstanceType<typeof Paragraph>
    )[] = [];

    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
      const page = pages[pageIdx];

      // Add images at the start of the page
      for (const img of page.images) {
        try {
          // Scale image to fit within page width (~6.5 inches)
          const maxWidthInches = 6;
          const aspectRatio = img.height / img.width;
          let imgWidthInches = Math.min(img.width / 96, maxWidthInches);
          let imgHeightInches = imgWidthInches * aspectRatio;
          if (imgHeightInches > 8) {
            imgHeightInches = 8;
            imgWidthInches = imgHeightInches / aspectRatio;
          }

          docChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: img.data,
                  transformation: {
                    width: convertInchesToTwip(imgWidthInches) / 15,
                    height: convertInchesToTwip(imgHeightInches) / 15,
                  },
                  type: img.format === "jpeg" ? "jpg" : "png",
                }),
              ],
              spacing: { after: 200 },
            })
          );
        } catch {
          // Skip problematic images
        }
      }

      for (let pIdx = 0; pIdx < page.paragraphs.length; pIdx++) {
        const para = page.paragraphs[pIdx];

        // Determine heading level
        let headingLevel: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
        const sizeRatio = para.fontSize / bodySize;
        if (sizeRatio >= 1.8) headingLevel = HeadingLevel.HEADING_1;
        else if (sizeRatio >= 1.4) headingLevel = HeadingLevel.HEADING_2;
        else if (sizeRatio >= 1.15 && para.isBold) headingLevel = HeadingLevel.HEADING_3;

        // Build alignment
        let alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT;
        if (para.alignment === "center") alignment = AlignmentType.CENTER;
        else if (para.alignment === "right") alignment = AlignmentType.RIGHT;

        // Build text runs from all lines
        const runs: InstanceType<typeof TextRun>[] = [];
        const fullText = para.lines
          .map((l) => l.text)
          .join(" ")
          .trim();

        // Strip bullet/number prefix for clean text
        let displayText = fullText;
        if (para.isBullet) {
          displayText = fullText.replace(/^\s*[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/, "");
        }
        if (para.isNumberedList) {
          displayText = fullText.replace(/^\s*\d+[\.\)]\s*/, "");
        }

        if (!displayText.trim()) continue;

        // Map PDF font size to Word half-points (Word uses half-points)
        // PDF points ≈ Word points, Word size field is in half-points
        const wordSize = headingLevel ? undefined : Math.round(para.fontSize * 2);

        runs.push(
          new TextRun({
            text: displayText,
            bold: para.isBold || !!headingLevel,
            italics: para.isItalic,
            size: wordSize,
            color: para.color
              ? `${para.color.r.toString(16).padStart(2, "0")}${para.color.g.toString(16).padStart(2, "0")}${para.color.b.toString(16).padStart(2, "0")}`
              : undefined,
          })
        );

        // Calculate spacing based on gaps
        let spacingAfter = 120; // default ~6pt after
        if (pIdx < page.paragraphs.length - 1) {
          const nextPara = page.paragraphs[pIdx + 1];
          const gap =
            para.lines[para.lines.length - 1].y - nextPara.lines[0].y;
          if (gap > para.fontSize * 3) spacingAfter = 360;
          else if (gap > para.fontSize * 2) spacingAfter = 240;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paragraphOptions: any = {
          children: runs,
          heading: headingLevel,
          alignment,
          spacing: { after: spacingAfter },
          indent: para.indent > 10 ? { left: para.indent * 15 } : undefined,
        };

        // Bullet/number handling
        if (para.isBullet) {
          paragraphOptions.bullet = { level: 0 };
        }

        docChildren.push(new Paragraph(paragraphOptions));
      }

      // Page break between pages (not after last)
      if (pageIdx < pages.length - 1) {
        docChildren.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }
    }

    // If no content was extracted, add a notice
    if (docChildren.length === 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "No extractable text was found in this PDF. It may be a scanned document — OCR is not supported in the browser.",
              italics: true,
              color: "888888",
            }),
          ],
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          children: docChildren,
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
                left: convertInchesToTwip(1),
              },
            },
          },
        },
      ],
    });

    return Packer.toBlob(doc);
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setStatus("Loading PDF...");
    setError("");

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const buf = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buf }).promise;
      const totalPages = doc.numPages;
      const pages: PageContent[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress(i);
        setStatus(
          quality === "full"
            ? `Extracting text & images from page ${i} of ${totalPages}...`
            : `Extracting text from page ${i} of ${totalPages}...`
        );
        const page = await doc.getPage(i);
        const content = await extractPageContent(page, quality);
        pages.push(content);
      }

      // Check if any text was found
      const totalParagraphs = pages.reduce((s, p) => s + p.paragraphs.length, 0);
      const totalImages = pages.reduce((s, p) => s + p.images.length, 0);

      if (totalParagraphs === 0 && totalImages === 0) {
        setError(
          "No text or images could be extracted. This PDF may be a scanned document — OCR is not supported in the browser."
        );
        setLoading(false);
        return;
      }

      setStatus("Building DOCX file...");
      const blob = await buildDocx(pages);

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + ".docx";
      a.click();
      URL.revokeObjectURL(url);

      setStatus(
        `Done! Extracted ${totalParagraphs} paragraph${totalParagraphs !== 1 ? "s" : ""}${
          totalImages > 0 ? ` and ${totalImages} image${totalImages !== 1 ? "s" : ""}` : ""
        }.`
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("PDF to DOCX error:", e);
      if (msg.includes("password") || msg.includes("encrypted")) {
        setError("This PDF is password-protected. Please remove the password first.");
      } else {
        setError("Conversion failed: " + msg);
      }
    }
    setLoading(false);
  };

  const accentColor = "#2563eb";
  const bgTint = "#eff6ff";

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
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
                <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {pageCount} page{pageCount !== 1 ? "s" : ""} &middot;{" "}
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPageCount(0);
                setError("");
                setStatus("");
              }}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Quality selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conversion Quality
            </label>
            <div className="flex gap-2">
              {(
                [
                  { key: "fast" as QualityMode, label: "Fast", desc: "Text only" },
                  { key: "full" as QualityMode, label: "Full", desc: "Text + images + formatting" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setQuality(opt.key)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    quality === opt.key
                      ? "text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                  style={
                    quality === opt.key
                      ? { backgroundColor: accentColor, borderColor: accentColor }
                      : {}
                  }
                >
                  <div>{opt.label}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      quality === opt.key ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Progress */}
          {loading && (
            <div className="p-4 rounded-xl border border-gray-100" style={{ backgroundColor: bgTint }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: accentColor }}>
                  {status}
                </span>
                <span className="text-xs text-gray-500">
                  {progress} / {pageCount}
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    backgroundColor: accentColor,
                    width: `${(progress / pageCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Success status */}
          {!loading && status && !error && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50">
              <p className="text-sm text-green-700">{status}</p>
            </div>
          )}

          {/* Convert button */}
          <button
            onClick={handleConvert}
            disabled={loading}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            style={!loading ? { backgroundColor: accentColor } : {}}
          >
            {loading
              ? `Converting page ${progress} of ${pageCount}...`
              : "Convert to Word Document"}
          </button>

          {/* Info note */}
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Works best with text-based PDFs. Scanned documents (image-only PDFs) require OCR which
            isn&apos;t available in the browser.
          </p>
        </div>
      )}
    </div>
  );
}
