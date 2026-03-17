"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
  accept?: Record<string, string[]>;
}

export default function Dropzone({ onFiles, multiple = false, label, accept }: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => onFiles(accepted),
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || { "application/pdf": [".pdf"] },
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
        ${
          isDragActive
            ? "border-red-400 bg-red-50"
            : "border-gray-200 hover:border-red-300 hover:bg-red-50/30 bg-gray-50/50"
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
            isDragActive ? "bg-red-100" : "bg-red-50"
          }`}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e5322d"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="font-semibold text-gray-700 text-base">
          {label || (multiple ? "Drop PDFs here" : "Drop a PDF here")}
        </p>
        <p className="text-sm text-gray-400 mt-1.5">
          or <span className="text-red-500 font-medium">browse files</span>
        </p>
      </div>
    </div>
  );
}
