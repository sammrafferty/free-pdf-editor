import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import AdSlot from "@/app/components/AdSlot";
import AffiliateLink from "@/app/components/AffiliateLink";

export const metadata: Metadata = {
  title: "How to Merge PDFs on Mac — 3 Free Methods | PDF Tools",
  description: "Combine multiple PDF files on Mac for free. Use Preview, Finder Quick Actions, or browser-based tools. Step-by-step instructions.",
  keywords: "merge PDFs Mac, combine PDFs Mac, join PDFs macOS, merge PDF Preview, Mac PDF combine",
  alternates: {
    canonical: "/guides/how-to-merge-pdfs-on-mac",
  },
  openGraph: {
    title: "How to Merge PDFs on Mac — 3 Free Methods | PDF Tools",
    description: "Combine multiple PDF files on Mac for free. Use Preview, Finder Quick Actions, or browser-based tools.",
    url: "/guides/how-to-merge-pdfs-on-mac",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Merge PDFs on Mac" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Merge PDFs on Mac — 3 Free Methods | PDF Tools",
    description: "Combine multiple PDF files on Mac for free. Use Preview, Finder Quick Actions, or browser-based tools.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Merge PDFs on Mac",
  description: "Combine multiple PDF files on Mac for free using Preview, Finder Quick Actions, or browser-based tools.",
  step: [
    { "@type": "HowToStep", name: "Open the first PDF in Preview", text: "Double-click the first PDF to open it in Preview, then enable the thumbnail sidebar." },
    { "@type": "HowToStep", name: "Drag the second PDF into the sidebar", text: "Drag another PDF file from Finder into the thumbnail sidebar at the position where you want it inserted." },
    { "@type": "HowToStep", name: "Rearrange pages if needed", text: "Drag page thumbnails up or down to reorder them." },
    { "@type": "HowToStep", name: "Save the merged PDF", text: "Go to File > Export as PDF to save the combined document." },
  ],
  tool: { "@type": "HowToTool", name: "macOS Preview / PDF Tools" },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://free-pdf-editor.org" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://free-pdf-editor.org/guides" },
    { "@type": "ListItem", position: 3, name: "Merge PDFs on Mac", item: "https://free-pdf-editor.org/guides/how-to-merge-pdfs-on-mac" },
  ],
};

