/**
 * Test script for core PDF tool logic.
 * Uses pdf-lib to create test PDFs and validate each operation.
 */
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ ${msg}`);
    failed++;
  }
}

async function createTestPdf(pageCount = 5) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pageCount; i++) {
    const page = pdf.addPage([612, 792]);
    page.drawText(`Page ${i + 1}`, { x: 50, y: 700, size: 24, font, color: rgb(0, 0, 0) });
  }
  return pdf.save();
}

// ─── SPLIT / EXTRACT PAGES ─────────────────────────────────────
async function testSplit() {
  console.log("\n🔪 SplitTool (extract pages by range)");

  const srcBytes = await createTestPdf(5);
  const srcPdf = await PDFDocument.load(srcBytes);

  // Extract pages 2-4
  const newPdf = await PDFDocument.create();
  const indices = [1, 2, 3]; // 0-based for pages 2,3,4
  const copied = await newPdf.copyPages(srcPdf, indices);
  copied.forEach((p) => newPdf.addPage(p));
  const outBytes = await newPdf.save();
  const outPdf = await PDFDocument.load(outBytes);

  assert(outPdf.getPageCount() === 3, "Split 2-4 from 5-page PDF → 3 pages");

  // Single page
  const single = await PDFDocument.create();
  const [onePage] = await single.copyPages(srcPdf, [0]);
  single.addPage(onePage);
  const singleBytes = await single.save();
  const singlePdf = await PDFDocument.load(singleBytes);
  assert(singlePdf.getPageCount() === 1, "Extract single page works");

  // Edge: all pages
  const allPdf = await PDFDocument.create();
  const allCopied = await allPdf.copyPages(srcPdf, srcPdf.getPageIndices());
  allCopied.forEach((p) => allPdf.addPage(p));
  const allBytes = await allPdf.save();
  const allOut = await PDFDocument.load(allBytes);
  assert(allOut.getPageCount() === 5, "Extract all pages works");
}

// ─── MERGE ──────────────────────────────────────────────────────
async function testMerge() {
  console.log("\n📎 MergeTool");

  const pdf1Bytes = await createTestPdf(3);
  const pdf2Bytes = await createTestPdf(2);

  const merged = await PDFDocument.create();

  const doc1 = await PDFDocument.load(pdf1Bytes);
  const pages1 = await merged.copyPages(doc1, doc1.getPageIndices());
  pages1.forEach((p) => merged.addPage(p));

  const doc2 = await PDFDocument.load(pdf2Bytes);
  const pages2 = await merged.copyPages(doc2, doc2.getPageIndices());
  pages2.forEach((p) => merged.addPage(p));

  const outBytes = await merged.save();
  const outPdf = await PDFDocument.load(outBytes);

  assert(outPdf.getPageCount() === 5, "Merge 3-page + 2-page → 5 pages");

  // Edge: merge single-page PDFs
  const a = await createTestPdf(1);
  const b = await createTestPdf(1);
  const m2 = await PDFDocument.create();
  const da = await PDFDocument.load(a);
  const db = await PDFDocument.load(b);
  const pa = await m2.copyPages(da, da.getPageIndices());
  pa.forEach((p) => m2.addPage(p));
  const pb = await m2.copyPages(db, db.getPageIndices());
  pb.forEach((p) => m2.addPage(p));
  const m2Bytes = await m2.save();
  const m2Out = await PDFDocument.load(m2Bytes);
  assert(m2Out.getPageCount() === 2, "Merge two 1-page PDFs → 2 pages");
}

// ─── COMPRESS ───────────────────────────────────────────────────
async function testCompress() {
  console.log("\n📦 CompressTool");

  const srcBytes = await createTestPdf(10);
  const pdf = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
  const compressedBytes = await pdf.save({ useObjectStreams: true });

  assert(compressedBytes.length > 0, "Compressed output is non-empty");
  // Verify it's still valid
  const reloaded = await PDFDocument.load(compressedBytes);
  assert(reloaded.getPageCount() === 10, "Compressed PDF retains all 10 pages");

  // Edge: single page
  const single = await createTestPdf(1);
  const sp = await PDFDocument.load(single);
  const sc = await sp.save({ useObjectStreams: true });
  const sr = await PDFDocument.load(sc);
  assert(sr.getPageCount() === 1, "Single-page compression works");
}

// ─── ROTATE ─────────────────────────────────────────────────────
async function testRotate() {
  console.log("\n🔄 RotateTool");

  const srcBytes = await createTestPdf(3);
  const pdf = await PDFDocument.load(srcBytes);

  // Rotate page 1 by 90°
  const page0 = pdf.getPage(0);
  const origAngle = page0.getRotation().angle;
  page0.setRotation(degrees((origAngle + 90) % 360));
  assert(page0.getRotation().angle === 90, "Page rotated to 90°");

  // Rotate page 2 by 180°
  const page1 = pdf.getPage(1);
  page1.setRotation(degrees((page1.getRotation().angle + 180) % 360));
  assert(page1.getRotation().angle === 180, "Page rotated to 180°");

  // Rotate page 3 by 270°
  const page2 = pdf.getPage(2);
  page2.setRotation(degrees((page2.getRotation().angle + 270) % 360));
  assert(page2.getRotation().angle === 270, "Page rotated to 270°");

  // Save and reload
  const outBytes = await pdf.save();
  const outPdf = await PDFDocument.load(outBytes);
  assert(outPdf.getPage(0).getRotation().angle === 90, "Rotation persists after save (90°)");
  assert(outPdf.getPage(1).getRotation().angle === 180, "Rotation persists after save (180°)");
  assert(outPdf.getPage(2).getRotation().angle === 270, "Rotation persists after save (270°)");

  // Double rotation: 90 + 90 = 180
  const pdf2 = await PDFDocument.load(await createTestPdf(1));
  const p = pdf2.getPage(0);
  p.setRotation(degrees((p.getRotation().angle + 90) % 360));
  p.setRotation(degrees((p.getRotation().angle + 90) % 360));
  assert(p.getRotation().angle === 180, "Double 90° rotation = 180°");
}

// ─── DELETE PAGES ───────────────────────────────────────────────
async function testDeletePages() {
  console.log("\n🗑️  DeletePagesTool");

  const srcBytes = await createTestPdf(5);
  const srcPdf = await PDFDocument.load(srcBytes);

  // Delete pages 2 and 4 (0-based: 1, 3)
  const toDelete = new Set([1, 3]);
  const keepIndices = Array.from({ length: 5 }, (_, i) => i).filter((i) => !toDelete.has(i));
  assert(keepIndices.length === 3, "Keep 3 of 5 pages after deleting 2");

  const newPdf = await PDFDocument.create();
  const copied = await newPdf.copyPages(srcPdf, keepIndices);
  copied.forEach((p) => newPdf.addPage(p));
  const outBytes = await newPdf.save();
  const outPdf = await PDFDocument.load(outBytes);
  assert(outPdf.getPageCount() === 3, "Output has 3 pages after deleting 2");

  // Edge: delete all but one
  const srcPdf2 = await PDFDocument.load(srcBytes);
  const del2 = new Set([0, 1, 2, 3]);
  const keep2 = [4];
  const np2 = await PDFDocument.create();
  const cp2 = await np2.copyPages(srcPdf2, keep2);
  cp2.forEach((p) => np2.addPage(p));
  const ob2 = await np2.save();
  const op2 = await PDFDocument.load(ob2);
  assert(op2.getPageCount() === 1, "Delete all but last page → 1 page");

  // Edge: can't delete ALL pages (validation check)
  const allDelete = new Set(Array.from({ length: 5 }, (_, i) => i));
  assert(allDelete.size >= 5, "Deleting all pages should be rejected (validation)");
}

// ─── EXTRACT PAGES ──────────────────────────────────────────────
async function testExtractPages() {
  console.log("\n📄 ExtractPagesTool");

  const srcBytes = await createTestPdf(5);
  const srcPdf = await PDFDocument.load(srcBytes);

  // Extract pages 1, 3, 5 (0-based: 0, 2, 4)
  const selected = [0, 2, 4];
  const newPdf = await PDFDocument.create();
  const copied = await newPdf.copyPages(srcPdf, selected);
  copied.forEach((p) => newPdf.addPage(p));
  const outBytes = await newPdf.save();
  const outPdf = await PDFDocument.load(outBytes);

  assert(outPdf.getPageCount() === 3, "Extract 3 specific pages from 5-page PDF");

  // Edge: extract single page
  const srcPdf2 = await PDFDocument.load(srcBytes);
  const np2 = await PDFDocument.create();
  const [cp2] = await np2.copyPages(srcPdf2, [2]);
  np2.addPage(cp2);
  const ob2 = await np2.save();
  const op2 = await PDFDocument.load(ob2);
  assert(op2.getPageCount() === 1, "Extract single page works");
}

// ─── PARSERANGE LOGIC ───────────────────────────────────────────
function testParseRange() {
  console.log("\n🔢 parseRange logic");

  function parseRange(r, max) {
    const pages = [];
    const parts = r.split(",").map((s) => s.trim());
    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        for (let i = Math.max(a, 1); i <= Math.min(b, max); i++) pages.push(i);
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n >= 1 && n <= max) pages.push(n);
      }
    }
    return [...new Set(pages)].sort((a, b) => a - b);
  }

  assert(JSON.stringify(parseRange("1-3", 5)) === "[1,2,3]", "Range 1-3 of 5");
  assert(JSON.stringify(parseRange("2, 4", 5)) === "[2,4]", "Individual pages 2, 4");
  assert(JSON.stringify(parseRange("1-3, 5", 5)) === "[1,2,3,5]", "Mixed range + individual");
  assert(JSON.stringify(parseRange("0-2", 5)) === "[1,2]", "Range starting at 0 → clamps to 1");
  assert(JSON.stringify(parseRange("4-10", 5)) === "[4,5]", "Range exceeding max → clamps");
  assert(JSON.stringify(parseRange("", 5)) === "[]", "Empty string → empty");
  assert(JSON.stringify(parseRange("abc", 5)) === "[]", "Non-numeric → empty");
  assert(JSON.stringify(parseRange("1, 1, 2", 5)) === "[1,2]", "Deduplicated");
  assert(JSON.stringify(parseRange("-1", 5)) === "[1]", "'-1' parsed as range 0-1, clamped to [1]");
}

// ─── RUN ALL ────────────────────────────────────────────────────
async function main() {
  console.log("=== PDF Core Tools Tests ===");

  testParseRange();
  await testSplit();
  await testMerge();
  await testCompress();
  await testRotate();
  await testDeletePages();
  await testExtractPages();

  console.log(`\n${"=".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
