"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfPagePreview from "../PdfPagePreview";
import PdfThumbnailGrid from "../PdfThumbnailGrid";

type SigTab = "draw" | "type" | "upload";

interface SigPos {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SavedSignature {
  id: string;
  dataUrl: string;
  label: string;
}

interface PlacedSignature {
  id: string;
  dataUrl: string;
  pos: SigPos;
}

const COLORS = [
  { value: "#1a1a1a", label: "Black" },
  { value: "#1e3a8a", label: "Blue" },
  { value: "#991b1b", label: "Red" },
];

const FONTS = [
  { css: "italic 48px 'Brush Script MT', 'Segoe Script', cursive", label: "Script" },
  { css: "italic 48px Georgia, 'Times New Roman', serif", label: "Serif" },
  { css: "italic 48px Helvetica, Arial, sans-serif", label: "Sans" },
];

let _nextId = 0;
function genId() {
  return `s${++_nextId}_${Date.now()}`;
}

function computeResize(startPos: SigPos, corner: string, dx: number, dy: number): SigPos {
  const minSize = 5;
  const p = { ...startPos };
  if (corner === "se") {
    p.width = Math.max(minSize, Math.min(100 - startPos.x, startPos.width + dx));
    p.height = Math.max(minSize, Math.min(100 - startPos.y, startPos.height + dy));
  } else if (corner === "sw") {
    const newW = Math.max(minSize, Math.min(startPos.x + startPos.width, startPos.width - dx));
    p.x = startPos.x + startPos.width - newW;
    p.width = newW;
    p.height = Math.max(minSize, Math.min(100 - startPos.y, startPos.height + dy));
  } else if (corner === "ne") {
    p.width = Math.max(minSize, Math.min(100 - startPos.x, startPos.width + dx));
    const newH = Math.max(minSize, Math.min(startPos.y + startPos.height, startPos.height - dy));
    p.y = startPos.y + startPos.height - newH;
    p.height = newH;
  } else if (corner === "nw") {
    const newW = Math.max(minSize, Math.min(startPos.x + startPos.width, startPos.width - dx));
    p.x = startPos.x + startPos.width - newW;
    p.width = newW;
    const newH = Math.max(minSize, Math.min(startPos.y + startPos.height, startPos.height - dy));
    p.y = startPos.y + startPos.height - newH;
    p.height = newH;
  }
  return p;
}

export default function SignTool() {
  // ==================== State ====================
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Signature creation
  const [activeTab, setActiveTab] = useState<SigTab>("draw");
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [typedText, setTypedText] = useState("");
  const typeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadedSigUrl, setUploadedSigUrl] = useState<string | null>(null);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const [drawColor, setDrawColor] = useState("#1a1a1a");
  const [fontIndex, setFontIndex] = useState(0);

  // Saved signatures library
  const [savedSigs, setSavedSigs] = useState<SavedSignature[]>([]);
  const [activeSigId, setActiveSigId] = useState<string | null>(null);

  // Page placement
  const [activePage, setActivePage] = useState(1);
  const [pageSignatures, setPageSignatures] = useState<Record<number, PlacedSignature[]>>({});
  const [editingPlacedId, setEditingPlacedId] = useState<string | null>(null);

