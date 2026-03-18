"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import Dropzone from "../Dropzone";

export default function SignTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [position, setPosition] = useState<"bottom-left" | "bottom-center" | "bottom-right">("bottom-right");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const [error, setError] = useState("");

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

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.nativeEvent.offsetX) * scaleX, y: (e.nativeEvent.offsetY) * scaleY };
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

  const stopDraw = () => { isDrawingRef.current = false; };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, []);

  useEffect(() => {
    if (!file || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- need to reset drawn state when file changes
    setHasDrawn(false);
  }, [file]);

  const handleSign = async () => {
    if (!file || !canvasRef.current || !hasDrawn) return;
    setLoading(true);
    try {
      const sigData = canvasRef.current.toDataURL("image/png");
      const sigBytes = Uint8Array.from(atob(sigData.split(",")[1]), (c) => c.charCodeAt(0));

      const buf = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buf);
      const sigImage = await pdf.embedPng(sigBytes);

      const page = pdf.getPage(Math.min(pageNum, pageCount) - 1);
      const { width } = page.getSize();
      const sigDims = sigImage.scale(0.5);
      const sigW = Math.min(sigDims.width, 200);
      const sigH = (sigW / sigDims.width) * sigDims.height;

      let x: number;
      if (position === "bottom-left") x = 40;
      else if (position === "bottom-center") x = width / 2 - sigW / 2;
      else x = width - sigW - 40;

      page.drawImage(sigImage, { x, y: 40, width: sigW, height: sigH });

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to sign PDF. Please try again.");
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
            <button onClick={() => { setFile(null); setHasDrawn(false); }} className="theme-text-muted  text-sm font-medium">Remove</button>
          </div>

          <div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">Page</label>
              <input type="number" value={pageNum} onChange={(e) => setPageNum(Number(e.target.value))} min={1} max={pageCount} className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-1 focus:ring-white/20" />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">Position</label>
              <select value={position} onChange={(e) => setPosition(e.target.value as typeof position)} className="w-full theme-input rounded-xl px-4 py-3 theme-text text-sm focus:outline-none focus:ring-1 focus:ring-white/20">
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSign}
            disabled={loading || !hasDrawn}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading && hasDrawn ? { backgroundColor: "#d946ef" } : {}}
          >
            {loading ? "Signing..." : "Sign & Download"}
          </button>
        </div>
      )}
    </div>
  );
}
