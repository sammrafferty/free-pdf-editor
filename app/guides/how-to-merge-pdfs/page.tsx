import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Merge PDFs — Free Online PDF Combiner | PDF Tools",
  description: "Combine multiple PDF files into one document for free. Browser-based, no upload required. Step-by-step guide with tips for merging PDFs efficiently.",
  keywords: "merge PDF, combine PDFs, join PDF files, PDF combiner, merge PDF online free",
  alternates: {
    canonical: "/guides/how-to-merge-pdfs",
  },
  openGraph: {
    title: "How to Merge PDFs — Free Online PDF Combiner | PDF Tools",
    description: "Combine multiple PDF files into one document for free. Browser-based, no upload required.",
    url: "/guides/how-to-merge-pdfs",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Merge PDFs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Merge PDFs — Free Online PDF Combiner | PDF Tools",
    description: "Combine multiple PDF files into one document for free. Browser-based, no upload required.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Merge PDF Files",
  description: "Combine multiple PDF files into one document for free. Browser-based, no upload required.",
  step: [
    { "@type": "HowToStep", name: "Open the Merge PDFs tool", text: "Select \"Merge PDFs\" from the PDF Tools homepage." },
    { "@type": "HowToStep", name: "Add your PDF files", text: "Drag and drop multiple files into the upload area, or click to select them." },
    { "@type": "HowToStep", name: "Arrange the order", text: "Drag the files into your preferred sequence." },
    { "@type": "HowToStep", name: "Click Merge", text: "The tool combines all your PDFs into a single document entirely in your browser." },
    { "@type": "HowToStep", name: "Download the merged PDF", text: "Your combined document is ready for immediate download." },
  ],
  tool: { "@type": "HowToTool", name: "PDF Tools - Merge PDFs" },
};

export default function MergeGuide() {
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
          <span style={{ color: "var(--text-secondary)" }}>Merge PDFs</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Merge PDF Files
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Merging PDFs combines multiple documents into a single file. Whether you&apos;re assembling a report, compiling scanned pages, or organizing paperwork, here&apos;s how to do it for free.
        </p>

        <div className="theme-prose space-y-8">
          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Step-by-Step Instructions</h2>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the Merge PDFs tool</strong> — Select &ldquo;Merge PDFs&rdquo; from the PDF Tools homepage. It&apos;s in the &ldquo;Most Popular&rdquo; section at the top.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Add your PDF files</strong> — Drag and drop multiple files into the upload area, or click to select them from your file browser. You can add as many PDFs as you need.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Arrange the order</strong> — Files appear in the order you added them. If you need to reorder them, drag the files into your preferred sequence. The final merged document will follow this order.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Click Merge</strong> — The tool combines all your PDFs into a single document. This happens entirely in your browser — no files are uploaded anywhere.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download the merged PDF</strong> — Your combined document is ready for immediate download. All original files remain untouched.</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>When to Merge PDFs</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Assembling a job application package.</strong> Most employers want a single PDF with your resume, cover letter, references, and portfolio samples. Instead of sending four attachments, merge them into one clean file that&apos;s easy to review and forward.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Compiling scanned documents.</strong> If you scanned a multi-page document but your scanner created individual files for each page, merging brings them back together into a single coherent document. This is common with receipt scanning, tax documents, and medical records.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Creating course packets or study materials.</strong> Students and teachers often need to combine readings from multiple sources — journal articles, textbook chapters, and lecture slides — into a single study guide. Merging makes it easy to distribute and read on any device.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Consolidating monthly reports.</strong> If your team produces separate PDF reports each week or month, merging them into quarterly or annual compilations creates a clean archive. This is especially useful for compliance documentation and audit trails.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Combining contracts with exhibits.</strong> Legal documents frequently reference exhibits, schedules, or appendices that exist as separate files. Merging them creates a single, self-contained document that&apos;s easier to reference and less likely to have pieces go missing.</p>
            </div>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Tips for Better Results</h2>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li>Name your files clearly before merging so you can verify the correct order (e.g., &ldquo;01-cover-letter.pdf&rdquo;, &ldquo;02-resume.pdf&rdquo;).</li>
              <li>If some PDFs have different page sizes (letter vs. A4), the merged document preserves each page&apos;s original dimensions.</li>
              <li>For very large merges (50+ files), add them in batches to keep things manageable.</li>
              <li>After merging, consider running the result through the Compress tool if the combined file size is too large for your needs.</li>
              <li>Bookmarks and internal links from the original files may not carry over during a merge — this is a limitation of browser-based PDF processing.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Understanding File Size After Merging</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              When you merge PDFs, the resulting file size is roughly the sum of all input files. However, it can sometimes be slightly smaller because shared resources (like common fonts) are deduplicated. Conversely, if the PDFs use different fonts or have high-resolution images, the merged file will be correspondingly large.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              If the merged file is too large for your purposes — for example, if you need to email it and the total exceeds 25 MB — use the Compress PDF tool after merging. Compression can often reduce file size by 30–70% depending on the content, especially for image-heavy documents like scanned pages.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>How many PDFs can I merge at once?</h3>
                <p style={{ color: "var(--text-secondary)" }}>There&apos;s no hard limit — you can merge as many files as your browser can handle. In practice, most modern browsers can comfortably process dozens of files. For very large batches (100+), consider merging in groups of 20–30 to avoid memory issues.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Will the formatting be preserved?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes. Each page retains its original layout, fonts, images, and formatting. The merge operation appends pages sequentially without altering their content. Different page sizes and orientations within the same merged document are fully supported.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I merge non-PDF files?</h3>
                <p style={{ color: "var(--text-secondary)" }}>The Merge tool accepts only PDF files. If you need to include images, Word documents, or presentations, first convert them to PDF using the respective conversion tools (Image to PDF, Word to PDF, etc.), then merge the resulting PDFs together.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#3b82f6", borderRadius: "8px" }}>
              Try Merge PDFs Now
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
