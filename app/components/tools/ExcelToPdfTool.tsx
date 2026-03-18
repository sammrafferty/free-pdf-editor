"use client";
import { useState } from "react";
import Dropzone from "../Dropzone";

export default function ExcelToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFile = async (files: File[]) => {
    const f = files[0];
    setFile(f);
    setError("");
    setStatus("");
    try {
      const XLSX = await import("xlsx");
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf);
      setSheetNames(wb.SheetNames);
      setSelectedSheets(wb.SheetNames);
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
      const pdf = new jsPDF("l", "pt", "a4"); // landscape for wide tables
      let firstPage = true;

      for (const sheetName of selectedSheets) {
        const ws = wb.Sheets[sheetName];
        if (!ws) continue;

        setStatus(`Processing sheet: ${sheetName}...`);

        const jsonData = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });
        if (jsonData.length === 0) continue;

        if (!firstPage) pdf.addPage();
        firstPage = false;

        // Add sheet name as title
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(sheetName, 40, 40);

        // Determine header row and body
        const headers = (jsonData[0] as string[]).map((h) => String(h));
        const body = jsonData.slice(1).map((row) =>
          (row as string[]).map((cell) => String(cell ?? ""))
        );

        // Use autoTable
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
          headStyles: {
            fillColor: [22, 163, 74], // green-600
            textColor: 255,
            fontStyle: "bold",
            fontSize: 9,
          },
          alternateRowStyles: {
            fillColor: [240, 253, 244], // green-50
          },
          margin: { left: 40, right: 40 },
          tableLineColor: [200, 200, 200],
          tableLineWidth: 0.5,
        });
      }

      if (firstPage) {
        setError("No data found in the selected sheets.");
        setLoading(false);
        return;
      }

      pdf.save(file.name.replace(/\.(xlsx|xls|csv)$/i, "") + ".pdf");
      setStatus(`Done! Converted ${selectedSheets.length} sheet${selectedSheets.length > 1 ? "s" : ""} to PDF.`);
    } catch (e: unknown) {
      console.error("Excel to PDF error:", e);
      setError("Conversion failed: " + (e instanceof Error ? e.message : String(e)));
    }
    setLoading(false);
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
            <button onClick={() => { setFile(null); setSheetNames([]); setSelectedSheets([]); setError(""); setStatus(""); }} className="theme-text-muted  text-sm font-medium">Remove</button>
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

          {error && (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/10">
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
            {loading ? status : `Convert ${selectedSheets.length} Sheet${selectedSheets.length !== 1 ? "s" : ""} to PDF`}
          </button>

          <p className="text-xs theme-text-muted text-center leading-relaxed">
            Renders spreadsheet data as formatted tables in PDF. Uses landscape orientation for wide tables.
          </p>
        </div>
      )}
    </div>
  );
}
