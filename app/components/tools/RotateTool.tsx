"use client";
import { useState, useCallback, useMemo } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfThumbnailGrid from "@/app/components/PdfThumbnailGrid";

export default function RotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
  const [rotations, setRotations] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      setFile(f);
      const count = pdf.getPageCount();
      setPageCount(count);
      setRotations(new Map());
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  const handleThumbnailClick = useCallback((pageNum: number) => {
    setRotations((prev) => {
      const next = new Map(prev);
      const current = prev.get(pageNum) || 0;
      const newAngle = (current + 90) % 360;
      if (newAngle === 0) {
        next.delete(pageNum);
      } else {
        next.set(pageNum, newAngle);
      }
      return next;
    });
  }, []);

  const applyToAll = useCallback(() => {
    setRotations((prev) => {
      const next = new Map(prev);
      for (let i = 1; i <= pageCount; i++) {
        next.set(i, rotation);
      }
      return next;
    });
  }, [pageCount, rotation]);

  const applyToSelected = useCallback(() => {
    setRotations((prev) => {
      const next = new Map(prev);
      for (const [pageNum] of prev) {
        if (prev.get(pageNum) !== 0) {
          next.set(pageNum, rotation);
        }
      }
      return next;
    });
  }, [rotation]);

  const resetAll = useCallback(() => {
    setRotations(new Map());
  }, []);

  const selectedPages = useMemo(() => {
    const s = new Set<number>();
    for (const [k, v] of rotations) {
      if (v !== 0) s.add(k);
    }
    return s;
  }, [rotations]);

  const hasRotations = selectedPages.size > 0;

  const renderOverlay = useCallback(
    (pageNum: number) => {
      const deg = rotations.get(pageNum);
      if (!deg || deg === 0) return null;
      return (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            background: "#f59e0b",
            color: "#fff",
            fontSize: "0.6rem",
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 9999,
            lineHeight: 1.4,
            pointerEvents: "none",
          }}
        >
          {deg}°
        </div>
      );
    },
    [rotations]
  );

  const handleRotate = async () => {
    if (!file || !hasRotations) return;
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      for (const [pageNum, deg] of rotations) {
        if (deg === 0) continue;
        const page = pdf.getPage(pageNum - 1);
        page.setRotation(degrees((page.getRotation().angle + deg) % 360));
      }
      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `rotated_${file.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rotation failed");
    }
    setLoading(false);
  };

  return (
    <div>
      {!file ? (
        <div>
          <Dropzone onFiles={handleFile} />
          {error && (
            <div className="mt-4 p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* File card */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} pages</p>
              </div>
            </div>
            <button
              onClick={() => { setFile(null); setRotations(new Map()); }}
              className="theme-text-muted  text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Page thumbnail grid */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Click a page to cycle rotation (0 → 90 → 180 → 270)
            </label>
            <PdfThumbnailGrid
              file={file}
              pageCount={pageCount}
              selected={selectedPages}
              onToggle={handleThumbnailClick}
              renderOverlay={renderOverlay}
            />
          </div>

          {/* Rotation selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Rotation angle
            </label>
            <div className="flex gap-2">
              {([90, 180, 270] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRotation(r)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors
                    ${
                      rotation === r
                        ? "bg-amber-500/100 border-amber-500 text-white"
                        : "theme-bg-secondary theme-border theme-text-secondary hover:border-amber-300 hover:bg-amber-500/10"
                    }`}
                >
                  {r}° {r === 90 ? "↻" : r === 180 ? "↔" : "↺"}
                </button>
              ))}
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex gap-2">
            <button
              onClick={applyToAll}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors theme-bg-secondary theme-border theme-text-secondary hover:border-amber-300 hover:bg-amber-500/10"
            >
              Apply {rotation}° to all
            </button>
            <button
              onClick={applyToSelected}
              disabled={!hasRotations}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors theme-bg-secondary theme-border theme-text-secondary hover:border-amber-300 hover:bg-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply {rotation}° to selected
            </button>
            <button
              onClick={resetAll}
              disabled={!hasRotations}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors theme-bg-secondary theme-border theme-text-secondary hover:border-amber-300 hover:bg-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reset all
            </button>
          </div>

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleRotate}
            disabled={loading || !hasRotations}
            className="w-full py-3.5 bg-amber-500/100 hover:bg-amber-600 theme-btn-disabled text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Rotating..." : `Rotate & Download${hasRotations ? ` (${selectedPages.size} page${selectedPages.size !== 1 ? "s" : ""})` : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
