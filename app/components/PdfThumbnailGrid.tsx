"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import PdfPagePreview from "./PdfPagePreview";

interface PdfThumbnailGridProps {
  file: File;
  pageCount: number;
  selected: Set<number>;
  onToggle: (pageNum: number) => void;
  renderOverlay?: (pageNum: number) => React.ReactNode;
  columns?: number;
  thumbnailScale?: number;
}

export default function PdfThumbnailGrid({
  file,
  pageCount,
  selected,
  onToggle,
  renderOverlay,
  columns = 4,
  thumbnailScale = 0.3,
}: PdfThumbnailGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const sentinelRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setSentinelRef = useCallback(
    (pageNum: number, el: HTMLDivElement | null) => {
      if (el) {
        sentinelRefs.current.set(pageNum, el);
      } else {
        sentinelRefs.current.delete(pageNum);
      }
    },
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePages((prev) => {
          const next = new Set(prev);
          for (const entry of entries) {
            const pageNum = Number(
              (entry.target as HTMLElement).dataset.page
            );
            if (entry.isIntersecting) {
              next.add(pageNum);
            }
          }
          return next;
        });
      },
      {
        rootMargin: "200px",
        threshold: 0,
      }
    );

    const currentSentinels = sentinelRefs.current;
    for (const el of currentSentinels.values()) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [pageCount]);

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div
      ref={containerRef}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "12px",
      }}
      className="pdf-thumbnail-grid"
    >
      <style>{`
        @media (max-width: 640px) {
          .pdf-thumbnail-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .pdf-thumbnail-grid {
            grid-template-columns: repeat(${Math.min(columns, 3)}, 1fr) !important;
          }
        }
      `}</style>

      {pages.map((pageNum) => (
        <div
          key={pageNum}
          ref={(el) => setSentinelRef(pageNum, el)}
          data-page={pageNum}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {visiblePages.has(pageNum) ? (
            <PdfPagePreview
              file={file}
              pageNumber={pageNum}
              scale={thumbnailScale}
              onClick={onToggle}
              selected={selected.has(pageNum)}
              overlay={renderOverlay?.(pageNum)}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "1 / 1.4",
                background: "var(--bg-tertiary)",
                borderRadius: "var(--radius-sm)",
                border: "2px solid var(--border-primary)",
              }}
            />
          )}
          <span
            style={{
              fontSize: "0.7rem",
              color: selected.has(pageNum)
                ? "var(--accent-primary)"
                : "var(--text-muted)",
              fontWeight: selected.has(pageNum) ? 600 : 400,
              transition: "color 0.2s ease",
            }}
          >
            {pageNum}
          </span>
        </div>
      ))}
    </div>
  );
}