  // Drag state
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    type: "move" | "resize";
    corner?: string;
    startMouseX: number;
    startMouseY: number;
    startPos: SigPos;
    containerW: number;
    containerH: number;
    placedId: string;
    pageNum: number;
  } | null>(null);

  // Signature creation collapsed
  const [showCreator, setShowCreator] = useState(true);

  // ==================== File handling ====================
  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const count = pdf.getPageCount();
      if (count === 0) {
        setError("This PDF has no pages.");
        setFile(null);
        return;
      }
      setFile(f);
      setPageCount(count);
      setActivePage(1);
      setPageSignatures({});
      setSavedSigs([]);
      setActiveSigId(null);
      setEditingPlacedId(null);
      setCurrentPreview(null);
      setHasDrawn(false);
      setTypedText("");
      setUploadedSigUrl(null);
      setShowCreator(true);
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  // ==================== Draw tab ====================
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return { x: e.nativeEvent.offsetX * scaleX, y: e.nativeEvent.offsetY * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e, canvas);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = drawColor;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDraw = () => {
    if (isDrawingRef.current && canvasRef.current) {
      isDrawingRef.current = false;
      setCurrentPreview(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    if (activeTab === "draw") setCurrentPreview(null);
  }, [activeTab]);

  useEffect(() => {
    if (!file || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, [file]);

  // ==================== Type tab ====================
  useEffect(() => {
    if (activeTab !== "type" || !typedText.trim()) {
      if (activeTab === "type") setCurrentPreview(null);
      return;
    }
    const canvas = typeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = FONTS[fontIndex].css;
    ctx.fillStyle = drawColor;
    ctx.textBaseline = "middle";

    const metrics = ctx.measureText(typedText);
    const textWidth = metrics.width;
    const maxWidth = canvas.width - 20;
    const x = Math.max(10, (canvas.width - Math.min(textWidth, maxWidth)) / 2);
    ctx.fillText(typedText, x, canvas.height / 2, maxWidth);

    setCurrentPreview(canvas.toDataURL("image/png"));
  }, [typedText, activeTab, drawColor, fontIndex]);

  // ==================== Upload tab ====================
  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please upload a PNG or JPG image.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setUploadedSigUrl(url);
      setCurrentPreview(url);
    };
    reader.readAsDataURL(f);
  };

  // Update preview when switching tabs
  useEffect(() => {
    if (activeTab === "draw") {
      if (hasDrawn && canvasRef.current) {
        setCurrentPreview(canvasRef.current.toDataURL("image/png"));
      } else {
        setCurrentPreview(null);
      }
    } else if (activeTab === "type") {
      if (typedText.trim() && typeCanvasRef.current) {
        setCurrentPreview(typeCanvasRef.current.toDataURL("image/png"));
      } else {
        setCurrentPreview(null);
      }
    } else if (activeTab === "upload") {
      setCurrentPreview(uploadedSigUrl);
    }
  }, [activeTab, hasDrawn, typedText, uploadedSigUrl]);

  // ==================== Save signature ====================
  const saveSignature = () => {
    if (!currentPreview) return;
    const label =
      activeTab === "draw"
        ? `Signature ${savedSigs.filter((s) => s.label.startsWith("Signature")).length + 1}`
        : activeTab === "type"
          ? typedText.trim().slice(0, 20)
          : `Image ${savedSigs.filter((s) => s.label.startsWith("Image")).length + 1}`;

    const sig: SavedSignature = { id: genId(), dataUrl: currentPreview, label };
    setSavedSigs((prev) => [...prev, sig]);
    setActiveSigId(sig.id);
  };

  const addDateStamp = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext("2d")!;
    ctx.font = "32px Helvetica, Arial, sans-serif";
    ctx.fillStyle = drawColor;
    ctx.textBaseline = "middle";
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const metrics = ctx.measureText(dateStr);
    const x = Math.max(10, (canvas.width - metrics.width) / 2);
    ctx.fillText(dateStr, x, canvas.height / 2);

    const sig: SavedSignature = { id: genId(), dataUrl: canvas.toDataURL("image/png"), label: "Date" };
    setSavedSigs((prev) => [...prev, sig]);
    setActiveSigId(sig.id);
  };

  const deleteSavedSig = (id: string) => {
    setSavedSigs((prev) => prev.filter((s) => s.id !== id));
    if (activeSigId === id) setActiveSigId(null);
    // Remove all placed instances of this signature
    setPageSignatures((prev) => {
      const next = { ...prev };
      for (const p of Object.keys(next)) {
        next[Number(p)] = next[Number(p)].filter((ps) => ps.dataUrl !== savedSigs.find((s) => s.id === id)?.dataUrl);
        if (next[Number(p)].length === 0) delete next[Number(p)];
      }
      return next;
    });
  };

  // ==================== Place signatures ====================
  const placeSig = () => {
    const sig = savedSigs.find((s) => s.id === activeSigId);
    if (!sig) return;
    const existing = pageSignatures[activePage] || [];
    const offset = existing.length * 3;
    const placed: PlacedSignature = {
      id: genId(),
      dataUrl: sig.dataUrl,
      pos: {
        x: 30 + (offset % 20),
        y: 70 - (offset % 30),
        width: 40,
        height: 12,
      },
    };
    setPageSignatures((prev) => ({
      ...prev,
      [activePage]: [...(prev[activePage] || []), placed],
    }));
    setEditingPlacedId(placed.id);
  };

  const removePlacedSig = useCallback((placedId: string) => {
    setPageSignatures((prev) => {
      const next = { ...prev };
      for (const p of Object.keys(next)) {
        const filtered = next[Number(p)].filter((s) => s.id !== placedId);
        if (filtered.length === 0) {
          delete next[Number(p)];
        } else {
          next[Number(p)] = filtered;
        }
      }
      return next;
    });
    setEditingPlacedId((prev) => (prev === placedId ? null : prev));
  }, []);

  const undoLast = () => {
    const sigs = pageSignatures[activePage];
    if (!sigs || sigs.length === 0) return;
    const last = sigs[sigs.length - 1];
    removePlacedSig(last.id);
  };

  const applyToAllPages = () => {
    const current = pageSignatures[activePage];
    if (!current || current.length === 0) return;
    setPageSignatures((prev) => {
      const next = { ...prev };
      for (let p = 1; p <= pageCount; p++) {
        if (p === activePage) continue;
        const copies = current.map((s) => ({ ...s, id: genId() }));
        next[p] = [...(next[p] || []), ...copies];
      }
      return next;
    });
  };

  const clearAllSignatures = () => {
    setPageSignatures({});
    setEditingPlacedId(null);
  };

  // ==================== Drag/resize ====================
  const getEventClientPos = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    if ("changedTouches" in e && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
  };

  const handlePlacedDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    type: "move" | "resize",
    placedId: string,
    corner?: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const container = previewContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const native = e.nativeEvent;
    const pos = getEventClientPos(native as MouseEvent | TouchEvent);

    const placed = (pageSignatures[activePage] || []).find((s) => s.id === placedId);
    if (!placed) return;

    dragState.current = {
      type,
      corner,
      startMouseX: pos.clientX,
      startMouseY: pos.clientY,
      startPos: { ...placed.pos },
      containerW: rect.width,
      containerH: rect.height,
      placedId,
      pageNum: activePage,
    };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragState.current) return;
      e.preventDefault();
      const pos = getEventClientPos(e);
      const ds = dragState.current;
      const dx = ((pos.clientX - ds.startMouseX) / ds.containerW) * 100;
      const dy = ((pos.clientY - ds.startMouseY) / ds.containerH) * 100;

      let newPos: SigPos;
      if (ds.type === "move") {
        newPos = {
          ...ds.startPos,
          x: Math.max(0, Math.min(100 - ds.startPos.width, ds.startPos.x + dx)),
          y: Math.max(0, Math.min(100 - ds.startPos.height, ds.startPos.y + dy)),
        };
      } else {
        newPos = computeResize(ds.startPos, ds.corner!, dx, dy);
      }

      setPageSignatures((prev) => {
        const sigs = [...(prev[ds.pageNum] || [])];
        const idx = sigs.findIndex((s) => s.id === ds.placedId);
        if (idx >= 0) sigs[idx] = { ...sigs[idx], pos: newPos };
        return { ...prev, [ds.pageNum]: sigs };
      });
    };

    const handleUp = () => {
      dragState.current = null;
    };

    window.addEventListener("mousemove", handleMove, { passive: false });
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, []);

  // Keyboard: Delete removes selected placed sig
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && editingPlacedId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        removePlacedSig(editingPlacedId);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [editingPlacedId, removePlacedSig]);

  // ==================== Sign & Download ====================
  const handleSign = async () => {
    if (!file) return;
    const pagesWithSigs = Object.keys(pageSignatures)
      .map(Number)
      .filter((p) => pageSignatures[p]?.length > 0);
    if (pagesWithSigs.length === 0) {
      setError("No signatures placed. Save a signature and place it on a page first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);

      for (const pageNum of pagesWithSigs) {
        const page = pdf.getPage(pageNum - 1);
        const { width: pageWidth, height: pageHeight } = page.getSize();

        for (const ps of pageSignatures[pageNum]) {
          const sigBytes = Uint8Array.from(atob(ps.dataUrl.split(",")[1]), (c) => c.charCodeAt(0));
          const isJpeg = ps.dataUrl.startsWith("data:image/jpeg");
          const sigImage = isJpeg ? await pdf.embedJpg(sigBytes) : await pdf.embedPng(sigBytes);

          const pdfX = (ps.pos.x / 100) * pageWidth;
          const pdfW = (ps.pos.width / 100) * pageWidth;
          const pdfH = (ps.pos.height / 100) * pageHeight;
          const pdfY = pageHeight - (ps.pos.y / 100) * pageHeight - pdfH;

          page.drawImage(sigImage, { x: pdfX, y: pdfY, width: pdfW, height: pdfH });
        }
      }

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `signed_${file.name}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to sign PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== Computed values ====================
  const totalSigCount = Object.values(pageSignatures).reduce((sum, sigs) => sum + sigs.length, 0);
  const pagesWithSigsCount = Object.keys(pageSignatures).filter(
    (p) => pageSignatures[Number(p)]?.length > 0,
  ).length;
  const currentPageSigs = pageSignatures[activePage] || [];
  const hasPlacedSigs = totalSigCount > 0;

  // ==================== Render helpers ====================
  const renderCornerHandle = (corner: string, cursor: string, placedId: string) => (
    <div
      key={corner}
      onMouseDown={(e) => handlePlacedDragStart(e, "resize", placedId, corner)}
      onTouchStart={(e) => handlePlacedDragStart(e, "resize", placedId, corner)}
      style={{
        position: "absolute",
        width: 12,
        height: 12,
        backgroundColor: "#d946ef",
        border: "2px solid #fff",
        borderRadius: 2,
        cursor,
        zIndex: 10,
        pointerEvents: "auto",
        ...(corner.includes("n") ? { top: -6 } : { bottom: -6 }),
        ...(corner.includes("w") ? { left: -6 } : { right: -6 }),
      }}
    />
  );

  const renderThumbnailOverlay = useCallback(
    (pageNum: number) => {
      const sigs = pageSignatures[pageNum];
      if (!sigs || sigs.length === 0) return null;
      return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {sigs.map((s) => (
            <div
              key={s.id}
              style={{
                position: "absolute",
                left: `${s.pos.x}%`,
                top: `${s.pos.y}%`,
                width: `${s.pos.width}%`,
                height: `${s.pos.height}%`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.dataUrl}
                alt=""
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          ))}
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: "#d946ef",
              color: "#fff",
              borderRadius: "50%",
              width: 18,
              height: 18,
              fontSize: "0.65rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {sigs.length}
          </div>
        </div>
      );
    },
    [pageSignatures],
  );

  const placedSigsOverlay = (
    <div
      ref={previewContainerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {currentPageSigs.map((ps) => {
        const isEditing = editingPlacedId === ps.id;
        return (
          <div
            key={ps.id}
            style={{
              position: "absolute",
              left: `${ps.pos.x}%`,
              top: `${ps.pos.y}%`,
              width: `${ps.pos.width}%`,
              height: `${ps.pos.height}%`,
              pointerEvents: "auto",
              cursor: isEditing ? "move" : "pointer",
              touchAction: "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setEditingPlacedId(isEditing ? null : ps.id);
            }}
            onMouseDown={(e) => {
              if (isEditing) handlePlacedDragStart(e, "move", ps.id);
            }}
            onTouchStart={(e) => {
              if (isEditing) handlePlacedDragStart(e, "move", ps.id);
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                border: isEditing ? "2px dashed #d946ef" : "1px solid transparent",
                borderRadius: 4,
                position: "relative",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ps.dataUrl}
                alt="Signature"
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
              {isEditing && (
                <>
                  {renderCornerHandle("nw", "nwse-resize", ps.id)}
                  {renderCornerHandle("ne", "nesw-resize", ps.id)}
                  {renderCornerHandle("sw", "nesw-resize", ps.id)}
                  {renderCornerHandle("se", "nwse-resize", ps.id)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlacedSig(ps.id);
                    }}
                    style={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      color: "#fff",
                      border: "2px solid #fff",
                      fontSize: "11px",
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      zIndex: 20,
                      pointerEvents: "auto",
                    }}
                  >
                    &times;
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const tabs: { key: SigTab; label: string }[] = [
    { key: "draw", label: "Draw" },
    { key: "type", label: "Type" },
    { key: "upload", label: "Upload" },
  ];

  // ==================== Render ====================
  return (
    <div>
      {!file ? (
        <div>
          <Dropzone onFiles={handleFile} />
          {error && (
            <div className="mt-4 p-3 theme-error rounded-xl text-sm">{error}</div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* File card */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d946ef"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{pageCount} page{pageCount !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPageCount(0);
                setActivePage(1);
                setPageSignatures({});
                setSavedSigs([]);
                setActiveSigId(null);
                setEditingPlacedId(null);
                setCurrentPreview(null);
                setHasDrawn(false);
                setTypedText("");
                setUploadedSigUrl(null);
                setError("");
                setShowCreator(true);
              }}
              className="theme-text-muted text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* ========== Signature Creator ========== */}
          <div>
            <button
              onClick={() => setShowCreator((p) => !p)}
              className="flex items-center gap-2 text-sm font-semibold theme-text-secondary mb-2 w-full"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                style={{
                  transform: showCreator ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s",
                }}
              >
                <path d="M4 2l4 4-4 4z" />
              </svg>
              Create Signature
              {savedSigs.length > 0 && (
                <span className="theme-text-muted font-normal">
                  ({savedSigs.length} saved)
                </span>
              )}
            </button>

            {showCreator && (
              <div
                className="space-y-3 p-4 rounded-xl"
                style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
              >
                {/* Tabs */}
                <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setError("");
                      }}
                      className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      style={
                        activeTab === tab.key
                          ? { backgroundColor: "#d946ef", color: "#fff" }
                          : { color: "var(--text-secondary)" }
                      }
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Draw tab */}
                {activeTab === "draw" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium theme-text-secondary">
                        Draw your signature
                      </label>
                      <button
                        onClick={clearCanvas}
                        className="text-xs font-medium text-fuchsia-500 hover:text-fuchsia-700"
                      >
                        Clear
                      </button>
                    </div>
                    <div
                      className="border-2 border-dashed theme-border rounded-xl overflow-hidden"
                      style={{ touchAction: "none" }}
                    >
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        className="w-full cursor-crosshair"
                        style={{ height: "150px", backgroundColor: "#fff" }}
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={stopDraw}
                        onMouseLeave={stopDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={stopDraw}
                      />
                    </div>
                    {!hasDrawn && (
                      <p className="text-xs theme-text-muted mt-1">
                        Click and drag to draw your signature
                      </p>
                    )}
                  </div>
                )}

                {/* Type tab */}
                {activeTab === "type" && (
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Type your signature
                    </label>
                    <input
                      type="text"
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value)}
                      placeholder="Your name here"
                      className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                      style={{ fontStyle: "italic" }}
                    />
                    {typedText.trim() && (
                      <div
                        className="mt-2 border-2 border-dashed theme-border rounded-xl overflow-hidden p-4 flex items-center justify-center"
                        style={{ height: "80px", backgroundColor: "#fff" }}
                      >
                        <span
                          style={{
                            fontStyle: "italic",
                            fontSize: "28px",
                            fontFamily: FONTS[fontIndex].css.split("italic 48px ")[1],
                            color: drawColor,
                          }}
                        >
                          {typedText}
                        </span>
                      </div>
                    )}
                    <canvas ref={typeCanvasRef} width={600} height={200} style={{ display: "none" }} />
                    {/* Font picker */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs theme-text-muted">Font:</span>
                      {FONTS.map((font, i) => (
                        <button
                          key={i}
                          onClick={() => setFontIndex(i)}
                          className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                          style={{
                            fontFamily: font.css.split("italic 48px ")[1],
                            fontStyle: "italic",
                            backgroundColor:
                              fontIndex === i ? "#d946ef" : "var(--bg-tertiary)",
                            color: fontIndex === i ? "#fff" : "var(--text-secondary)",
                          }}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                    {!typedText.trim() && (
                      <p className="text-xs theme-text-muted mt-1">
                        Type your name to generate a signature
                      </p>
                    )}
                  </div>
                )}

                {/* Upload tab */}
                {activeTab === "upload" && (
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">
                      Upload signature image
                    </label>
                    <label
                      className="block border-2 border-dashed theme-border rounded-xl p-6 text-center cursor-pointer hover:border-fuchsia-500/50 transition-colors"
                      style={{ backgroundColor: "var(--bg-tertiary)" }}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleSigUpload}
                        className="hidden"
                      />
                      {uploadedSigUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={uploadedSigUrl}
                            alt="Uploaded signature"
                            style={{
                              maxHeight: 80,
                              maxWidth: "100%",
                              objectFit: "contain",
                            }}
                          />
                          <span className="text-xs theme-text-muted">Click to replace</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#d946ef"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span className="text-sm theme-text-muted">PNG or JPG image</span>
                        </div>
                      )}
                    </label>
                  </div>
                )}

                {/* Color picker (for draw & type) */}
                {activeTab !== "upload" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs theme-text-muted">Color:</span>
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setDrawColor(c.value)}
                        title={c.label}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: c.value,
                          border:
                            drawColor === c.value
                              ? "3px solid #d946ef"
                              : "2px solid var(--border-primary)",
                          cursor: "pointer",
                          transition: "border-color 0.15s",
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Save + Date stamp buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={saveSignature}
                    disabled={!currentPreview}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    style={
                      currentPreview
                        ? { backgroundColor: "#d946ef", color: "#fff" }
                        : { backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)" }
                    }
                  >
                    Save Signature
                  </button>
                  <button
                    onClick={addDateStamp}
                    className="py-2.5 px-4 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-primary)",
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Date
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========== Saved Signatures Library ========== */}
          {savedSigs.length > 0 && (
            <div>
              <label className="block text-sm font-semibold theme-text-secondary mb-2">
                Saved Signatures
                <span className="font-normal theme-text-muted"> &mdash; click to select, then place on pages</span>
              </label>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  padding: "4px 2px",
                }}
              >
                {savedSigs.map((sig) => (
                  <div
                    key={sig.id}
                    onClick={() =>
                      setActiveSigId(sig.id === activeSigId ? null : sig.id)
                    }
                    style={{
                      flexShrink: 0,
                      width: 110,
                      padding: 8,
                      borderRadius: 10,
                      border:
                        activeSigId === sig.id
                          ? "2px solid #d946ef"
                          : "2px solid var(--border-primary)",
                      backgroundColor: "var(--bg-secondary)",
                      cursor: "pointer",
                      position: "relative",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                      boxShadow:
                        activeSigId === sig.id ? "0 0 0 2px rgba(217, 70, 239, 0.2)" : "none",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 6,
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 36,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sig.dataUrl}
                        alt={sig.label}
                        draggable={false}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--text-muted)",
                        textAlign: "center",
                        marginTop: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {sig.label}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedSig(sig.id);
                      }}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        backgroundColor: "var(--bg-tertiary)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border-primary)",
                        fontSize: "11px",
                        lineHeight: 1,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== Page Grid ========== */}
          {pageCount > 1 && (
            <div>
              <label className="block text-sm font-semibold theme-text-secondary mb-2">
                Pages
                <span className="font-normal theme-text-muted">
                  {" "}&mdash; click to select page, then place signatures below
                </span>
              </label>
              <PdfThumbnailGrid
                file={file}
                pageCount={pageCount}
                selected={new Set([activePage])}
                onToggle={(p) => {
                  setActivePage(p);
                  setEditingPlacedId(null);
                }}
                renderOverlay={renderThumbnailOverlay}
                columns={4}
                thumbnailScale={0.25}
              />
            </div>
          )}

          {/* ========== Active Page Preview ========== */}
          {file && (
            <div>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <label className="text-sm font-semibold theme-text-secondary">
                  Page {activePage}
                  {currentPageSigs.length > 0 && (
                    <span className="font-normal theme-text-muted">
                      {" "}&mdash; {currentPageSigs.length} signature{currentPageSigs.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  {pageCount === 1 && (
                    <span className="font-normal theme-text-muted"> of 1</span>
                  )}
                </label>
                {/* Single-page nav for 1-page PDFs */}
                {pageCount === 1 ? null : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setActivePage(Math.max(1, activePage - 1)); setEditingPlacedId(null); }}
                      disabled={activePage === 1}
                      className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color: activePage === 1 ? "var(--text-muted)" : "var(--text-secondary)",
                      }}
                    >
                      &larr;
                    </button>
                    <span className="text-xs theme-text-muted px-1">
                      {activePage}/{pageCount}
                    </span>
                    <button
                      onClick={() => { setActivePage(Math.min(pageCount, activePage + 1)); setEditingPlacedId(null); }}
                      disabled={activePage === pageCount}
                      className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color: activePage === pageCount ? "var(--text-muted)" : "var(--text-secondary)",
                      }}
                    >
                      &rarr;
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-3 flex-wrap">
                <button
                  onClick={placeSig}
                  disabled={!activeSigId}
                  className="py-2 px-4 rounded-xl text-xs font-semibold transition-colors"
                  style={
                    activeSigId
                      ? { backgroundColor: "#d946ef", color: "#fff" }
                      : { backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)" }
                  }
                >
                  Place on Page {activePage}
                </button>
                {currentPageSigs.length > 0 && (
                  <>
                    {pageCount > 1 && (
                      <button
                        onClick={applyToAllPages}
                        className="py-2 px-4 rounded-xl text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-primary)",
                        }}
                      >
                        Apply to All Pages
                      </button>
                    )}
                    <button
                      onClick={undoLast}
                      className="py-2 px-4 rounded-xl text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-primary)",
                      }}
                    >
                      Undo Last
                    </button>
                  </>
                )}
              </div>

              {/* Large preview */}
              <div
                className="flex justify-center"
                onClick={() => setEditingPlacedId(null)}
              >
                <PdfPagePreview
                  file={file}
                  pageNumber={activePage}
                  width={500}
                  overlay={currentPageSigs.length > 0 ? placedSigsOverlay : undefined}
                  className="shadow-lg"
                />
              </div>

              {currentPageSigs.length === 0 && savedSigs.length > 0 && activeSigId && (
                <p className="text-xs theme-text-muted mt-2 text-center">
                  Click &ldquo;Place on Page {activePage}&rdquo; to add the selected signature
                </p>
              )}
              {currentPageSigs.length === 0 && savedSigs.length === 0 && (
                <p className="text-xs theme-text-muted mt-2 text-center">
                  Create and save a signature above to get started
                </p>
              )}
              {editingPlacedId && (
                <p className="text-xs theme-text-muted mt-2 text-center">
                  Drag to move &middot; Use corners to resize &middot; Press Delete to remove
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">{error}</div>
          )}

          {/* ========== Download ========== */}
          <div>
            <button
              onClick={handleSign}
              disabled={loading || !hasPlacedSigs}
              className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
              style={!loading && hasPlacedSigs ? { backgroundColor: "#d946ef" } : {}}
            >
              {loading
                ? "Signing..."
                : hasPlacedSigs
                  ? `Sign & Download (${totalSigCount} signature${totalSigCount !== 1 ? "s" : ""} on ${pagesWithSigsCount} page${pagesWithSigsCount !== 1 ? "s" : ""})`
                  : "Sign & Download"}
            </button>
            {hasPlacedSigs && (
              <button
                onClick={clearAllSignatures}
                className="w-full mt-2 text-xs theme-text-muted font-medium text-center py-1"
              >
                Clear All Signatures
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
