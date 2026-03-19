"use client";
import { useState, useMemo } from "react";
import Dropzone from "../Dropzone";

type StylePreset = "classic" | "professional" | "minimal" | "colorful";
type Orientation = "landscape" | "portrait";

interface PresetConfig {
  label: string;
  headerColor: [number, number, number] | null;
  headerTextColor: number | [number, number, number];
  altRowColor: [number, number, number] | null;
  preview: { header: string; alt: string; border?: string };
}

const PRESETS: Record<StylePreset, PresetConfig> = {
  classic: {
    label: "Classic",
    headerColor: [22, 163, 74],
    headerTextColor: 255,
    altRowColor: [240, 253, 244],
    preview: { header: "#16a34a", alt: "#f0fdf4" },
  },
  professional: {
    label: "Professional",
    headerColor: [30, 64, 175],
    headerTextColor: 255,
    altRowColor: [239, 246, 255],
    preview: { header: "#1e40af", alt: "#eff6ff" },
  },
  minimal: {
    label: "Minimal",
    headerColor: null,
    headerTextColor: [30, 30, 30],
    altRowColor: null,
    preview: { header: "#f5f5f5", alt: "#ffffff", border: "#d4d4d4" },
  },
  colorful: {
    label: "Colorful",
    headerColor: [124, 58, 237],
    headerTextColor: 255,
    altRowColor: [245, 243, 255],
    preview: { header: "#7c3aed", alt: "#f5f3ff" },
  },
};

