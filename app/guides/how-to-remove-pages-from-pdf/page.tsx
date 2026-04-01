import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import AdSlot from "@/app/components/AdSlot";
import AffiliateLink from "@/app/components/AffiliateLink";

export const metadata: Metadata = {
  title: "How to Remove Pages from a PDF for Free | PDF Tools",
  description: "Delete unwanted pages from any PDF file for free. Learn multiple methods to remove, extract, or reorganize PDF pages in your browser.",
  keywords: "remove pages from PDF, delete PDF pages, remove page from PDF free, delete pages PDF online",
  alternates: {
    canonical: "/guides/how-to-remove-pages-from-pdf",
  },
  openGraph: {
    title: "How to Remove Pages from a PDF for Free | PDF Tools",
    description: "Delete unwanted pages from any PDF file for free. Learn multiple methods to remove, extract, or reorganize PDF pages in your browser.",
    url: "/guides/how-to-remove-pages-from-pdf",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Remove Pages from a PDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Remove Pages from a PDF for Free | PDF Tools",
    description: "Delete unwanted pages from any PDF file for free. Learn multiple methods to remove, extract, or reorganize PDF pages.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Remove Pages from a PDF",
  description: "Delete unwanted pages from any PDF file for free using browser-based tools.",
  step: [
    { "@type": "HowToStep", name: "Open the Delete PDF Pages tool", text: "Navigate to the Delete PDF Pages tool from the homepage." },
    { "@type": "HowToStep", name: "Upload your PDF", text: "Drag and drop your PDF or click to browse. The file loads in your browser." },
    { "@type": "HowToStep", name: "Select pages to remove", text: "Click on the pages you want to delete. Selected pages are highlighted for removal." },
    { "@type": "HowToStep", name: "Click Delete", text: "The tool removes the selected pages and creates a new PDF with the remaining pages." },
    { "@type": "HowToStep", name: "Download the result", text: "Download your cleaned-up PDF with the unwanted pages removed." },
  ],
  tool: { "@type": "HowToTool", name: "PDF Tools - Delete PDF Pages" },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://free-pdf-editor.org" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://free-pdf-editor.org/guides" },
    { "@type": "ListItem", position: 3, name: "Remove Pages from PDF", item: "https://free-pdf-editor.org/guides/how-to-remove-pages-from-pdf" },
  ],
};