export default function MergePdfsMacGuide() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Navbar />
      <div className="navbar-spacer" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          <Link href="/guides" className="hover:opacity-80">Guides</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ color: "var(--text-secondary)" }}>Merge PDFs on Mac</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Merge PDFs on Mac
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Mac users have several free options for combining PDF files — no third-party software required. Whether you prefer using built-in macOS tools or a browser-based solution, here are three methods that get the job done.
        </p>

        <div className="theme-prose space-y-8">
          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 1: Using Preview (Built-in, No Downloads)</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Preview is macOS&apos;s built-in PDF and image viewer, and it has a surprisingly capable PDF merging feature hidden in its sidebar. This method works on every Mac without installing anything.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the first PDF in Preview</strong> — Double-click your first PDF file. It should open in Preview by default. If it opens in another app, right-click the file, select &ldquo;Open With,&rdquo; and choose Preview.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Show the thumbnail sidebar</strong> — If the sidebar isn&apos;t visible, go to View &gt; Thumbnails (or press Option+Command+2). You should see small page previews on the left side of the window.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Drag the second PDF into the sidebar</strong> — Open a Finder window next to Preview. Drag your second PDF file from Finder directly into the thumbnail sidebar. Drop it at the position where you want the pages inserted — at the end to append, or between existing thumbnails to insert in the middle.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Rearrange pages if needed</strong> — Once both PDFs are loaded, you can drag individual page thumbnails up or down to reorder them. You can also select multiple thumbnails (hold Command and click) to move groups of pages at once.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Save the merged PDF</strong> — Go to File &gt; Export as PDF. Give the merged document a new name and choose where to save it. Important: use &ldquo;Export as PDF&rdquo; rather than just &ldquo;Save&rdquo; — the regular Save option will overwrite your original first PDF.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              You can repeat the drag-and-drop step to add as many PDFs as you need. Preview handles the merging well for two or three files, though it can become cumbersome with larger batches.
            </p>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 2: Using PDF Tools in Safari</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              If you need to merge many files at once, reorder pages from different PDFs, or just prefer a more visual interface, our browser-based <Link href="/merge-pdf" className="theme-link hover:underline">Merge PDF</Link> tool works directly in Safari (or any Mac browser) with no downloads.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Go to the Merge PDF tool</strong> — Open Safari and navigate to <Link href="/merge-pdf" className="theme-link hover:underline">free-pdf-editor.org/merge-pdf</Link>. The tool loads instantly — there&apos;s nothing to install or sign up for.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Add your PDF files</strong> — Drag and drop all the PDFs you want to merge into the upload area. You can add them all at once or one at a time. The files load into your browser&apos;s memory and are never uploaded to any server.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Reorder the files</strong> — Drag the file cards to arrange them in the order you want. The final merged PDF will follow this sequence from top to bottom.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Click Merge</strong> — Hit the merge button and the tool combines all your PDFs into a single document. Processing happens locally on your Mac.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download the result</strong> — Your merged PDF is ready to download. The original files remain untouched.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              This method is particularly useful when you have five or more PDFs to combine, or when you need to merge files from different folders without dragging them all into Preview one by one.
            </p>
          </div>

          <AdSlot slot="guide-merge-mac-mid" format="horizontal" className="my-6 sm:my-8" />

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 3: Using Finder Quick Actions</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Starting with macOS Monterey (version 12), Finder includes a Quick Action for creating PDFs from selected files. This is the fastest method for simple merges.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Select your PDF files in Finder</strong> — Navigate to the folder containing your PDFs. Click the first file, then hold Command and click each additional file you want to include. You can also hold Shift to select a range of consecutive files.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Right-click and choose Quick Actions</strong> — Right-click (or Control-click) on the selected files. In the context menu, hover over &ldquo;Quick Actions&rdquo; and select &ldquo;Create PDF.&rdquo;</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Find your merged PDF</strong> — macOS creates a new PDF in the same folder, combining all selected files. The files are merged in the order they were sorted in Finder (typically alphabetical by filename).</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              The Quick Action method is fast but limited. You can&apos;t reorder files during the merge — they combine in Finder&apos;s sort order. If you need a specific page order, rename your files with number prefixes (01-, 02-, 03-) before merging, or use one of the other methods.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Which Method Is Best?</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Preview</strong> — Best for merging two or three files when you want to rearrange individual pages. It gives you the most control over page order and lets you remove unwanted pages during the process. However, it gets tedious with large batches.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>PDF Tools (browser)</strong> — Best for batch merging, especially when you have many files or need a clean drag-and-drop interface. Also the best choice if you want to merge PDFs on a shared or managed Mac where you can&apos;t install software. Works identically in Safari, Chrome, Firefox, or any other browser.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Finder Quick Actions</strong> — Best for quick, no-fuss combining when you don&apos;t care about page order or just need to merge files that are already in the right alphabetical order. It&apos;s the fastest method (three clicks) but offers the least control.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Troubleshooting Common Issues</h2>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>File too large after merging</strong> — Merging PDFs combines their full content, so the merged file is roughly the sum of all input file sizes. If the result is too large for email, run it through a <Link href="/compress-pdf" className="theme-link hover:underline">PDF compressor</Link> afterward to reduce the size.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Preview won&apos;t save properly</strong> — If Preview&apos;s Save option seems to only save changes to the first file, use File &gt; Export as PDF instead. This creates a brand-new file rather than modifying the original.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Page order is wrong</strong> — In Preview, drag thumbnails to rearrange. In Finder Quick Actions, rename files with number prefixes before merging. In our browser tool, drag file cards to reorder before clicking merge.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Merged PDF looks different</strong> — This usually means the source PDFs had different page sizes or orientations. The merged PDF preserves each page&apos;s original dimensions, so letter-size and A4 pages may appear in the same document. You can use a <Link href="/rotate-pdf" className="theme-link hover:underline">rotate tool</Link> to fix orientation issues after merging.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Quick Actions not showing &ldquo;Create PDF&rdquo;</strong> — This feature requires macOS Monterey (12.0) or later. If you&apos;re on an older version, use Preview or the browser-based tool instead.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Can You Merge PDFs on iPhone or iPad?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Yes. Our <Link href="/merge-pdf" className="theme-link hover:underline">Merge PDF</Link> tool works in Safari on iPhone and iPad, so you can combine PDFs on any Apple device. Just open the tool in Safari, tap to upload your files, arrange them, and merge. The process is identical to the desktop browser experience.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              On iPad, you can also use the Files app with split-screen multitasking: open Files on one side and Safari with the merge tool on the other, then drag PDFs directly from Files into the browser. On iPhone, the built-in Files app doesn&apos;t have a native merge feature, which makes the browser tool the simplest option.
            </p>
          </div>

          <AdSlot slot="guide-merge-mac-faq" format="rectangle" className="my-6 sm:my-8" />
          <AffiliateLink className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Is there a limit to how many PDFs I can merge?</h3>
                <p style={{ color: "var(--text-secondary)" }}>There&apos;s no hard limit with any of these methods. Preview handles dozens of files, though it slows down with very large documents. Our browser tool can merge as many files as your device&apos;s memory allows — typically 20&ndash;30 files or up to a few hundred megabytes total without issues.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Will merging affect the quality of my PDFs?</h3>
                <p style={{ color: "var(--text-secondary)" }}>No. Merging is a lossless operation — it combines pages from multiple files without recompressing images or altering content. The merged PDF will have exactly the same quality as the originals.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I merge PDFs that are password-protected?</h3>
                <p style={{ color: "var(--text-secondary)" }}>You&apos;ll need to unlock password-protected PDFs before merging. In Preview, you&apos;ll be prompted to enter the password when opening the file. Our browser tool also supports entering passwords for locked files during upload.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I split a merged PDF back into separate files?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes. If you need to break a PDF apart later, use our <Link href="/split-pdf" className="theme-link hover:underline">Split PDF</Link> tool to separate it into individual files by page range or into single-page documents.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/merge-pdf" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#059669", borderRadius: "8px" }}>
              Try Merge PDF Now
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
