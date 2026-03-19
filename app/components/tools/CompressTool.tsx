"use client";
import { useState, useRef, useCallback } from "react";
import {
  PDFDocument,
  PDFName,
  PDFRawStream,
  PDFStream,
  PDFRef,
  PDFNumber,
  decodePDFRawStream,
} from "pdf-lib";
import { downloadBlob } from "@/app/lib/pdfHelpers";
import Dropzone from "../Dropzone";
import ProgressBar from "@/app/components/ProgressBar";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type Preset = "maximum" | "balanced" | "light";

interface CompressionResult {
  original: number;
  compressed: number;
  imagesOriginal: number;
  imagesCompressed: number;
  imagesCount: number;
  streamsCompressed: number;
  metadataStripped: boolean;
}

const presets: {
  key: Preset;
  name: string;
  description: string;
  range: string;
}[] = [
  {
    key: "maximum",
    name: "Maximum",
    description:
      "Re-encodes images at lower quality and 50% resolution for aggressive size reduction",
    range: "40-80% smaller",
  },
  {
    key: "balanced",
    name: "Balanced",
    description:
      "Re-encodes images at good quality while keeping original resolution",
    range: "15-50% smaller",
  },
  {
    key: "light",
    name: "Light",
    description:
      "Lossless -- compresses unoptimized streams and strips metadata",
    range: "5-15% smaller",
  },
];

