import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import AdSlot from "@/app/components/AdSlot";
import AffiliateLink from "@/app/components/AffiliateLink";

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
      <Navbar />
      <div className="navbar-spacer" />

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

          <AdSlot slot="guide-compress-mid" format="horizontal" className="my-6 sm:my-8" />

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
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Compression Tips for Specific Use Cases</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Academic paper submissions.</strong> Many academic journals enforce strict file size limits, typically between 5 and 10 MB per manuscript. If your paper includes high-resolution figures, charts, or microscopy images, the PDF can easily exceed these limits. Use medium compression for the main submission — it reduces image resolution to 100 DPI, which is still perfectly legible on screen and in print reviews. For supplementary materials with detailed figures, consider submitting those as separate files so your main manuscript stays under the limit.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Legal filings and court e-filing.</strong> Court electronic filing systems typically cap uploads at 25 MB, and some state systems are even stricter at 10 MB per document. Legal documents often combine scanned exhibits, signed affidavits, and photocopied evidence — all of which are image-heavy. Light compression works well here because it preserves readability for court clerks while bringing file sizes into compliance. If a filing includes many exhibit pages, compress the exhibits separately before merging them into the final document.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Web publishing and downloads.</strong> If you host PDFs on your website — product catalogs, white papers, annual reports — smaller files mean faster downloads for visitors. A 2 MB PDF loads in about one second on a typical broadband connection, while a 20 MB file can take ten seconds or more. For mobile users on cellular data, the difference is even more dramatic. Medium compression strikes a good balance between visual quality and download speed for web-hosted documents.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Email attachments.</strong> Gmail caps attachments at 25 MB, Outlook at 20 MB, and many corporate email servers set even lower limits (5-10 MB is common). If your PDF is close to the limit, light compression is usually enough to bring it under. For PDFs significantly over the limit, use medium or heavy compression. As an alternative, you can also <Link href="/guides/how-to-reduce-pdf-size-for-email" className="theme-link hover:underline">read our dedicated guide on reducing PDF size for email</Link> for more targeted strategies.</p>
            </div>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>How Our Compression Compares</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>vs. Adobe Acrobat:</strong> Adobe&apos;s &ldquo;Reduce File Size&rdquo; and &ldquo;Optimize PDF&rdquo; features are powerful but require a paid Acrobat Pro subscription (around $20/month). Adobe&apos;s online compressor uploads your file to their cloud servers for processing. Our tool is completely free and processes everything locally — your document never leaves your device.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>vs. Smallpdf:</strong> Smallpdf is a popular online compressor, but the free tier limits you to two tasks per day, and all files are uploaded to their servers for processing. While they delete files after a set period, your document is still transmitted over the internet. Our tool has no daily limits and never uploads your file anywhere.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>vs. PDF Tools (this tool):</strong> Our compressor runs entirely in your browser using JavaScript. There are no daily limits, no account required, no file uploads, and no waiting in processing queues. The tradeoff is that very large files (500+ MB) depend on your device&apos;s processing power and available memory, whereas cloud-based tools offload that work to remote servers.</p>
            </div>
          </div>

          <AdSlot slot="guide-compress-faq" format="rectangle" className="my-6 sm:my-8" />
          <AffiliateLink className="my-6 sm:my-8" />

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
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>What&apos;s a good target file size for email?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Aim for under 10 MB if possible — this works with virtually every email provider and corporate server. Under 5 MB is even better for recipients on slow connections. If your document is mainly text with a few charts, light compression should easily get you there. For image-heavy documents, medium or heavy compression may be needed.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Does compression work on scanned PDFs?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes, and scanned PDFs are actually where compression makes the biggest difference. Each scanned page is essentially a full-page photograph, so these files tend to be very large. Compression resamples and re-encodes these images, often reducing the file size by 50–70% at medium compression with minimal visible quality loss.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I compress multiple PDFs at once?</h3>
                <p style={{ color: "var(--text-secondary)" }}>The tool processes one PDF at a time. If you have several files to compress, process them sequentially — each one only takes a few seconds. If you need to compress multiple PDFs and then combine them, consider compressing each file first, then using the <Link href="/guides/how-to-merge-pdfs" className="theme-link hover:underline">Merge PDFs</Link> tool to join them.</p>
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
              <Link href="/guides" className="footer-link hover:opacity-80 transition-opacity">Guides</Link>
              <Link href="/faq" className="footer-link hover:opacity-80 transition-opacity">FAQ</Link>
              <Link href="/privacy" className="footer-link hover:opacity-80 transition-opacity">Privacy</Link>
              <Link href="/terms" className="footer-link hover:opacity-80 transition-opacity">Terms</Link>
              <Link href="/about" className="footer-link hover:opacity-80 transition-opacity">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
