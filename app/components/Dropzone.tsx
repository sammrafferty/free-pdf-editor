"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
}

export default function Dropzone({ onFiles, multiple = false, label }: Props) {
  const onDrop = useCallback((accepted: File[]) => {
    onFiles(accepted);
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition
        ${isDragActive ? "border-blue-400 bg-blue-400/10" : "border-white/20 hover:border-white/40 bg-white/5"}`}
    >
      <input {...getInputProps()} />
      <div className="text-4xl mb-3">📂</div>
      <p className="font-medium">{label || (multiple ? "Drop PDFs here or click to select" : "Drop a PDF here or click to select")}</p>
      <p className="text-sm text-white/40 mt-1">PDF files only</p>
    </div>
  );
}
