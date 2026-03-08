"use client";
import { useState } from "react";
import Dropzone from "./components/Dropzone";
import ToolSelector from "./components/ToolSelector";
import SplitTool from "./components/tools/SplitTool";
import MergeTool from "./components/tools/MergeTool";
import CompressTool from "./components/tools/CompressTool";
import RotateTool from "./components/tools/RotateTool";
import DeletePagesTool from "./components/tools/DeletePagesTool";

export type Tool = "split" | "merge" | "compress" | "rotate" | "delete";

export default function Home() {
  const [tool, setTool] = useState<Tool | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const reset = () => {
    setTool(null);
    setFiles([]);
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📄</span>
          <span className="font-bold text-lg tracking-tight">PDF Tool</span>
        </div>
        {tool && (
          <button onClick={reset} className="text-sm text-white/50 hover:text-white transition">
            ← Back
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {!tool ? (
          <>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold mb-3">Free PDF Tools</h1>
              <p className="text-white/50">Split, merge, compress, rotate — all in your browser. Nothing uploaded to a server.</p>
            </div>
            <ToolSelector onSelect={setTool} />
          </>
        ) : (
          <div>
            {tool === "split" && <SplitTool />}
            {tool === "merge" && <MergeTool />}
            {tool === "compress" && <CompressTool />}
            {tool === "rotate" && <RotateTool />}
            {tool === "delete" && <DeletePagesTool />}
          </div>
        )}
      </div>
    </main>
  );
}
