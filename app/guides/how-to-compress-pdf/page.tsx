import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ThemeToggle } from "@/app/components/ThemeProvider";

export const metadata: Metadata = {
  title: "How to Compress a PDF — Free Online PDF Compressor | PDF Tools",
  description: "Reduce PDF file size for free. Learn how to compress PDFs in your browser without uploading files. Step-by-step guide with compression tips.",
  keywords: "compress PDF, reduce PDF size, PDF compressor, shrink PDF, make PDF smaller",
  alternates: {
    canonical: "/guides/how-to-compress-pdf",
  },
  openGraph: {
    title: "How to Compress a PDF — Free Online PDF Compressor | PDF Tools",
    description: "Reduce PDF file size for free. Learn how to compress PDFs in your browser without uploading files.",
    url: "/guides/how-to-compress-pdf",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Compress a PDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Compress a PDF — Free Online PDF Compressor | PDF Tools",
    description: "Reduce PDF file size for free. Compress PDFs in your browser without uploading files.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Compress a PDF",
  description: "Reduce PDF file size for free. Learn how to compress PDFs in your browser without uploading files.",
  step: [
    { "@type": "HowToStep", name: "Open the Compress PDF tool", text: "Select \"Compress PDF\" from the homepage." },
    { "@type": "HowToStep", name: "Upload your PDF", text: "Drag and drop your file or click to browse. The file is loaded into your browser's memory." },
    { "@type": "HowToStep", name: "Select compression level", text: "Choose between light, medium, or heavy compression depending on your needs." },
    { "@type": "HowToStep", name: "Click Compress", text: "The tool processes your PDF locally, reducing the file size." },
    { "@type": "HowToStep", name: "Download the compressed file", text: "Compare the original and compressed file sizes, then download your smaller PDF." },
  ],
  tool: { "@type": "HowToTool", name: "PDF Tools - Compress PDF" },
};

export default function CompressGuide() {
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
          <div className="flex items-center gap-3">
            <Link href="/guides" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              All Guides
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          <Link href="/guides" className="hover:opacity-80">Guides</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ color: "var(--text-secondary)" }}>Compress PDF</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Compress a PDF
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Large PDF files are inconvenient to share, slow to load, and often exceed email attachment limits. Compression reduces file size while keeping your document readable. Here&apos;s how to do it for free.
        </p>

        <div className="theme-prose space-y-8">
          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Step-by-Step Instructions</h2>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the Compress PDF tool</strong> — Select &ldquo;Compress PDF&rdquo; from the homepage. It&apos;s one of the three featured tools at the top.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Upload your PDF</strong> — Drag and drop your file or click to browse. The file is loaded into your browser&apos;s memory — nothing is sent to a server.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Select compression level</strong> — Choose between light, medium, or heavy compression depending on your needs. Light compression preserves the most quality; heavy compression achieves the smallest file size.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Click Compress</strong> — The tool processes your PDF locally, reducing the file size by optimizing images and removing unnecessary metadata.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download the compressed file</strong> — Compare the original and compressed file sizes shown on screen, then download your smaller PDF.</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>What Makes PDFs Large?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Understanding why your PDF is large helps you choose the right compression strategy:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>High-resolution images</strong> — This is the most common culprit. A single high-res photo embedded in a PDF can add 5–20 MB. Scanned documents are especially heavy because each page is essentially a full-page photograph.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Embedded fonts</strong> — PDFs embed fonts to ensure consistent display across devices. Each font family (regular, bold, italic) adds to the file size. Documents using many different fonts are larger than those using one or two.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Vector graphics</strong> — Complex illustrations, charts, and diagrams stored as vector data can contribute significant size, especially in technical or architectural documents.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Metadata and hidden layers</strong> — PDFs can contain edit history, form field data, JavaScript, annotations, and other embedded objects that inflate file size without being visible on the printed page.</li>
            </ul>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Compression Levels Explained</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Light compression (recommended for most uses):</strong> Reduces file size by 20–40% with virtually no visible quality loss. Images are resampled to screen resolution (150 DPI), and redundant metadata is stripped. The document looks identical for on-screen viewing and standard printing.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Medium compression:</strong> Reduces file size by 40–60%. Images are compressed more aggressively (100 DPI), which may show slight quality reduction in photographs but remains perfectly readable for text and charts. Best for documents you plan to view digitally rather than print at high quality.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Heavy compression:</strong> Reduces file size by 60–80%. Images are significantly downsampled (72 DPI) and use higher compression ratios. Text remains sharp, but photographs and detailed graphics will show visible quality loss. Use this when file size is the top priority — for example, emailing a large document over a slow connection.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>When to Compress</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Before emailing.</strong> Most email providers limit attachments to 25 MB (Gmail, Outlook) or even 10 MB (some corporate servers). A quick compression pass can often bring a 30 MB report under the limit without any noticeable quality loss.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Before uploading to a web portal.</strong> Job application portals, university submission systems, and government forms often have strict file size limits (typically 2–10 MB). Compression is essential for scanned documents that tend to be much larger.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>For web publishing.</strong> If you host PDFs on a website for download, smaller files mean faster page loads and lower bandwidth costs. This is especially important for mobile users on cellular connections.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>For archival storage.</strong> If you&apos;re storing hundreds or thousands of PDFs, even modest compression per file adds up to significant storage savings over time.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Will compression make my PDF look blurry?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Text is never affected by compression — it stays crisp at any level. Images may show quality reduction at medium and heavy levels, but light compression is virtually indistinguishable from the original for most documents.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I compress a PDF that&apos;s already been compressed?</h3>
                <p style={{ color: "var(--text-secondary)" }}>You can try, but the results diminish with each pass. If a PDF was already compressed, running it through again may only reduce the size by a few percent or not at all. The tool will show you the before and after sizes so you can judge whether it&apos;s worth keeping.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Is there a file size limit?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Since processing happens in your browser, the limit depends on your device&apos;s available memory. Most modern computers can handle PDFs up to 100–200 MB without issues. Very large files (500+ MB) may cause slower processing or memory errors on devices with limited RAM.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#059669", borderRadius: "8px" }}>
              Try Compress PDF Now
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