export default function RemovePagesGuide() {
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
          <span style={{ color: "var(--text-secondary)" }}>Remove Pages from PDF</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Remove Pages from a PDF
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Sometimes a PDF has pages you don&apos;t need — blank pages, cover sheets, appendices, or sections that shouldn&apos;t be shared. Here&apos;s how to remove them for free using three different approaches, depending on what you need.
        </p>

        <div className="theme-prose space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Why Remove Pages from a PDF?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              PDFs are designed to be a final, portable format — but that doesn&apos;t mean every page in a PDF belongs there. There are plenty of reasons you might want to trim a document down before sharing or archiving it:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Blank pages</strong> — Scanning and printing processes often introduce blank pages, especially when printing double-sided documents. These add file size and look unprofessional when sharing digitally.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Cover pages and title sheets</strong> — When forwarding a report or proposal, you may want to remove the original cover page and replace it, or simply send the content without the decorative front matter.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Unwanted sections</strong> — A 50-page manual might only have 5 pages relevant to your recipient. Rather than sending the entire document with a note that says &ldquo;see pages 12&ndash;16,&rdquo; you can extract just those pages.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Confidential pages before sharing</strong> — Before sending a document externally, you might need to remove pages containing internal pricing, personal information, or sensitive notes that weren&apos;t meant for outside eyes.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Reducing file size</strong> — Removing unnecessary pages (especially image-heavy ones) can significantly reduce the overall file size, making the PDF easier to email or upload.</li>
            </ul>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 1: Delete Specific Pages</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              This is the most straightforward approach: select the pages you want to remove, and the tool creates a new PDF with everything else. Use our <Link href="/delete-pdf-pages" className="theme-link hover:underline">Delete PDF Pages</Link> tool when you know exactly which pages to get rid of.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the Delete PDF Pages tool</strong> — Go to <Link href="/delete-pdf-pages" className="theme-link hover:underline">Delete PDF Pages</Link> from the homepage. It&apos;s in the &ldquo;Organize&rdquo; category.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Upload your PDF</strong> — Drag and drop your file or click to browse. The PDF loads into your browser and displays thumbnail previews of every page so you can see exactly what you&apos;re working with.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Select pages to delete</strong> — Click on the pages you want to remove. Selected pages are visually highlighted so you can confirm your choices before proceeding. Click a selected page again to deselect it.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Click Delete</strong> — The tool removes the selected pages and generates a new PDF containing only the pages you kept. The original file is not modified.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download the result</strong> — Download your trimmed PDF. Compare the page count to confirm the right pages were removed.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              This method is ideal when you have a document with a few specific pages to remove — blank pages scattered throughout, an unnecessary appendix at the end, or a cover page you don&apos;t need.
            </p>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 2: Extract Only the Pages You Want</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Sometimes it&apos;s easier to think about which pages to keep rather than which to remove. The <Link href="/extract-pdf-pages" className="theme-link hover:underline">Extract PDF Pages</Link> tool lets you pick the pages you want and creates a new PDF with just those pages.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the Extract PDF Pages tool</strong> — Navigate to <Link href="/extract-pdf-pages" className="theme-link hover:underline">Extract PDF Pages</Link>. This tool works in reverse compared to Delete — you select what to keep, not what to remove.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Upload your PDF</strong> — Drop in your file. Page thumbnails load so you can identify which pages you need.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Select pages to extract</strong> — Click on each page you want to keep. If you need pages 3, 7, and 12&ndash;15 from a 30-page document, this is much faster than deleting the other 25 pages one by one.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Click Extract</strong> — A new PDF is created containing only your selected pages in the order you chose them.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download the extracted PDF</strong> — Save your new document. It contains only the pages you selected, in a clean, compact file.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              Extraction is the better choice when you need a small subset of pages from a large document. Instead of clicking 45 pages to delete in a 50-page PDF, just click the 5 pages you want to keep.
            </p>
          </div>

          <AdSlot slot="guide-remove-pages-mid" format="horizontal" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 3: Split and Reassemble</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              For complex reorganizations where you need to remove pages from the middle of a document and potentially rearrange what&apos;s left, the split-and-merge approach gives you the most flexibility.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Split the PDF</strong> — Use the <Link href="/split-pdf" className="theme-link hover:underline">Split PDF</Link> tool to break your document into sections. For example, if you want to remove pages 10&ndash;15 from a 30-page document, split at page 9 and page 16 to get three sections: pages 1&ndash;9, pages 10&ndash;15, and pages 16&ndash;30.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Discard the unwanted section</strong> — Simply don&apos;t include pages 10&ndash;15 in the next step.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Merge the remaining sections</strong> — Use the <Link href="/merge-pdf" className="theme-link hover:underline">Merge PDF</Link> tool to combine the sections you kept (pages 1&ndash;9 and 16&ndash;30) into a single document.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              This method takes more steps, but it&apos;s powerful for situations where you need to remove large sections from the middle of a document, rearrange the remaining sections in a different order, or combine parts of multiple PDFs into one new document. Think of it as cutting a document into pieces and reassembling only the parts you want.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Delete vs Extract vs Split: Which Tool?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Each approach solves the same core problem — getting rid of unwanted pages — but they work differently depending on the situation:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ color: "var(--text-secondary)" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-primary)" }}>
                    <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--text-primary)" }}>Approach</th>
                    <th className="text-left py-2 pr-4 font-semibold" style={{ color: "var(--text-primary)" }}>Best When</th>
                    <th className="text-left py-2 font-semibold" style={{ color: "var(--text-primary)" }}>You Select</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <td className="py-2 pr-4"><strong style={{ color: "var(--text-primary)" }}>Delete pages</strong></td>
                    <td className="py-2 pr-4">Removing a few specific pages (blank pages, cover sheet, last page)</td>
                    <td className="py-2">Pages to remove</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-primary)" }}>
                    <td className="py-2 pr-4"><strong style={{ color: "var(--text-primary)" }}>Extract pages</strong></td>
                    <td className="py-2 pr-4">Keeping a small subset from a large document</td>
                    <td className="py-2">Pages to keep</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><strong style={{ color: "var(--text-primary)" }}>Split + merge</strong></td>
                    <td className="py-2 pr-4">Removing large sections or rearranging remaining parts</td>
                    <td className="py-2">Split points, then which sections to merge</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ color: "var(--text-secondary)" }}>
              A quick rule of thumb: if you&apos;re removing fewer pages than you&apos;re keeping, use Delete. If you&apos;re keeping fewer pages than you&apos;re removing, use Extract. If you need to reorganize the remaining pages into a different order, use Split and Merge.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Removing Pages on Different Platforms</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Windows.</strong> Windows doesn&apos;t include a built-in tool for removing PDF pages. The default PDF viewer (Microsoft Edge) can display and annotate PDFs but can&apos;t delete pages. Your best option is using our browser-based tools — they work identically in Chrome, Edge, Firefox, or any other Windows browser.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Mac.</strong> macOS Preview has built-in page deletion: open the PDF, show the thumbnail sidebar (View &gt; Thumbnails), select the pages you want to remove, and press the Delete key. Then use File &gt; Export as PDF to save. This works well for quick edits but lacks the visual interface and batch capabilities of a dedicated tool.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>iPhone and iPad.</strong> iOS doesn&apos;t have a native way to delete PDF pages. Open our <Link href="/delete-pdf-pages" className="theme-link hover:underline">Delete PDF Pages</Link> tool in Safari — it works the same way as on desktop. Tap thumbnails to select pages for removal, then download the result.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Android.</strong> Like iOS, Android has no built-in PDF page editor. Google Drive can view PDFs but not remove pages. Our browser tools work in Chrome on Android, giving you the same functionality as the desktop version.</p>
            </div>
          </div>

          <AdSlot slot="guide-remove-pages-faq" format="rectangle" className="my-6 sm:my-8" />
          <AffiliateLink className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Will removing pages affect the remaining content?</h3>
                <p style={{ color: "var(--text-secondary)" }}>No. Page deletion is a clean operation — it removes the selected pages entirely and leaves all other pages exactly as they were. Text, images, formatting, links, and bookmarks on the remaining pages are not affected.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I undo page deletion after downloading?</h3>
                <p style={{ color: "var(--text-secondary)" }}>The tool creates a new PDF — your original file is never modified. If you make a mistake, simply go back to the original and try again. This is why we always recommend keeping your original PDF until you&apos;ve verified the edited version is correct.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Does the page numbering update automatically?</h3>
                <p style={{ color: "var(--text-secondary)" }}>The PDF&apos;s internal page count updates (a 20-page PDF with 3 pages removed becomes 17 pages). However, if the original document had printed page numbers in headers or footers, those numbers won&apos;t change because they&apos;re part of the page content. To fix this, you can <Link href="/add-page-numbers-to-pdf" className="theme-link hover:underline">add new page numbers</Link> to the edited PDF.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Is there a page limit for the tool?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Since all processing happens in your browser, the limit depends on your device&apos;s available memory. Most devices handle PDFs with hundreds of pages without any issues. Very large documents (1,000+ pages) may process more slowly on mobile devices.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/delete-pdf-pages" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#059669", borderRadius: "8px" }}>
              Try Delete PDF Pages Now
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
