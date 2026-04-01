import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import AdSlot from "@/app/components/AdSlot";
import AffiliateLink from "@/app/components/AffiliateLink";

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
      <Navbar />
      <div className="navbar-spacer" />

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

          <AdSlot slot="guide-merge-mid" format="horizontal" className="my-6 sm:my-8" />

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
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Merging PDFs on Different Platforms</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Mac (using Preview).</strong> macOS includes a built-in way to merge PDFs through Preview. Open the first PDF, show the thumbnail sidebar (View &gt; Thumbnails), then drag additional PDF files into the sidebar at the position where you want them inserted. It works, but it&apos;s limited — you can only drop entire files, not select specific pages, and the interface can be confusing when working with many documents. For a detailed walkthrough, see our <Link href="/guides/how-to-merge-pdfs-on-mac" className="theme-link hover:underline">guide to merging PDFs on Mac</Link>.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Windows.</strong> Windows does not include a built-in PDF merge tool. Microsoft Edge can view PDFs but not combine them. Third-party software like Adobe Acrobat can do it but requires a subscription. The simplest free option is to use our browser-based tool — open it in Chrome, Edge, or Firefox, drop your files in, and merge. No installation needed.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>iPhone and iPad.</strong> On iOS, open Safari and navigate to our Merge PDFs tool. The drag-and-drop interface works with touch — tap to select files from the Files app or iCloud Drive. The merge runs in Safari&apos;s JavaScript engine, so it works even on older devices. The merged file downloads to your Files app where you can share it via email, AirDrop, or any other app.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Chromebook.</strong> Chromebooks have limited local app support, which makes browser-based tools especially valuable. Our merge tool runs entirely in Chrome, so it works perfectly on any Chromebook — even budget models. No Android app or Linux container needed. Just open the site, add your files, and merge.</p>
            </div>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Organizing Pages After Merging</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p>After merging multiple PDFs into one document, you may find that some pages need adjustments. PDF Tools includes several companion tools that work well in sequence with merging:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong style={{ color: "var(--text-primary)" }}>Fix rotated pages</strong> — If some source documents had different orientations, use the <Link href="/rotate-pdf" className="theme-link hover:underline">Rotate PDF</Link> tool to correct any sideways or upside-down pages in the merged file.</li>
                <li><strong style={{ color: "var(--text-primary)" }}>Remove unwanted pages</strong> — Maybe one of the source PDFs had a cover page or blank page you don&apos;t need. Use <Link href="/delete-pdf-pages" className="theme-link hover:underline">Delete PDF Pages</Link> to remove them from the merged document.</li>
                <li><strong style={{ color: "var(--text-primary)" }}>Extract specific sections</strong> — If the merged document is long and you need to pull out a specific section to share separately, use <Link href="/extract-pdf-pages" className="theme-link hover:underline">Extract PDF Pages</Link> to create a new file with just those pages.</li>
              </ul>
              <p>These tools all process files locally in your browser, so you can chain them together without uploading anything. Merge first, then refine the result with whatever adjustments are needed.</p>
            </div>
          </div>

          <AdSlot slot="guide-merge-faq" format="rectangle" className="my-6 sm:my-8" />
          <AffiliateLink className="my-6 sm:my-8" />

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
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I merge password-protected PDFs?</h3>
                <p style={{ color: "var(--text-secondary)" }}>If the PDFs require a password to open (user password), you&apos;ll need to remove the password protection first. PDFs with owner passwords (restricting editing but not viewing) can typically be merged without issues. If you run into an error, try opening each PDF individually and re-saving it as an unprotected copy before merging.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Does the order I add files matter?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes — the merged document follows the order shown in the file list. The first file&apos;s pages come first, followed by the second file&apos;s pages, and so on. You can drag files to rearrange them before clicking Merge, so take a moment to verify the sequence is correct.</p>
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
