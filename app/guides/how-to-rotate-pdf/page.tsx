import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle } from "@/app/components/ThemeProvider";
import Logo from "@/app/components/Logo";
import AdSlot from "@/app/components/AdSlot";

export const metadata: Metadata = {
  title: "How to Rotate PDF Pages — Free Online PDF Rotator | PDF Tools",
  description: "Rotate PDF pages 90, 180, or 270 degrees for free. Fix sideways or upside-down scans in your browser. Step-by-step guide.",
  keywords: "rotate PDF, turn PDF pages, fix sideways PDF, PDF rotator, rotate PDF online free",
  alternates: {
    canonical: "/guides/how-to-rotate-pdf",
  },
  openGraph: {
    title: "How to Rotate PDF Pages — Free Online PDF Rotator | PDF Tools",
    description: "Rotate PDF pages 90, 180, or 270 degrees for free. Fix sideways or upside-down scans in your browser.",
    url: "/guides/how-to-rotate-pdf",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Rotate PDF Pages" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Rotate PDF Pages — Free Online PDF Rotator | PDF Tools",
    description: "Rotate PDF pages 90, 180, or 270 degrees for free. Fix sideways or upside-down scans.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Rotate PDF Pages",
  description: "Rotate PDF pages 90, 180, or 270 degrees for free. Fix sideways or upside-down scans in your browser.",
  step: [
    { "@type": "HowToStep", name: "Open the Rotate Pages tool", text: "Find it in the \"Organize\" section on the PDF Tools homepage." },
    { "@type": "HowToStep", name: "Upload your PDF", text: "Drag and drop or click to browse. Your file is loaded locally in the browser." },
    { "@type": "HowToStep", name: "Choose rotation angle", text: "Select 90 degrees clockwise, 90 degrees counterclockwise, or 180 degrees." },
    { "@type": "HowToStep", name: "Apply rotation", text: "Click the rotate button. The pages are transformed instantly in your browser." },
    { "@type": "HowToStep", name: "Download the corrected PDF", text: "Your fixed document is ready to download with the correct page orientation." },
  ],
  tool: { "@type": "HowToTool", name: "PDF Tools - Rotate PDF" },
};

export default function RotateGuide() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="theme-header sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80">
            <Logo size={38} />
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
          <span style={{ color: "var(--text-secondary)" }}>Rotate PDF</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Rotate PDF Pages
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Got a PDF with sideways or upside-down pages? This happens frequently with scanned documents, mobile photos saved as PDFs, and files received from others. Here&apos;s how to fix the orientation in seconds.
        </p>

        <div className="theme-prose space-y-8">
          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Step-by-Step Instructions</h2>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the Rotate Pages tool</strong> — Find it in the &ldquo;Organize&rdquo; section on the PDF Tools homepage.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Upload your PDF</strong> — Drag and drop or click to browse. Your file is loaded locally in the browser.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Choose rotation angle</strong> — Select 90° clockwise, 90° counterclockwise, or 180° (flip upside down). You can apply the rotation to all pages or specific page numbers.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Apply rotation</strong> — Click the rotate button. The pages are transformed instantly in your browser.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download the corrected PDF</strong> — Your fixed document is ready to download with the correct page orientation.</li>
            </ol>
          </div>

          <AdSlot slot="guide-rotate-mid" format="horizontal" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Why Do PDFs End Up Sideways?</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Scanner orientation mismatch.</strong> When you scan a document, the scanner may not detect the page orientation correctly. This is especially common with automatic document feeders (ADFs) where pages can be inserted in landscape orientation but the scanner assumes portrait. The resulting PDF pages appear rotated 90 degrees.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Mobile phone camera PDFs.</strong> When you photograph a document with your phone and convert it to PDF, the phone&apos;s orientation sensor may misread the angle. This is particularly common when the phone is held at an angle while photographing a document on a desk.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Mixed orientation documents.</strong> Some documents contain both portrait and landscape pages — for example, a report where most pages are portrait but tables or charts appear in landscape. PDF viewers display all pages with the same orientation, so landscape pages appear sideways.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Software export issues.</strong> Some applications export PDFs with incorrect rotation metadata. The content is correct, but the page rotation flag in the PDF specification tells viewers to display it at the wrong angle.</p>
            </div>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Rotation Options Explained</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>90° clockwise:</strong> Turns the page a quarter turn to the right. Use this when text reads from bottom to top (the page was scanned with the left edge on top).</p>
              <p><strong style={{ color: "var(--text-primary)" }}>90° counterclockwise:</strong> Turns the page a quarter turn to the left. Use this when text reads from top to bottom (the page was scanned with the right edge on top).</p>
              <p><strong style={{ color: "var(--text-primary)" }}>180°:</strong> Flips the page upside down. Use this when the entire page is inverted — text appears upside down and mirrored left-to-right.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Tips</h2>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li>If only certain pages are sideways, specify those page numbers rather than rotating the entire document.</li>
              <li>Rotation doesn&apos;t affect content quality — text, images, and formatting remain identical. Only the display angle changes.</li>
              <li>If you&apos;re dealing with a scanned document where every page is sideways, rotate all pages at once to save time.</li>
              <li>After rotating, the page dimensions update accordingly — a portrait page rotated 90° becomes landscape, and vice versa.</li>
            </ul>
          </div>

          <AdSlot slot="guide-rotate-faq" format="rectangle" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Does rotation change the file size?</h3>
                <p style={{ color: "var(--text-secondary)" }}>No. Rotation modifies the page&apos;s display transformation without re-encoding the content. The file size remains virtually the same.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I rotate individual pages in a multi-page PDF?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes. You can specify which pages to rotate using page numbers or ranges (e.g., &ldquo;3, 5-7&rdquo;). Pages not specified remain at their current orientation.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>My PDF looks correct on my computer but sideways on my phone. Why?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Different PDF viewers interpret rotation metadata differently. Some viewers auto-rotate based on content detection, while others display the raw page orientation. Explicitly setting the rotation with this tool ensures consistent display across all viewers and devices.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold" style={{ backgroundColor: "#f59e0b", borderRadius: "8px", color: "#1c1917" }}>
              Try Rotate PDF Now
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
