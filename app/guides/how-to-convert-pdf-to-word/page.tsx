import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Convert PDF to Word — Free Online Converter | PDF Tools",
  description: "Convert PDF files to editable Word documents for free. Browser-based, no upload required. Learn step-by-step how to convert PDF to DOCX.",
  keywords: "PDF to Word, convert PDF to DOCX, PDF to Word converter, edit PDF text, PDF to editable document",
  alternates: {
    canonical: "/guides/how-to-convert-pdf-to-word",
  },
  openGraph: {
    title: "How to Convert PDF to Word — Free Online Converter | PDF Tools",
    description: "Convert PDF files to editable Word documents for free. Browser-based, no upload required.",
    url: "/guides/how-to-convert-pdf-to-word",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Convert PDF to Word" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Convert PDF to Word — Free Online Converter | PDF Tools",
    description: "Convert PDF files to editable Word documents for free. Browser-based, no upload required.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Convert PDF to Word",
  description: "Convert PDF files to editable Word documents for free. Browser-based, no upload required.",
  step: [
    { "@type": "HowToStep", name: "Open the PDF to Word tool", text: "Find \"PDF to Word\" in the Convert section of the PDF Tools homepage." },
    { "@type": "HowToStep", name: "Upload your PDF", text: "Drag and drop the file or click to browse. The PDF is processed entirely in your browser." },
    { "@type": "HowToStep", name: "Wait for conversion", text: "The tool extracts text, formatting, and layout information and reconstructs it as a Word document." },
    { "@type": "HowToStep", name: "Download the DOCX file", text: "Your converted document is ready to download and open in any word processor." },
  ],
  tool: { "@type": "HowToTool", name: "PDF Tools - PDF to Word" },
};

export default function ConvertGuide() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="theme-header sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80">
            <Image src="/logo.svg" alt="PDF Tools" width={36} height={36} className="w-8 h-8 sm:w-9 sm:h-9" />
            <span className="font-bold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>PDF Tools</span>
          </Link>
          <Link href="/guides" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            All Guides
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          <Link href="/guides" className="hover:opacity-80">Guides</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ color: "var(--text-secondary)" }}>PDF to Word</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Convert PDF to Word
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Need to edit text in a PDF? Converting it to a Word document makes the content editable in Microsoft Word, Google Docs, or any other word processor. Here&apos;s how to do it for free.
        </p>

        <div className="theme-prose space-y-8">
          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Step-by-Step Instructions</h2>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the PDF to Word tool</strong> — Find &ldquo;PDF → Word&rdquo; in the Convert section of the PDF Tools homepage.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Upload your PDF</strong> — Drag and drop the file or click to browse. The PDF is processed entirely in your browser.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Wait for conversion</strong> — The tool extracts text, formatting, and layout information from the PDF and reconstructs it as a Word-compatible document.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download the DOCX file</strong> — Your converted document is ready to download and open in any word processor.</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Understanding PDF-to-Word Conversion</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              PDFs and Word documents store information fundamentally differently. A PDF is designed for consistent display — it describes exactly where each character, image, and line should appear on a page. A Word document is designed for editing — it stores text as flowing paragraphs that reflow based on page size, margins, and font settings.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              Converting between these formats requires the tool to reverse-engineer the PDF&apos;s visual layout into editable paragraphs, headings, and lists. Simple text-heavy documents (reports, articles, letters) convert very well. Complex layouts with multiple columns, text boxes, intricate tables, or heavy graphics may need manual adjustments after conversion.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>What Converts Well</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Text-heavy documents</strong> — Reports, essays, articles, and letters with straightforward formatting convert with high accuracy. Paragraphs, headings, bold/italic text, and basic lists are reliably preserved.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Simple tables</strong> — Tables with consistent rows and columns convert well. The tool reconstructs cell boundaries and maintains the data structure.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Standard business documents</strong> — Invoices, proposals, and contracts that use common layouts and fonts typically produce clean, editable Word files.</p>
            </div>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>What May Need Manual Cleanup</h2>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Multi-column layouts</strong> — Newsletters and magazines with two or three columns may have text from different columns mixed together. You may need to re-separate the content.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Scanned PDFs</strong> — If the PDF is a scanned image (not digital text), the converter can only extract what&apos;s rendered as text data. Purely image-based pages will appear as embedded images in the Word document, not editable text. For scanned documents, you need OCR (optical character recognition) software first.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Custom fonts</strong> — If the PDF uses proprietary or unusual fonts, the Word document may substitute similar system fonts. The text content is preserved, but the visual appearance may differ slightly.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Complex headers and footers</strong> — Running headers, page numbers, and footnotes may appear inline with the body text rather than in Word&apos;s header/footer sections.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Tips for Best Results</h2>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li>Start with a digitally-created PDF (not a scan) for the best conversion quality.</li>
              <li>If you only need to edit a few words, consider using the Redact tool to cover old text and the Sign/Watermark tool to add new text — this avoids the formatting challenges of full conversion.</li>
              <li>After conversion, review the document in Word and fix any formatting issues before making your edits.</li>
              <li>For forms and fillable PDFs, the form fields may convert as plain text. You may need to recreate form fields in Word.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I convert back from Word to PDF?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes. PDF Tools includes a Word to PDF converter that works the same way — entirely in your browser. You can convert back and forth as needed.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Will the converted file work in Google Docs?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes. The output is a standard .docx file that opens in Microsoft Word, Google Docs, LibreOffice Writer, Apple Pages, and any other word processor that supports the DOCX format.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Is the conversion 100% accurate?</h3>
                <p style={{ color: "var(--text-secondary)" }}>No PDF-to-Word converter is 100% accurate for all documents, because the two formats store information so differently. Simple documents convert with near-perfect accuracy. Complex layouts may need minor manual adjustments. The text content itself is always preserved — it&apos;s the formatting that may vary.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#2563eb", borderRadius: "8px" }}>
              Try PDF to Word Now
            </Link>
            <Link href="/guides" className="text-sm theme-link hover:underline">View all guides</Link>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid var(--border-primary)" }} className="mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            <span>All processing happens locally in your browser.</span>
            <div className="flex items-center gap-4">
              <Link href="/guides" className="hover:opacity-80 transition-opacity">Guides</Link>
              <Link href="/faq" className="hover:opacity-80 transition-opacity">FAQ</Link>
              <Link href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</Link>
              <Link href="/terms" className="hover:opacity-80 transition-opacity">Terms</Link>
              <Link href="/about" className="hover:opacity-80 transition-opacity">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