export default function ExcelToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [stylePreset, setStylePreset] = useState<StylePreset>("classic");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [suggestedOrientation, setSuggestedOrientation] = useState<Orientation | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setError("");
    setStatus("");
    try {
      const XLSX = await import("xlsx");
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf);
      if (!wb.SheetNames || wb.SheetNames.length === 0) {
        setError("This file contains no sheets.");
        setFile(null);
        return;
      }
      setSheetNames(wb.SheetNames);
      setSelectedSheets(wb.SheetNames);

      // Auto-detect orientation based on max column count across all rows
      let maxCols = 0;
      for (const sn of wb.SheetNames) {
        const ws = wb.Sheets[sn];
        if (!ws) continue;
        const jsonData = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });
        for (const row of jsonData) {
          const cols = (row as string[]).length;
          if (cols > maxCols) maxCols = cols;
        }
      }
      const suggested: Orientation = maxCols > 6 ? "landscape" : "portrait";
      setSuggestedOrientation(suggested);
      setOrientation(suggested);
    } catch (e: unknown) {
      console.error(e);
      setError("Could not read this file. It may be corrupted or unsupported.");
      setFile(null);
    }
  };

  const toggleSheet = (name: string) => {
    setSelectedSheets((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const preset = useMemo(() => PRESETS[stylePreset], [stylePreset]);

  const handleConvert = async () => {
    if (!file || selectedSheets.length === 0) return;
    setLoading(true);
    setStatus("Reading spreadsheet...");
    setError("");

    try {
      const XLSX = await import("xlsx");
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const pdf = new jsPDF(orientation === "landscape" ? "l" : "p", "pt", "a4");
      let firstPage = true;
      let convertedCount = 0;

      for (const sheetName of selectedSheets) {
        const ws = wb.Sheets[sheetName];
        if (!ws) continue;

        setStatus(`Processing sheet: ${sheetName}...`);

        const jsonData = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });
        if (jsonData.length === 0) continue;

        if (!firstPage) pdf.addPage();
        firstPage = false;
        convertedCount++;

        // Add sheet name as title
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(sheetName, 40, 40);

        // Determine header row and body
        const headers = (jsonData[0] as string[]).map((h) => String(h));
        const body = jsonData.slice(1).map((row) =>
          (row as string[]).map((cell) => String(cell ?? ""))
        );

        // Build styles based on preset
        const headStyles: Record<string, unknown> = {
          fontStyle: "bold",
          fontSize: 9,
        };
        if (preset.headerColor) {
          headStyles.fillColor = preset.headerColor;
        } else {
          // Minimal: no fill, bold text, bottom border
          headStyles.fillColor = [255, 255, 255];
          headStyles.lineWidth = { bottom: 1.5 };
          headStyles.lineColor = [100, 100, 100];
        }
        headStyles.textColor = preset.headerTextColor;

        const alternateRowStyles: Record<string, unknown> = {};
        if (preset.altRowColor) {
          alternateRowStyles.fillColor = preset.altRowColor;
        }

        autoTable(pdf, {
          head: [headers],
          body: body,
          startY: 55,
          styles: {
            fontSize: 8,
            cellPadding: 4,
            overflow: "linebreak",
            lineWidth: 0.5,
          },
          headStyles,
          alternateRowStyles,
          margin: { left: 40, right: 40 },
          tableLineColor: [200, 200, 200],
          tableLineWidth: 0.5,
        });
      }

      if (firstPage) {
        setError("No data found in the selected sheets.");
        return;
      }

      const outputName = file.name.replace(/\.(xlsx|xls|csv)$/i, "") || file.name;
      pdf.save(outputName + ".pdf");
      setStatus(`Done! Converted ${convertedCount} sheet${convertedCount !== 1 ? "s" : ""} to PDF.`);
    } catch (e: unknown) {
      console.error("Excel to PDF error:", e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  const accentColor = "#16a34a";
  const bgTint = "var(--bg-tertiary)";

  return (
    <div>
      {!file ? (
        <Dropzone
          onFiles={handleFile}
          label="Drop a spreadsheet here (.xlsx, .xls, .csv)"
          accept={{
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
            "text/csv": [".csv"],
          }}
        />
      ) : (
        <div className="space-y-5">
          {/* File info */}
          <div className="flex items-center justify-between p-4 theme-file-row rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bgTint }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium theme-text text-sm">{file.name}</p>
                <p className="text-xs theme-text-muted">{sheetNames.length} sheet{sheetNames.length !== 1 ? "s" : ""} &middot; {(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
            <button onClick={() => { setFile(null); setSheetNames([]); setSelectedSheets([]); setError(""); setStatus(""); setSuggestedOrientation(null); }} className="theme-text-muted  text-sm font-medium">Remove</button>
          </div>

          {/* Sheet selector */}
          {sheetNames.length > 1 && (
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-2">Sheets to Include</label>
              <div className="space-y-2">
                {sheetNames.map((name) => (
                  <label key={name} className="flex items-center gap-3 p-3 theme-file-row rounded-xl cursor-pointer hover:opacity-90 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSheets.includes(name)}
                      onChange={() => toggleSheet(name)}
                      className="w-4 h-4 rounded accent-green-600"
                    />
                    <span className="text-sm font-medium theme-text-secondary">{name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Style preset selector */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">Table Style</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PRESETS) as StylePreset[]).map((key) => {
                const p = PRESETS[key];
                const selected = stylePreset === key;
                return (
                  <button
                    key={key}
                    onClick={() => setStylePreset(key)}
                    className={`p-3 rounded-xl border text-left text-sm font-medium transition-colors ${
                      selected ? "ring-2 ring-offset-1" : "theme-bg-secondary theme-border hover:opacity-80"
                    }`}
                    style={selected ? { borderColor: accentColor, outlineColor: accentColor } : {}}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {/* Color preview swatches */}
                      <div className="flex gap-0.5">
                        <div
                          className="w-4 h-4 rounded-sm"
                          style={{
                            backgroundColor: p.preview.header,
                            border: p.preview.border ? `1px solid ${p.preview.border}` : undefined,
                          }}
                        />
                        <div
                          className="w-4 h-4 rounded-sm"
                          style={{
                            backgroundColor: p.preview.alt,
                            border: p.preview.border ? `1px solid ${p.preview.border}` : undefined,
                          }}
                        />
                      </div>
                    </div>
                    <span className={selected ? "" : "theme-text-secondary"}>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orientation toggle */}
          <div>
            <label className="block text-sm font-medium theme-text-secondary mb-2">
              Page Orientation
              {suggestedOrientation && (
                <span className="ml-2 text-xs font-normal theme-text-muted">
                  (recommended: {suggestedOrientation})
                </span>
              )}
            </label>
            <div className="flex gap-2">
              {([
                { key: "landscape" as Orientation, label: "Landscape", icon: "&#9645;" },
                { key: "portrait" as Orientation, label: "Portrait", icon: "&#9647;" },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setOrientation(opt.key)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                    orientation === opt.key ? "text-white" : "theme-bg-secondary theme-border theme-text-secondary hover:opacity-80"
                  }`}
                  style={orientation === opt.key ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && (
            <div className="p-4 rounded-xl border theme-border" style={{ backgroundColor: bgTint }}>
              <p className="text-sm font-medium" style={{ color: accentColor }}>{status}</p>
            </div>
          )}

          {!loading && status && !error && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
              <p className="text-sm text-green-700">{status}</p>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={loading || selectedSheets.length === 0}
            className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-colors theme-btn-disabled"
            style={!loading && selectedSheets.length > 0 ? { backgroundColor: accentColor } : {}}
          >
            {loading ? status : selectedSheets.length === 0 ? "Select at least one sheet" : `Convert ${selectedSheets.length} Sheet${selectedSheets.length !== 1 ? "s" : ""} to PDF`}
          </button>

          <p className="text-xs theme-text-muted text-center leading-relaxed">
            Renders spreadsheet data as formatted tables in PDF. Choose a style and orientation to match your needs.
          </p>
        </div>
      )}
    </div>
  );
}
