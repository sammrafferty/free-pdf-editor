"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";

type PageSize = "fit" | "a4" | "letter";
type MarginPreset = "none" | "small" | "normal";

const PAGE_SIZES: { key: PageSize; label: string; w: number; h: number }[] = [
  { key: "fit", label: "Fit to Image", w: 0, h: 0 },
  { key: "a4", label: "A4", w: 595.28, h: 841.89 },
  { key: "letter", label: "Letter", w: 612, h: 792 },
];

const MARGINS: { key: MarginPreset; label: string; pt: number }[] = [
  { key: "none", label: "None", pt: 0 },
  { key: "small", label: "Small (0.5in)", pt: 36 },
  { key: "normal", label: "Normal (1in)", pt: 72 },
];

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/gif",
  "image/tiff",
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per file

export default function ImageToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageSize, setPageSize] = useState<PageSize>("fit");
  const [marginPreset, setMarginPreset] = useState<MarginPreset>("none");
  const [previews, setPreviews] = useState<Record<string, string>>({});

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  // Ref to track current preview URLs for proper cleanup on unmount
  const previewsRef = useRef<Record<string, string>>({});
  previewsRef.current = previews;

  // Generate preview URLs for files
  useEffect(() => {
    const currentPreviews = previewsRef.current;
    const newPreviews: Record<string, string> = {};
    const toRevoke: string[] = [];

    files.forEach((f) => {
      const key = `${f.name}-${f.size}-${f.lastModified}`;
      if (currentPreviews[key]) {
        newPreviews[key] = currentPreviews[key];
      } else {
        const url = URL.createObjectURL(f);
        newPreviews[key] = url;
      }
    });

    // Revoke URLs no longer in use
    for (const [key, url] of Object.entries(currentPreviews)) {
      if (!newPreviews[key]) {
        toRevoke.push(url);
      }
    }
    toRevoke.forEach((url) => URL.revokeObjectURL(url));

    setPreviews(newPreviews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  // Cleanup all previews on unmount
  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

  const handleFiles = useCallback((incoming: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const f of incoming) {
      if (!f.type || !ACCEPTED_TYPES.has(f.type)) {
        errors.push(`"${f.name}" is not a supported image format.`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        errors.push(`"${f.name}" exceeds the 50 MB size limit.`);
        continue;
      }
      if (f.size === 0) {
        errors.push(`"${f.name}" is empty.`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
    if (errors.length > 0) {
      setError(errors.join(" "));
    } else {
      setError("");
    }
  }, []);

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const fmt = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  /* -- Drag-and-drop handlers -- */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex === null) return;
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setFiles((prev) => {
      const a = [...prev];
      const [moved] = a.splice(dragIndex, 1);
      a.splice(dropIndex > dragIndex ? dropIndex - 1 : dropIndex, 0, moved);
      return a;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  /**
   * Convert any image to PNG bytes via canvas.
   * This handles WebP, BMP, and other formats that pdf-lib can't embed directly.
   */
  const convertToPng = async (file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (w === 0 || h === 0) {
          return reject(new Error(`Image "${file.name}" has zero dimensions.`));
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Could not get canvas 2D context."));
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Canvas toBlob failed"));
            blob.arrayBuffer().then(
              (ab) => resolve(new Uint8Array(ab)),
              (err) => reject(new Error(`Failed to read converted image: ${err}`))
            );
          },
          "image/png"
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`Failed to load image: ${file.name}`));
      };
      img.src = objectUrl;
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const pdf = await PDFDocument.create();
      const sizeConfig = PAGE_SIZES.find((s) => s.key === pageSize)!;
      const margin = pageSize === "fit" ? 0 : MARGINS.find((m) => m.key === marginPreset)!.pt;

      for (const file of files) {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        const type = file.type;

        let img;
        if (type === "image/png") {
          img = await pdf.embedPng(bytes);
        } else if (type === "image/jpeg") {
          img = await pdf.embedJpg(bytes);
        } else {
          // WebP, BMP, or other formats -- convert to PNG via canvas
          const pngBytes = await convertToPng(file);
          img = await pdf.embedPng(pngBytes);
        }

        const imgW = img.width;
        const imgH = img.height;

        // Guard against zero-dimension images
        if (imgW <= 0 || imgH <= 0) {
          throw new Error(`Image "${file.name}" has invalid dimensions (${imgW}x${imgH}).`);
        }

        if (pageSize === "fit") {
          // Page matches image dimensions exactly
          const page = pdf.addPage([imgW, imgH]);
          page.drawImage(img, { x: 0, y: 0, width: imgW, height: imgH });
        } else {
          // Fixed page size with margins, aspect ratio preserved, centered
          const pageW = sizeConfig.w;
          const pageH = sizeConfig.h;
          const availW = pageW - 2 * margin;
          const availH = pageH - 2 * margin;

          // Guard against margins consuming entire page
          if (availW <= 0 || availH <= 0) {
            throw new Error("Margins are too large for the selected page size.");
          }

          const scale = Math.min(availW / imgW, availH / imgH);
          const drawW = imgW * scale;
          const drawH = imgH * scale;
          const x = margin + (availW - drawW) / 2;
          const y = margin + (availH - drawH) / 2;

          const page = pdf.addPage([pageW, pageH]);
          page.drawImage(img, { x, y, width: drawW, height: drawH });
        }
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      downloadBlob(blob, "images_to_pdf.pdf");
    } catch (e) {
      console.error(e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dropzone
        onFiles={handleFiles}
        multiple
        label="Drop images here (JPG, PNG, WebP)"
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
      />

      {files.length > 0 && (
        <div className="mt-5 space-y-0">
          {/* Page size selector */}
          <div className="mb-4">
            <p className="text-xs font-semibold theme-text-muted uppercase tracking-wide mb-2">Page Size</p>
            <div className="flex gap-2">
              {PAGE_SIZES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setPageSize(s.key)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={
                    pageSize === s.key
                      ? { backgroundColor: "#fb923c", color: "#fff" }
                      : { backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Margin selector -- only for fixed page sizes */}
          {pageSize !== "fit" && (
            <div className="mb-4">
              <p className="text-xs font-semibold theme-text-muted uppercase tracking-wide mb-2">Margins</p>
              <div className="flex gap-2">
                {MARGINS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMarginPreset(m.key)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={
                      marginPreset === m.key
                        ? { backgroundColor: "#fb923c", color: "#fff" }
                        : { backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }
                    }
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File list with drag-and-drop */}
          {files.map((f, i) => (
            <div key={`${fileKey(f)}-${i}`}>
              {/* Drop indicator line */}
              {dragOverIndex === i && dragIndex !== null && dragIndex !== i && (
                <div
                  style={{
                    height: 2,
                    background: "#fb923c",
                    borderRadius: 1,
                    margin: "2px 0",
                  }}
                />
              )}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-3 p-3.5 theme-file-row rounded-xl mb-2"
                style={{
                  opacity: dragIndex === i ? 0.4 : 1,
                  cursor: "grab",
                  transition: "opacity 0.15s ease",
                }}
              >
                {/* Grip icon */}
                <div className="flex-shrink-0 theme-text-muted" style={{ cursor: "grab" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="9" cy="5" r="1.5" />
                    <circle cx="15" cy="5" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="19" r="1.5" />
                    <circle cx="15" cy="19" r="1.5" />
                  </svg>
                </div>

                {/* Image thumbnail */}
                <div
                  className="flex-shrink-0 rounded-lg overflow-hidden"
                  style={{ width: 48, height: 48, backgroundColor: "var(--bg-tertiary)" }}
                >
                  {previews[fileKey(f)] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previews[fileKey(f)]}
                      alt={f.name}
                      width={48}
                      height={48}
                      style={{ width: 48, height: 48, objectFit: "cover" }}
                    />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium theme-text truncate">{f.name}</p>
                  <p className="text-xs theme-text-muted">{fmt(f.size)}</p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFile(i)}
                  className="w-7 h-7 flex items-center justify-center rounded-md theme-text-muted hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Drop indicator at the very end */}
          {dragOverIndex !== null &&
            dragIndex !== null &&
            dragOverIndex >= files.length && (
              <div
                style={{
                  height: 2,
                  background: "#fb923c",
                  borderRadius: 1,
                  margin: "2px 0",
                }}
              />
            )}

          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={loading || files.length === 0}
            className="w-full py-3.5 mt-3 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading && files.length > 0 ? { backgroundColor: "#f97316" } : {}}
          >
            {loading ? "Converting..." : `Convert ${files.length} Image${files.length !== 1 ? "s" : ""} to PDF`}
          </button>
        </div>
      )}
    </div>
  );
}
