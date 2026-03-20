"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
  accept?: Record<string, string[]>;
}

export default function Dropzone({ onFiles, multiple = false, label, accept }: Props) {
  const [accepted, setAccepted] = useState(false);

  const onDrop = useCallback(
    (files: File[]) => {
      onFiles(files);
      setAccepted(true);
      setTimeout(() => setAccepted(false), 600);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || { "application/pdf": [".pdf"] },
    multiple,
  });

  const rootClass = [
    "relative p-12 text-center cursor-pointer transition-all duration-200",
    isDragActive ? "theme-dropzone-active" : "theme-dropzone",
    !isDragActive && !accepted ? "dropzone-idle" : "",
    accepted ? "dropzone-accepted" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...getRootProps()} className={rootClass}>
      <input {...getInputProps()} aria-label={label || (multiple ? "Upload PDF files" : "Upload a PDF file")} />
      <div className="flex flex-col items-center">
        <div
          className="relative w-16 h-16 flex items-center justify-center mb-4 rounded-xl transition-colors dropzone-icon-float"
          style={{ backgroundColor: isDragActive ? "var(--accent-primary-muted)" : "var(--bg-tertiary)" }}
        >
          {/* Glow element behind icon */}
          <div className="dropzone-glow" />
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
          {label || (multiple ? "Drop PDFs here" : "Drop a PDF here")}
        </p>
        <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
          or <span style={{ color: "var(--accent-primary)" }} className="font-medium">browse files</span>
        </p>
      </div>
    </div>
  );
}
