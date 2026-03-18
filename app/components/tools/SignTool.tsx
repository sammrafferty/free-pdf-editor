"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import PdfPagePreview from "../PdfPagePreview";

type SigTab = "draw" | "type" | "upload";

interface SigPos {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function SignTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Signature tabs
  const [activeTab, setActiveTab] = useState<SigTab>("draw");

  // Draw state
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Type state
  const [typedText, setTypedText] = useState("");
  const typeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Upload state
  const [uploadedSigUrl, setUploadedSigUrl] = useState<string | null>(null);

  // Signature image data URL (produced by any tab)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  // Drag-to-position state (percentages)
  const [sigPos, setSigPos] = useState<SigPos>({ x: 30, y: 70, width: 40, height: 15 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    type: "move" | "resize";
    corner?: string;
    startMouseX: number;
    startMouseY: number;
    startPos: SigPos;
    containerW: number;
    containerH: number;
  } | null>(null);

  // ---------- File handling ----------
  const handleFile = async (files: File[]) => {
    const f = files[0];
    setError("");
    try {
      const buf = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      setFile(f);
      setPageCount(pdf.getPageCount());
    } catch {
      setError("Could not read this PDF. It may be corrupted or password-protected.");
      setFile(null);
    }
  };

  // ---------- Draw tab ----------
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
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
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDraw = () => {
    if (isDrawingRef.current && canvasRef.current) {
      isDrawingRef.current = false;
      setSignatureDataUrl(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    if (activeTab === "draw") setSignatureDataUrl(null);
  }, [activeTab]);

  // Reset draw canvas when file changes
  useEffect(() => {
    if (!file || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, [file]);

  // ---------- Type tab ----------
  useEffect(() => {
    if (activeTab !== "type" || !typedText.trim()) {
      if (activeTab === "type") setSignatureDataUrl(null);
      return;
    }
    const canvas = typeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "italic 48px Helvetica, Arial, sans-serif";
    ctx.fillStyle = "#1a1a1a";
    ctx.textBaseline = "middle";

    // Measure and center
    const metrics = ctx.measureText(typedText);
    const textWidth = metrics.width;
    const x = Math.max(10, (canvas.width - textWidth) / 2);
    ctx.fillText(typedText, x, canvas.height / 2);

    setSignatureDataUrl(canvas.toDataURL("image/png"));
  }, [typedText, activeTab]);

  // ---------- Upload tab ----------
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
      setSignatureDataUrl(url);
    };
    reader.readAsDataURL(f);
  };

  // Update signatureDataUrl when switching tabs
  useEffect(() => {
    if (activeTab === "draw") {
      if (hasDrawn && canvasRef.current) {
        setSignatureDataUrl(canvasRef.current.toDataURL("image/png"));
      } else {
        setSignatureDataUrl(null);
      }
    } else if (activeTab === "type") {
      if (typedText.trim() && typeCanvasRef.current) {
        setSignatureDataUrl(typeCanvasRef.current.toDataURL("image/png"));
      } else {
        setSignatureDataUrl(null);
      }
    } else if (activeTab === "upload") {
      setSignatureDataUrl(uploadedSigUrl);
    }
  }, [activeTab, hasDrawn, typedText, uploadedSigUrl]);

  // ---------- Drag-to-position ----------
  const getEventClientPos = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    if ("changedTouches" in e && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    }
    return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, type: "move" | "resize", corner?: string) => {
    e.stopPropagation();
    e.preventDefault();
    const container = overlayRef.current?.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const native = e.nativeEvent;
    const pos = getEventClientPos(native as MouseEvent | TouchEvent);

    dragState.current = {
      type,
      corner,
      startMouseX: pos.clientX,
      startMouseY: pos.clientY,
      startPos: { ...sigPos },
      containerW: rect.width,
      containerH: rect.height,
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

      if (ds.type === "move") {
        const newX = Math.max(0, Math.min(100 - ds.startPos.width, ds.startPos.x + dx));
        const newY = Math.max(0, Math.min(100 - ds.startPos.height, ds.startPos.y + dy));
        setSigPos((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (ds.type === "resize" && ds.corner) {
        let newPos = { ...ds.startPos };
        const minSize = 5;
        if (ds.corner === "se") {
          newPos.width = Math.max(minSize, Math.min(100 - ds.startPos.x, ds.startPos.width + dx));
          newPos.height = Math.max(minSize, Math.min(100 - ds.startPos.y, ds.startPos.height + dy));
        } else if (ds.corner === "sw") {
          const newW = Math.max(minSize, ds.startPos.width - dx);
          const newX = ds.startPos.x + ds.startPos.width - newW;
          if (newX >= 0) { newPos.x = newX; newPos.width = newW; }
          newPos.height = Math.max(minSize, Math.min(100 - ds.startPos.y, ds.startPos.height + dy));
        } else if (ds.corner === "ne") {
          newPos.width = Math.max(minSize, Math.min(100 - ds.startPos.x, ds.startPos.width + dx));
          const newH = Math.max(minSize, ds.startPos.height - dy);
          const newY = ds.startPos.y + ds.startPos.height - newH;
          if (newY >= 0) { newPos.y = newY; newPos.height = newH; }
        } else if (ds.corner === "nw") {
          const newW = Math.max(minSize, ds.startPos.width - dx);
          const newX = ds.startPos.x + ds.startPos.width - newW;
          if (newX >= 0) { newPos.x = newX; newPos.width = newW; }
          const newH = Math.max(minSize, ds.startPos.height - dy);
          const newY = ds.startPos.y + ds.startPos.height - newH;
          if (newY >= 0) { newPos.y = newY; newPos.height = newH; }
        }
        setSigPos(newPos);
      }
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

  // ---------- Sign & Download ----------
  const handleSign = async () => {
    if (!file || !signatureDataUrl) return;
    setLoading(true);
    setError("");
    try {
      const sigBytes = Uint8Array.from(atob(signatureDataUrl.split(",")[1]), (c) => c.charCodeAt(0));

      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);

      const isJpeg = signatureDataUrl.startsWith("data:image/jpeg");
      const sigImage = isJpeg ? await pdf.embedJpg(sigBytes) : await pdf.embedPng(sigBytes);

      const page = pdf.getPage(Math.min(pageNum, pageCount) - 1);
      const { width: pageWidth, height: pageHeight } = page.getSize();

      const pdfX = (sigPos.x / 100) * pageWidth;
      const pdfW = (sigPos.width / 100) * pageWidth;
      const pdfH = (sigPos.height / 100) * pageHeight;
      // PDF y-axis is bottom-up; sigPos.y is top-down percentage
      const pdfY = pageHeight - (sigPos.y / 100) * pageHeight - pdfH;

      page.drawImage(sigImage, { x: pdfX, y: pdfY, width: pdfW, height: pdfH });

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      downloadBlob(blob, `signed_${file.name}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to sign PDF. Please try again.");
    }
    setLoading(false);
  };

  const hasSignature = !!signatureDataUrl;

  // Corner handle component
  const CornerHandle = ({ corner, cursor }: { corner: string; cursor: string }) => (
    <div
      onMouseDown={(e) => handleDragStart(e, "resize", corner)}
      onTouchStart={(e) => handleDragStart(e, "resize", corner)}
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

  // Signature overlay for PdfPagePreview
  const signatureOverlay = signatureDataUrl ? (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        left: `${sigPos.x}%`,
        top: `${sigPos.y}%`,
        width: `${sigPos.width}%`,
        height: `${sigPos.height}%`,
        pointerEvents: "auto",
        cursor: "move",
        touchAction: "none",
      }}
      onMouseDown={(e) => handleDragStart(e, "move")}
      onTouchStart={(e) => handleDragStart(e, "move")}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          border: "2px dashed #d946ef",
          borderRadius: 4,
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signatureDataUrl}
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
        <CornerHandle corner="nw" cursor="nwse-resize" />
        <CornerHandle corner="ne" cursor="nesw-resize" />
        <CornerHandle corner="sw" cursor="nesw-resize" />
        <CornerHandle corner="se" cursor="nwse-resize" />
      </div>
    </div>
  ) : null;

  const tabs: { key: SigTab; label: string }[] = [
    { key: "draw", label: "Draw" },
    { key: "type", label: "Type" },
    { key: "upload", label: "Upload" },
  ];

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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              onClick={() => {
                setFile(null);
                setHasDrawn(false);
                setSignatureDataUrl(null);
                setTypedText("");
                setUploadedSigUrl(null);
              }}
              className="theme-text-muted text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Page selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Page to sign</label>
            <input
              type="number"
              value={pageNum}
              onChange={(e) => setPageNum(Math.max(1, Math.min(pageCount, Number(e.target.value) || 1)))}
              min={1}
              max={pageCount}
              className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          {/* Signature input tabs */}
          <div>
            <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium theme-text-secondary">Draw your signature</label>
                  <button onClick={clearCanvas} className="text-xs font-medium text-fuchsia-500 hover:text-fuchsia-700">Clear</button>
                </div>
                <div className="border-2 border-dashed theme-border rounded-xl overflow-hidden theme-bg-secondary" style={{ touchAction: "none" }}>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full cursor-crosshair"
                    style={{ height: "150px" }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                  />
                </div>
                {!hasDrawn && <p className="text-xs theme-text-muted mt-1">Click and drag to draw your signature</p>}
              </div>
            )}

            {/* Type tab */}
            {activeTab === "type" && (
              <div className="mt-3">
                <label className="block text-sm font-medium theme-text-secondary mb-2">Type your signature</label>
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="Your name here"
                  className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                  style={{ fontStyle: "italic" }}
                />
                {typedText.trim() && (
                  <div className="mt-2 border-2 border-dashed theme-border rounded-xl overflow-hidden theme-bg-secondary p-4 flex items-center justify-center" style={{ height: "80px" }}>
                    <span style={{ fontStyle: "italic", fontSize: "28px", fontFamily: "Helvetica, Arial, sans-serif", color: "var(--text-primary)" }}>{typedText}</span>
                  </div>
                )}
                <canvas ref={typeCanvasRef} width={600} height={200} style={{ display: "none" }} />
                {!typedText.trim() && <p className="text-xs theme-text-muted mt-1">Type your name to generate a signature</p>}
              </div>
            )}

            {/* Upload tab */}
            {activeTab === "upload" && (
              <div className="mt-3">
                <label className="block text-sm font-medium theme-text-secondary mb-2">Upload signature image</label>
                <label
                  className="block border-2 border-dashed theme-border rounded-xl p-6 text-center cursor-pointer hover:border-fuchsia-500/50 transition-colors"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
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
                      <img src={uploadedSigUrl} alt="Uploaded signature" style={{ maxHeight: 80, maxWidth: "100%", objectFit: "contain" }} />
                      <span className="text-xs theme-text-muted">Click to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
          </div>

          {/* Page preview with draggable signature */}
          {file && (
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                {hasSignature ? "Drag to position your signature" : "Page preview"}
              </label>
              <div className="flex justify-center">
                <PdfPagePreview
                  file={file}
                  pageNumber={pageNum}
                  width={400}
                  overlay={signatureOverlay}
                  className="shadow-lg"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSign}
            disabled={loading || !hasSignature}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading && hasSignature ? { backgroundColor: "#d946ef" } : {}}
          >
            {loading ? "Signing..." : "Sign & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
