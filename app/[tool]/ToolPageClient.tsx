"use client";

import dynamic from "next/dynamic";
import ThemeProvider from "../components/ThemeProvider";
import ProcessingInterstitial from "../components/ProcessingInterstitial";

const toolComponentMap: Record<string, React.ComponentType> = {
  split: dynamic(() => import("../components/tools/SplitTool")),
  merge: dynamic(() => import("../components/tools/MergeTool")),
  compress: dynamic(() => import("../components/tools/CompressTool")),
  rotate: dynamic(() => import("../components/tools/RotateTool")),
  delete: dynamic(() => import("../components/tools/DeletePagesTool")),
  extract: dynamic(() => import("../components/tools/ExtractPagesTool")),
  watermark: dynamic(() => import("../components/tools/WatermarkTool")),
  number: dynamic(() => import("../components/tools/NumberPagesTool")),
  crop: dynamic(() => import("../components/tools/CropTool")),
  redact: dynamic(() => import("../components/tools/RedactTool")),
  sign: dynamic(() => import("../components/tools/SignTool")),
  imagetopdf: dynamic(() => import("../components/tools/ImageToPdfTool")),
  pdftoimage: dynamic(() => import("../components/tools/PdfToImageTool")),
  pdftodocx: dynamic(() => import("../components/tools/PdfToDocxTool")),
  docxtopdf: dynamic(() => import("../components/tools/DocxToPdfTool")),
  pdftoexcel: dynamic(() => import("../components/tools/PdfToExcelTool")),
  exceltopdf: dynamic(() => import("../components/tools/ExcelToPdfTool")),
  pdftopptx: dynamic(() => import("../components/tools/PdfToPptxTool")),
  pptxtopdf: dynamic(() => import("../components/tools/PptxToPdfTool")),
  edittext: dynamic(() => import("../components/tools/EditTextTool")),
};

interface Props {
  toolId: string;
}

export default function ToolPageClient({ toolId }: Props) {
  const ToolComponent = toolComponentMap[toolId];

  if (!ToolComponent) {
    return (
      <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
        Tool not found.
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToolComponent />
      <ProcessingInterstitial />
    </ThemeProvider>
  );
}
