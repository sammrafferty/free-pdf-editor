"use client";
import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, useAnimate } from "framer-motion";
import { springSnap } from "@/app/lib/motion";

interface Props {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
  accept?: Record<string, string[]>;
}

export default function Dropzone({ onFiles, multiple = false, label, accept }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const isHovered = useRef(false);
  const [hovered, setHovered] = useState(false);

  const onDrop = useCallback(
    (files: File[]) => {
      onFiles(files);
      setAccepted(true);

      // One-shot accepted flash via useAnimate
      animate(scope.current, {
        borderColor: ["#22c55e", "#22c55e", "var(--border-accent)"],
        backgroundColor: ["rgba(34,197,94,0.08)", "rgba(34,197,94,0.08)", "transparent"],
      }, { duration: 0.6, ease: "easeOut" });

      setTimeout(() => setAccepted(false), 600);
    },
    [onFiles, animate, scope]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || { "application/pdf": [".pdf"] },
    multiple,
  });

  const shouldFloat = isDragActive || hovered;

  return (
    <div
      {...getRootProps()}
      onMouseEnter={() => { isHovered.current = true; setHovered(true); }}
      onMouseLeave={() => { isHovered.current = false; setHovered(false); }}
      className={[
        "relative cursor-pointer",
        isDragActive ? "theme-dropzone-active" : "theme-dropzone",
      ].join(" ")}
    >
      {/* Motion overlay for breathing / scale animation */}
      <motion.div
        ref={scope}
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        animate={
          isDragActive
            ? { scale: 1.02, borderColor: "var(--accent-primary)" }
            : accepted
              ? {} /* useAnimate handles accepted flash */
              : {
                  borderColor: [
                    "var(--border-accent)",
                    "var(--border-hover)",
                    "var(--border-accent)",
                  ],
                }
        }
        transition={
          isDragActive
            ? springSnap
            : { repeat: Infinity, duration: 3, ease: "easeInOut" }
        }
        style={{ border: "2px solid var(--border-accent)", borderRadius: "inherit" }}
      />

      <div className="relative p-12 text-center">
        <input {...getInputProps()} aria-label={label || (multiple ? "Upload PDF files" : "Upload a PDF file")} />
        <div className="flex flex-col items-center">
          {/* Icon wrapper with float animation */}
          <motion.div
            className="relative w-16 h-16 flex items-center justify-center mb-4 rounded-xl"
            style={{ backgroundColor: isDragActive ? "var(--accent-primary-muted)" : "var(--bg-tertiary)" }}
            animate={
              shouldFloat
                ? { y: [0, -4, 0] }
                : { y: 0 }
            }
            transition={
              shouldFloat
                ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          >
            {/* Glow behind icon */}
            <motion.div
              className="absolute w-20 h-20 rounded-full pointer-events-none"
              style={{ background: "var(--accent-primary)", filter: "blur(20px)" }}
              animate={{
                opacity: isDragActive ? 0.2 : 0,
                scale: isDragActive ? [1, 1.3, 1] : 1,
              }}
              transition={
                isDragActive
                  ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
            />
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </motion.div>
          <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
            {label || (multiple ? "Drop PDFs here" : "Drop a PDF here")}
          </p>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
            or <span style={{ color: "var(--accent-primary)" }} className="font-medium">browse files</span>
          </p>
        </div>
      </div>
    </div>
  );
}