const DEFAULT_QUALITY: Record<Preset, number> = {
  maximum: 0.5,
  balanced: 0.75,
  light: 0.75,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pctString(before: number, after: number): string {
  if (before === 0) return "0";
  return Math.abs((1 - after / before) * 100).toFixed(1);
}

/* ------------------------------------------------------------------ */
/*  Image re-encoding engine                                           */
/* ------------------------------------------------------------------ */

/**
 * Decode a JPEG stream (DCTDecode) to an ImageBitmap via Blob.
 */
async function decodeJpegToImage(
  jpegBytes: Uint8Array
): Promise<HTMLImageElement> {
  const blob = new Blob([jpegBytes as BlobPart], { type: "image/jpeg" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to decode JPEG image"));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Render raw pixel data (DeviceRGB, 8bpc) onto a canvas.
 * Returns the Image element via canvas toBlob round-trip.
 */
function renderRawRGBToCanvas(
  pixelData: Uint8Array,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(width, height);

  // pixelData is RGB (3 bytes per pixel), ImageData needs RGBA (4 bytes)
  const expectedBytes = width * height * 3;
  // Some PDFs have row padding or slightly different sizes; clamp to available data
  const pixelCount = Math.min(
    width * height,
    Math.floor(pixelData.length / 3)
  );

  if (pixelData.length < expectedBytes) {
    console.warn(
      `Image pixel data shorter than expected: ${pixelData.length} vs ${expectedBytes}`
    );
  }

  for (let i = 0; i < pixelCount; i++) {
    imageData.data[i * 4] = pixelData[i * 3]; // R
    imageData.data[i * 4 + 1] = pixelData[i * 3 + 1]; // G
    imageData.data[i * 4 + 2] = pixelData[i * 3 + 2]; // B
    imageData.data[i * 4 + 3] = 255; // A
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Re-encode a canvas to JPEG bytes at given quality and optional downscale.
 */
function canvasToJpegBytes(
  sourceCanvas: HTMLCanvasElement | HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  quality: number
): Uint8Array {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const b64 = dataUrl.split(",")[1];
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Find and re-encode image XObjects in a PDF document.
 */
async function findAndReencodeImages(
  doc: PDFDocument,
  quality: number,
  downscale: number,
  minSize: number,
  onProgress: (current: number, total: number, status: string) => void
): Promise<{ originalBytes: number; newBytes: number; count: number }> {
  const context = doc.context;
  const allObjects = context.enumerateIndirectObjects();

  // Collect image XObjects that meet the size threshold
  const images: [PDFRef, PDFRawStream][] = [];
  for (const [ref, obj] of allObjects) {
    if (obj instanceof PDFRawStream || obj instanceof PDFStream) {
      const dict = obj.dict;
      const subtype = dict.get(PDFName.of("Subtype"));
      if (subtype && subtype.toString() === "/Image") {
        if (obj instanceof PDFRawStream) {
          const contents = obj.getContents();
          if (contents.length >= minSize) {
            images.push([ref, obj as PDFRawStream]);
          }
        }
      }
    }
  }

  let originalBytes = 0;
  let newBytes = 0;
  let count = 0;

  for (let i = 0; i < images.length; i++) {
    const [ref, stream] = images[i];
    onProgress(
      i + 1,
      images.length,
      `Compressing image ${i + 1} of ${images.length}`
    );

    try {
      const result = await reencodeImageStream(
        context,
        ref,
        stream,
        quality,
        downscale
      );
      if (result) {
        originalBytes += result.originalSize;
        newBytes += result.newSize;
        count++;
      }
    } catch (e) {
      console.warn(`Skipping image ${i + 1}:`, e);
      // Skip problematic images -- don't break the whole process
    }

    // Yield to the UI between images
    await new Promise((r) => setTimeout(r, 0));
  }

  return { originalBytes, newBytes, count };
}

async function reencodeImageStream(
  context: PDFDocument["context"],
  ref: PDFRef,
  stream: PDFRawStream,
  quality: number,
  downscale: number
): Promise<{ originalSize: number; newSize: number } | null> {
  const dict = stream.dict;
  const rawContents = stream.getContents();
  const originalSize = rawContents.length;

  // Read image properties from dict
  const widthObj = dict.get(PDFName.of("Width"));
  const heightObj = dict.get(PDFName.of("Height"));
  if (!widthObj || !heightObj) return null;

  const width =
    widthObj instanceof PDFNumber
      ? widthObj.asNumber()
      : parseInt(widthObj.toString());
  const height =
    heightObj instanceof PDFNumber
      ? heightObj.asNumber()
      : parseInt(heightObj.toString());

  if (!width || !height || width <= 0 || height <= 0) return null;

  const filterObj = dict.get(PDFName.of("Filter"));
  const filterStr = filterObj ? filterObj.toString() : "";

  // Read color space
  const csObj = dict.get(PDFName.of("ColorSpace"));
  const csStr = csObj ? csObj.toString() : "";

  // Read bits per component
  const bpcObj = dict.get(PDFName.of("BitsPerComponent"));
  const bpc = bpcObj instanceof PDFNumber ? bpcObj.asNumber() : 8;

  // Check for SMask (transparency) -- skip images with alpha for now
  const smask = dict.get(PDFName.of("SMask"));

  const targetWidth = Math.max(1, Math.round(width * downscale));
  const targetHeight = Math.max(1, Math.round(height * downscale));

  let newJpegBytes: Uint8Array | null = null;

  if (filterStr.includes("DCTDecode")) {
    // Already JPEG -- the stream bytes ARE JPEG data
    // Re-encode at lower quality and/or downscale
    try {
      const img = await decodeJpegToImage(rawContents);
      newJpegBytes = canvasToJpegBytes(img, targetWidth, targetHeight, quality);
    } catch {
      return null;
    }
  } else if (
    filterStr.includes("FlateDecode") ||
    filterStr === "" ||
    filterStr === "null"
  ) {
    // Raw pixel data (possibly Flate-compressed)
    // Only handle DeviceRGB / DeviceGray with 8 bpc for safety
    if (bpc !== 8) return null;
    if (smask) return null; // skip images with transparency masks

    const isGray = csStr.includes("DeviceGray");
    const isRGB = csStr.includes("DeviceRGB");
    // Also handle Indexed/ICCBased by skipping them (complex)
    if (!isGray && !isRGB) return null;

    let pixelData: Uint8Array;

    if (filterStr.includes("FlateDecode")) {
      // Decompress using decodePDFRawStream
      try {
        const decoded = decodePDFRawStream(stream);
        pixelData = decoded.decode();
      } catch {
        return null;
      }
    } else {
      // Uncompressed raw data
      pixelData = rawContents;
    }

    if (isGray) {
      // Convert grayscale to RGB for canvas rendering
      const rgbData = new Uint8Array(width * height * 3);
      const pixelCount = Math.min(width * height, pixelData.length);
      for (let i = 0; i < pixelCount; i++) {
        rgbData[i * 3] = pixelData[i];
        rgbData[i * 3 + 1] = pixelData[i];
        rgbData[i * 3 + 2] = pixelData[i];
      }
      pixelData = rgbData;
    }

    try {
      const sourceCanvas = renderRawRGBToCanvas(pixelData, width, height);
      newJpegBytes = canvasToJpegBytes(
        sourceCanvas,
        targetWidth,
        targetHeight,
        quality
      );
    } catch {
      return null;
    }
  } else {
    // JPXDecode, JBIG2Decode, CCITTFaxDecode, etc. -- skip
    return null;
  }

  if (!newJpegBytes) return null;

  // Only replace if the new version is actually smaller
  if (newJpegBytes.length >= originalSize * 0.95) return null;

  // Create replacement stream using context.stream()
  const newStream = context.stream(newJpegBytes, {
    Type: "XObject",
    Subtype: "Image",
    Width: targetWidth,
    Height: targetHeight,
    ColorSpace: "DeviceRGB",
    BitsPerComponent: 8,
    Filter: "DCTDecode",
    Length: newJpegBytes.length,
  });

  context.assign(ref, newStream);

  return { originalSize, newSize: newJpegBytes.length };
}

/* ------------------------------------------------------------------ */
/*  Stream compression (lossless)                                      */
/* ------------------------------------------------------------------ */

async function compressStreams(doc: PDFDocument): Promise<number> {
  const pako = await import("pako");
  const context = doc.context;
  let count = 0;

  for (const [ref, obj] of context.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream) {
      const filter = obj.dict.get(PDFName.of("Filter"));
      if (!filter) {
        // No filter = uncompressed stream
        const raw = obj.getContents();
        if (raw.length > 100) {
          try {
            const compressed = pako.deflate(raw);
            if (compressed.length < raw.length * 0.9) {
              const newStream = context.flateStream(raw);
              context.assign(ref, newStream);
              count++;
            }
          } catch {
            // Skip streams that fail to compress
          }
        }
      }
    }
  }

  return count;
}

/* ------------------------------------------------------------------ */
/*  Metadata stripping                                                 */
/* ------------------------------------------------------------------ */

function stripMetadata(doc: PDFDocument): boolean {
  try {
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setProducer("");
    doc.setCreator("");
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Main compression orchestrator                                      */
/* ------------------------------------------------------------------ */

async function compressPdf(
  buf: ArrayBuffer,
  preset: Preset,
  quality: number,
  onProgress: (current: number, total: number, status: string) => void
): Promise<{ bytes: Uint8Array; result: CompressionResult }> {
  const originalSize = buf.byteLength;

  onProgress(0, 1, "Loading PDF...");
  const doc = await PDFDocument.load(buf, { ignoreEncryption: true });

  let imagesOriginal = 0;
  let imagesCompressed = 0;
  let imagesCount = 0;
  let streamsCompressed = 0;
  let metadataStripped = false;

  if (preset === "maximum") {
    // Aggressive: downscale images to 50%, re-encode at user quality, min 10KB
    onProgress(0, 1, "Scanning images...");
    const imgResult = await findAndReencodeImages(
      doc,
      quality,
      0.5,
      10 * 1024,
      onProgress
    );
    imagesOriginal = imgResult.originalBytes;
    imagesCompressed = imgResult.newBytes;
    imagesCount = imgResult.count;

    onProgress(0, 1, "Compressing streams...");
    streamsCompressed = await compressStreams(doc);

    onProgress(0, 1, "Stripping metadata...");
    metadataStripped = stripMetadata(doc);
  } else if (preset === "balanced") {
    // Balanced: keep resolution, re-encode at higher quality, min 50KB
    onProgress(0, 1, "Scanning images...");
    const imgResult = await findAndReencodeImages(
      doc,
      quality,
      1.0,
      50 * 1024,
      onProgress
    );
    imagesOriginal = imgResult.originalBytes;
    imagesCompressed = imgResult.newBytes;
    imagesCount = imgResult.count;

    onProgress(0, 1, "Compressing streams...");
    streamsCompressed = await compressStreams(doc);

    onProgress(0, 1, "Stripping metadata...");
    metadataStripped = stripMetadata(doc);
  } else {
    // Light: lossless only
    onProgress(0, 1, "Compressing streams...");
    streamsCompressed = await compressStreams(doc);

    onProgress(0, 1, "Stripping metadata...");
    metadataStripped = stripMetadata(doc);
  }

  onProgress(0, 1, "Saving optimized PDF...");
  const bytes = await doc.save({ useObjectStreams: true });
  const output = new Uint8Array(bytes);

  return {
    bytes: output,
    result: {
      original: originalSize,
      compressed: output.length,
      imagesOriginal,
      imagesCompressed,
      imagesCount,
      streamsCompressed,
      metadataStripped,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  React component                                                    */
/* ------------------------------------------------------------------ */

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<Preset>("balanced");
  const [quality, setQuality] = useState(DEFAULT_QUALITY["balanced"]);
  const [loading, setLoading] = useState(false);
  const [progressInfo, setProgressInfo] = useState({
    current: 0,
    total: 0,
    status: "",
  });
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState("");
  const blobRef = useRef<Blob | null>(null);
  const fileNameRef = useRef<string>("");

  const handleFile = (files: File[]) => {
    if (!files || files.length === 0) return;
    setFile(files[0]);
    setResult(null);
    setError("");
    blobRef.current = null;
  };

  const handlePresetChange = (key: Preset) => {
    setPreset(key);
    setQuality(DEFAULT_QUALITY[key]);
  };

  const handleProgress = useCallback(
    (current: number, total: number, status: string) => {
      setProgressInfo({ current, total, status });
    },
    []
  );

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError("");
    setProgressInfo({ current: 0, total: 0, status: "" });
    blobRef.current = null;

    try {
      const buf = await file.arrayBuffer();
      const { bytes, result: compResult } = await compressPdf(
        buf,
        preset,
        quality,
        handleProgress
      );

      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const compressedName = `compressed_${file.name}`;
      blobRef.current = blob;
      fileNameRef.current = compressedName;

      setResult(compResult);

      const isLarger = compResult.compressed >= compResult.original;
      if (!isLarger) {
        downloadBlob(blob, compressedName);
      }
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Compression failed");
    } finally {
      setLoading(false);
      setProgressInfo({ current: 0, total: 0, status: "" });
    }
  };

  const handleDownloadAnyway = () => {
    if (blobRef.current) {
      downloadBlob(blobRef.current, fileNameRef.current);
    }
  };

  const isLarger = result ? result.compressed >= result.original : false;
  const totalPct = result ? pctString(result.original, result.compressed) : "0";
  const imagePct =
    result && result.imagesOriginal > 0
      ? pctString(result.imagesOriginal, result.imagesCompressed)
      : null;
  const showQualitySlider = preset === "maximum" || preset === "balanced";

  return (
    <div>
      {!file ? (
        <Dropzone onFiles={handleFile} />
      ) : (
        <div className="space-y-5">
          {/* File card */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#10b981"
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
                <p className="text-xs theme-text-muted">{fmt(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
                setError("");
                blobRef.current = null;
              }}
              className="theme-text-muted  text-sm font-medium"
            >
              Remove
            </button>
          </div>

          {/* Compression preset selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Compression level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePresetChange(p.key)}
                  disabled={loading}
                  className={`p-3 rounded-xl border text-left transition-colors
                    ${
                      preset === p.key
                        ? "bg-emerald-500/100 border-emerald-500 text-white"
                        : "theme-bg-secondary theme-border theme-text-secondary hover:border-emerald-300 hover:bg-emerald-500/10"
                    }`}
                >
                  <span className="block text-sm font-semibold">{p.name}</span>
                  <span
                    className={`block text-xs mt-1 ${preset === p.key ? "text-emerald-100" : "theme-text-muted"}`}
                  >
                    {p.description}
                  </span>
                  <span
                    className={`block text-xs mt-1 font-medium ${preset === p.key ? "text-emerald-200" : "theme-text-dim"}`}
                  >
                    {p.range}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality slider */}
          {showQualitySlider && (
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                type="range"
                min={0.3}
                max={0.9}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                disabled={loading}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs theme-text-muted mt-1">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {loading && progressInfo.status && (
            <ProgressBar
              current={progressInfo.current}
              total={progressInfo.total}
              status={progressInfo.status}
              color="#10b981"
            />
          )}

          {/* Result: success */}
          {result && !isLarger && (
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-500/100 rounded-full flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="font-semibold text-emerald-700 text-sm">
                  Compressed successfully!
                </span>
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 text-sm">
                {result.imagesCount > 0 && imagePct && (
                  <div className="flex justify-between theme-text-secondary">
                    <span>
                      Images ({result.imagesCount}): {fmt(result.imagesOriginal)}{" "}
                      → {fmt(result.imagesCompressed)}
                    </span>
                    <span className="text-emerald-600 font-medium">
                      {imagePct}% reduction
                    </span>
                  </div>
                )}
                {result.streamsCompressed > 0 && (
                  <div className="flex justify-between theme-text-secondary">
                    <span>Streams compressed</span>
                    <span className="font-medium">
                      {result.streamsCompressed}
                    </span>
                  </div>
                )}
                {result.metadataStripped && (
                  <div className="flex justify-between theme-text-secondary">
                    <span>Metadata</span>
                    <span className="font-medium">removed</span>
                  </div>
                )}

                <div className="pt-2 mt-2 border-t border-emerald-500/20 flex items-center gap-3">
                  <span className="theme-text-secondary">
                    {fmt(result.original)}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <span className="font-semibold text-emerald-700">
                    {fmt(result.compressed)}
                  </span>
                  <span className="ml-auto font-semibold px-2.5 py-0.5 rounded-full text-xs text-emerald-600 bg-emerald-100">
                    {totalPct}% smaller
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning: result is larger */}
          {result && isLarger && (
            <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-amber-500/100 rounded-full flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <circle cx="12" cy="17" r="1" />
                  </svg>
                </div>
                <span className="font-semibold text-amber-700 text-sm">
                  This PDF is already well-optimized. The compressed version is
                  larger than the original.
                </span>
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 text-sm">
                {result.imagesCount > 0 && (
                  <div className="flex justify-between theme-text-secondary">
                    <span>
                      Images processed: {result.imagesCount}
                    </span>
                  </div>
                )}
                {result.streamsCompressed > 0 && (
                  <div className="flex justify-between theme-text-secondary">
                    <span>Streams compressed</span>
                    <span className="font-medium">
                      {result.streamsCompressed}
                    </span>
                  </div>
                )}

                <div className="pt-2 mt-2 border-t border-amber-500/20 flex items-center gap-3">
                  <span className="theme-text-secondary">
                    {fmt(result.original)}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <span className="font-semibold text-amber-700">
                    {fmt(result.compressed)}
                  </span>
                  <span className="ml-auto font-semibold px-2.5 py-0.5 rounded-full text-xs text-amber-600 bg-amber-100">
                    {totalPct}% larger
                  </span>
                </div>
              </div>

              <button
                onClick={handleDownloadAnyway}
                className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Download anyway
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 theme-error rounded-xl text-sm">{error}</div>
          )}

          <button
            onClick={handleCompress}
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500/100 hover:bg-emerald-600 theme-btn-disabled text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Compressing..." : "Compress PDF"}
          </button>
        </div>
      )}
    </div>
  );
}
