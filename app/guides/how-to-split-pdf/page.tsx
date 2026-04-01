import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import AdSlot from "@/app/components/AdSlot";
import AffiliateLink from "@/app/components/AffiliateLink";

export const metadata: Metadata = {
  title: "How to Split a PDF — Free Online PDF Splitter | PDF Tools",
  description: "Learn how to split a PDF into individual pages or extract specific page ranges. Free, browser-based, no upload required. Step-by-step guide with tips.",
  keywords: "split PDF, extract PDF pages, PDF splitter, separate PDF pages, break up PDF",
  alternates: {
    canonical: "/guides/how-to-split-pdf",
  },
  openGraph: {
    title: "How to Split a PDF — Free Online PDF Splitter | PDF Tools",
    description: "Learn how to split a PDF into individual pages or extract specific page ranges. Free, browser-based, no upload required.",
    url: "/guides/how-to-split-pdf",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Split a PDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Split a PDF — Free Online PDF Splitter | PDF Tools",
    description: "Learn how to split a PDF into individual pages or extract specific page ranges.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Split a PDF File",
  description: "Learn how to split a PDF into individual pages or extract specific page ranges. Free, browser-based, no upload required.",
  step: [
    { "@type": "HowToStep", name: "Open the Split PDF tool", text: "Navigate to PDF Tools and select \"Split PDF\" from the tool grid." },
    { "@type": "HowToStep", name: "Upload your PDF", text: "Drag and drop your file into the upload area, or click to browse. Your file stays on your device." },
    { "@type": "HowToStep", name: "Enter page ranges", text: "Specify which pages to extract using commas for individual pages or dashes for ranges (e.g., \"1-5, 10-15\")." },
    { "@type": "HowToStep", name: "Click Split", text: "The tool processes your PDF locally and generates a new file containing only the selected pages." },
    { "@type": "HowToStep", name: "Download your result", text: "Your split PDF is ready to download immediately. The original file remains unchanged." },
  ],
  tool: { "@type": "HowToTool", name: "PDF Tools - Split PDF" },
};

export default function SplitGuide() {
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
          <span style={{ color: "var(--text-secondary)" }}>Split PDF</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Split a PDF File
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Splitting a PDF lets you extract specific pages, break a large document into smaller sections, or remove pages you don&apos;t need. Here&apos;s how to do it for free, right in your browser.
        </p>

        <div className="theme-prose space-y-8">
          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Step-by-Step Instructions</h2>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the Split PDF tool</strong> — Navigate to PDF Tools and select &ldquo;Split PDF&rdquo; from the tool grid, or click the link directly from the homepage.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Upload your PDF</strong> — Drag and drop your file into the upload area, or click to browse your files. Your file stays on your device — it is not uploaded to any server.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Enter page ranges</strong> — Specify which pages you want to extract. Use commas to separate individual pages (e.g., &ldquo;1, 3, 5&rdquo;) or dashes for ranges (e.g., &ldquo;1-5, 10-15&rdquo;).</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Click Split</strong> — The tool processes your PDF locally and generates a new file containing only the pages you selected.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download your result</strong> — Your split PDF is ready to download immediately. The original file remains unchanged.</li>
            </ol>
          </div>

          <AdSlot slot="guide-split-mid" format="horizontal" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Common Use Cases</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Extracting a chapter from a textbook.</strong> If you have a 300-page PDF textbook and only need Chapter 5 (pages 87–112), splitting lets you create a lightweight file with just those pages. This is especially useful for students who want to print or annotate specific sections without dealing with the entire document.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Separating a contract for individual signatures.</strong> Legal documents often contain multiple sections that need to go to different parties. Splitting the PDF lets you send only the relevant pages to each signer, keeping sensitive information compartmentalized.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Removing cover pages and appendices.</strong> When sharing a report, you might want to strip the title page, table of contents, or appendices that aren&apos;t relevant to the recipient. Splitting gives you a clean, focused document.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Meeting email attachment limits.</strong> Many email providers cap attachments at 25 MB. If your PDF exceeds that, splitting it into smaller sections lets you send it across multiple emails without needing file compression.</p>
            </div>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Tips for Better Results</h2>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li>Use the page range syntax &ldquo;1-3, 7, 10-12&rdquo; to grab non-consecutive pages in a single operation.</li>
              <li>If you&apos;re unsure which pages you need, open the PDF in your browser&apos;s built-in viewer first to identify page numbers.</li>
              <li>For very large PDFs (100+ pages), splitting is faster than trying to delete individual pages one by one.</li>
              <li>The split operation preserves all formatting, fonts, images, and links from the original document.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Common Splitting Scenarios</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Extracting chapters from textbooks.</strong> Digital textbooks often come as a single PDF with hundreds of pages. If you only need to study Chapter 7 for an exam, splitting out pages 145–172 gives you a focused, lightweight file you can annotate on a tablet or print without wasting paper on the entire book. This is especially useful for students who share study materials — sending a 2 MB chapter is far more practical than a 150 MB textbook.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Separating individual invoices from a batch.</strong> Accounting software often exports a month&apos;s worth of invoices as a single PDF — one invoice per page or per few pages. If you need to send a specific invoice to a client, or attach one to an expense report, splitting lets you extract just that invoice. This is a daily workflow for bookkeepers and accounts payable teams who process dozens of invoices at a time.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Pulling specific forms from a packet.</strong> Government agencies, insurance companies, and HR departments frequently distribute form packets as multi-page PDFs. You might receive a 20-page benefits enrollment packet but only need to fill out pages 3–5. Splitting extracts exactly the forms you need, making it easier to print, fill out, and return just the relevant pages.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Splitting a large scan into individual documents.</strong> If you batch-scanned a stack of mixed documents — receipts, letters, certificates — into one file, splitting lets you separate them back into individual documents. Identify the page ranges for each document, split them out, and rename them appropriately. This turns a chaotic scan into an organized digital filing system.</p>
            </div>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Split vs Extract vs Delete — Which Tool?</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p>PDF Tools offers three different ways to work with pages, and choosing the right one depends on what you&apos;re trying to accomplish:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong style={{ color: "var(--text-primary)" }}>Split PDF</strong> — Best when you want to break a document into sections at specific page ranges. You define where to cut, and you get a new file containing only those pages. Use this when you know exactly which pages you want to keep.</li>
                <li><strong style={{ color: "var(--text-primary)" }}>Extract PDF Pages</strong> — Best when you want to pick specific individual pages from throughout a document and combine them into one new file. Use the <Link href="/extract-pdf-pages" className="theme-link hover:underline">Extract Pages</Link> tool when you need pages 2, 7, and 15 from a 30-page document.</li>
                <li><strong style={{ color: "var(--text-primary)" }}>Delete PDF Pages</strong> — Best when you want to keep most of a document but remove a few unwanted pages. Instead of specifying what to keep, you specify what to remove. Use the <Link href="/delete-pdf-pages" className="theme-link hover:underline">Delete Pages</Link> tool when you want everything except pages 1 and 8. You can also read our guide on <Link href="/guides/how-to-remove-pages-from-pdf" className="theme-link hover:underline">how to remove pages from a PDF</Link> for more details.</li>
              </ul>
              <p>All three tools process files locally in your browser and preserve the original formatting of every page they keep.</p>
            </div>
          </div>

          <AdSlot slot="guide-split-faq" format="rectangle" className="my-6 sm:my-8" />
          <AffiliateLink className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Does splitting a PDF reduce file size?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes. When you extract a subset of pages, the resulting file only contains the data for those pages — images, fonts, and other embedded resources that only appear on removed pages are excluded. The file size reduction is proportional to how many pages you remove.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I split a password-protected PDF?</h3>
                <p style={{ color: "var(--text-secondary)" }}>If the PDF has an owner password (restricting editing), most browser-based tools can still process it. However, if the PDF requires a user password to open, you&apos;ll need to enter that password first before splitting.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Is my file uploaded to a server?</h3>
                <p style={{ color: "var(--text-secondary)" }}>No. PDF Tools processes everything locally in your browser using JavaScript. Your file never leaves your device, making it safe for sensitive documents like financial records, medical files, or legal contracts.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#6366f1", borderRadius: "8px" }}>
              Try Split PDF Now
            </Link>
            <Link href="/guides" className="text-sm theme-link hover:underline">
              View all guides
            </Link>
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
