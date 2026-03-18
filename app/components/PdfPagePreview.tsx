"use client";
import { useRef, useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PdfPagePreviewProps {
  file: File;
  pageNumber: number;
  scale?: number;
  width?: number;
  className?: string;
  onClick?: (pageNum: number) => void;
  selected?: boolean;
  overlay?: React.ReactNode;
  onRenderComplete?: (canvas: HTMLCanvasElement) => void;
}

const docCache = new WeakMap<File, Promise<PDFDocumentProxy>>();

function getDocument(file: File): Promise<PDFDocumentProxy> {
  const cached = docCache.get(file);
  if (cached) return cached;

  const promise = (async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const buf = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buf }).promise;
    return doc;
  })();

  docCache.set(file, promise);

  promise.catch(() => {
    docCache.delete(file);
  });

  return promise;
}

export default function PdfPagePreview({
  file,
  pageNumber,
  scale = 0.5,
  width,
  className,
  onClick,
  selected,
  overlay,
  onRenderComplete,
}: PdfPagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setLoading(true);
      setError("");

      try {
        const doc = await getDocument(file);

        if (cancelled) return;

        if (pageNumber < 1 || pageNumber > doc.numPages) {
          setError(`Invalid page ${pageNumber}`);
          setLoading(false);
          return;
        }

        const page = await doc.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

        if (cancelled) return;

        setLoading(false);
        onRenderComplete?.(canvas);
      } catch (e) {
        if (cancelled) return;
        console.error("PdfPagePreview render error:", e);
        setError("Failed to render page");
        setLoading(false);
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [file, pageNumber, scale, onRenderComplete]);

  const handleClick = () => {
    onClick?.(pageNumber);
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      style={{
        position: "relative",
        display: "inline-block",
        width: width ? `${width}px` : undefined,
        borderRadius: "var(--radius-sm)",
        border: selected
          ? "2px solid var(--accent-primary)"
          : "2px solid var(--border-primary)",
        overflow: "hidden",
        cursor: onClick ? "pointer" : undefined,
        transition: "border-color 0.2s ease",
      }}
    >
      {loading && (
        <div
          style={{
            width: width || 150,
            height: (width || 150) * 1.4,
            background: "var(--bg-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            Loading...
          </span>
        </div>
      )}

      {error && (
        <div
          style={{
            width: width || 150,
            height: (width || 150) * 1.4,
            background: "var(--error-bg)",
            border: "1px solid var(--error-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px",
          }}
        >
          <span
            style={{
              color: "var(--error-text)",
              fontSize: "0.7rem",
              textAlign: "center",
            }}
          >
            {error}
          </span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{
          display: loading || error ? "none" : "block",
          width: "100%",
          height: "auto",
        }}
      />

      {overlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {overlay}
        </div>
      )}
    </div>
  );
}
