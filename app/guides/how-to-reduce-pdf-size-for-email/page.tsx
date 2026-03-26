import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import AdSlot from "@/app/components/AdSlot";

export const metadata: Metadata = {
  title: "How to Reduce PDF File Size for Email — Free & Easy | PDF Tools",
  description: "PDF too large to email? Learn 4 free methods to reduce PDF file size for Gmail, Outlook, and other email providers. No uploads required.",
  keywords: "reduce PDF size, PDF too large for email, compress PDF for email, shrink PDF, make PDF smaller for email",
  alternates: {
    canonical: "/guides/how-to-reduce-pdf-size-for-email",
  },
  openGraph: {
    title: "How to Reduce PDF File Size for Email — Free & Easy | PDF Tools",
    description: "PDF too large to email? Learn 4 free methods to reduce PDF file size for Gmail, Outlook, and other email providers.",
    url: "/guides/how-to-reduce-pdf-size-for-email",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Reduce PDF File Size for Email" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Reduce PDF File Size for Email — Free & Easy | PDF Tools",
    description: "PDF too large to email? Learn 4 free methods to reduce PDF file size for Gmail, Outlook, and other email providers.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Reduce PDF File Size for Email",
  description: "PDF too large to email? Learn 4 free methods to reduce PDF file size for Gmail, Outlook, and other email providers. No uploads required.",
  step: [
    { "@type": "HowToStep", name: "Try compressing the PDF", text: "Use the Compress PDF tool to reduce file size by optimizing images and removing metadata. Choose light, medium, or heavy compression." },
    { "@type": "HowToStep", name: "Split into smaller files", text: "If compression isn't enough, split the PDF into multiple smaller files and send them as separate email attachments." },
    { "@type": "HowToStep", name: "Remove unnecessary pages", text: "Delete pages you don't need to send, such as cover pages, blank pages, or appendices." },
    { "@type": "HowToStep", name: "Extract only what you need", text: "Pick specific pages from the PDF and extract them into a new, smaller file." },
  ],
  tool: { "@type": "HowToTool", name: "PDF Tools - Compress PDF" },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://free-pdf-editor.org/" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://free-pdf-editor.org/guides" },
    { "@type": "ListItem", position: 3, name: "How to Reduce PDF Size for Email" },
  ],
};

export default function ReducePdfSizeGuide() {
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
          <Link href="/" className="hover:opacity-80">Home</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <Link href="/guides" className="hover:opacity-80">Guides</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          <span style={{ color: "var(--text-secondary)" }}>How to Reduce PDF Size for Email</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Reduce PDF File Size for Email
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          You&apos;ve finished your document, attached it to an email, and hit send &mdash; only to get a bounce-back message saying the file is too large. It&apos;s one of the most common frustrations with PDFs. The good news: there are four free methods to shrink your PDF below any email provider&apos;s limit, and none of them require uploading your file to a server.
        </p>

        <div className="theme-prose space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Why Are PDFs Too Large for Email?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Not all PDFs are created equal when it comes to file size. A simple text document might be only 50 KB, while a scanned contract could easily exceed 50 MB. Understanding what makes PDFs large helps you pick the right shrinking strategy.
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Scanned documents.</strong> When you scan a paper document, each page becomes a full-page photograph stored inside the PDF. A single scanned page at 300 DPI is typically 2&ndash;5 MB, so a 20-page scanned document can easily reach 40&ndash;100 MB. This is by far the most common reason PDFs are too large for email.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Embedded high-resolution images.</strong> Reports, brochures, and presentations often include photographs or graphics. If these images were inserted at their original resolution (e.g., a 12-megapixel photo from a smartphone), each one adds several megabytes to the file even though the PDF only displays them at a fraction of their full resolution.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Embedded fonts.</strong> PDFs embed the fonts they use to ensure consistent display. While a single font adds only 50&ndash;200 KB, documents using many different fonts (or full Unicode font sets for multilingual content) can accumulate significant overhead.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Redundant data and metadata.</strong> PDFs edited multiple times may carry layers of revision history, duplicate objects, form field data, JavaScript, and other hidden content. This &ldquo;bloat&rdquo; can add up, especially in documents that have passed through several editing tools.</li>
            </ul>
            <p style={{ color: "var(--text-secondary)" }}>
              The key takeaway: <strong style={{ color: "var(--text-primary)" }}>images are almost always the reason a PDF is too large</strong>. That&apos;s why compression &mdash; which primarily targets images &mdash; is usually the most effective solution.
            </p>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Email Attachment Size Limits</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Before you start shrinking your PDF, it helps to know the target. Here are the attachment limits for major email providers:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Gmail:</strong> 25 MB per email (attachments larger than this are automatically uploaded to Google Drive and shared as a link)</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Outlook / Hotmail:</strong> 20 MB per email</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Yahoo Mail:</strong> 25 MB per email</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Apple Mail (iCloud):</strong> 20 MB per email (Mail Drop handles larger files via iCloud)</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Corporate / enterprise email:</strong> Often 10 MB or even 5 MB. IT departments frequently set lower limits to manage server storage and bandwidth.</li>
            </ul>
            <p style={{ color: "var(--text-secondary)" }}>
              Keep in mind that email encoding adds roughly 33% overhead to attachments (due to Base64 encoding). So a 20 MB limit effectively means your file should be around 15 MB or smaller to send reliably. When in doubt, aim for under 10 MB &mdash; that&apos;s safe for virtually any email system.
            </p>
          </div>

          <AdSlot slot="guide-reduce-email-mid" format="horizontal" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 1: Compress the PDF</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              This is the fastest and most effective method for most people. Compression reduces file size by optimizing images and removing unnecessary data &mdash; without deleting any pages or content.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the <Link href="/compress-pdf" className="theme-link hover:underline">Compress PDF</Link> tool.</strong> It loads directly in your browser &mdash; no download needed.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Drag and drop your PDF into the tool.</strong> The file is loaded into your browser&apos;s memory. It is not uploaded to any server.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Choose a compression level.</strong> Start with <em>light compression</em> &mdash; it typically reduces file size by 20&ndash;40% with no visible quality loss. If the result is still too large, try medium (40&ndash;60% reduction) or heavy (60&ndash;80% reduction). Heavy compression may show visible quality loss in photographs but keeps text perfectly sharp.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Click Compress and check the result.</strong> The tool shows you the original size and compressed size side by side. If the compressed file is small enough for your email limit, download it and you&apos;re done.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>When to use this method:</strong> Always try compression first. It works on any PDF and doesn&apos;t remove content. For image-heavy and scanned PDFs, compression alone often achieves a 50&ndash;70% size reduction, which is enough to bring most documents under the 25 MB email limit.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 2: Split Into Smaller Files</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              If your PDF is still too large after compression (common with very long documents or large scan batches), split it into multiple smaller files and send each as a separate email attachment.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the <Link href="/split-pdf" className="theme-link hover:underline">Split PDF</Link> tool.</strong></li>
              <li><strong style={{ color: "var(--text-primary)" }}>Load your PDF and choose split points.</strong> You can split by page range (e.g., pages 1&ndash;10 in one file, 11&ndash;20 in another) or split every N pages (e.g., every 5 pages becomes its own file).</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download the resulting files.</strong> Each split segment will be smaller than the original. Attach them to separate emails or include multiple smaller attachments in one email.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>When to use this method:</strong> Best for large documents where the recipient needs the complete content but your email provider won&apos;t accept the full file. A 60-page scanned report could be split into three 20-page files, each well under the limit. Just mention in your email that the document is split across multiple attachments.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 3: Remove Unnecessary Pages</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Sometimes you don&apos;t need to send the entire document. Removing pages you don&apos;t need reduces file size proportionally.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the <Link href="/delete-pdf-pages" className="theme-link hover:underline">Delete PDF Pages</Link> tool.</strong></li>
              <li><strong style={{ color: "var(--text-primary)" }}>Load your PDF and review the page thumbnails.</strong> Identify pages that the recipient doesn&apos;t need &mdash; cover pages, table of contents, blank separator pages, appendices, or sections that aren&apos;t relevant.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Select the pages to delete and download the trimmed document.</strong> Removing half the pages roughly halves the file size.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>When to use this method:</strong> When you&apos;re sending a subset of a larger document. For example, if you have a 100-page manual but the recipient only needs chapter 3, delete everything else before sending.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 4: Extract Only What You Need</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Rather than deleting pages from the original, you can extract specific pages into a brand-new file. This achieves the same result as deleting but leaves your original untouched.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the <Link href="/extract-pdf-pages" className="theme-link hover:underline">Extract PDF Pages</Link> tool.</strong></li>
              <li><strong style={{ color: "var(--text-primary)" }}>Load your PDF and select the pages you want to send.</strong> Click individual pages or enter a range (e.g., 5&ndash;12).</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download the extracted pages as a new PDF.</strong> This new file contains only the pages you selected, keeping the file size to a minimum.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>When to use this method:</strong> When you need specific pages from a large PDF and want to keep the original file intact. Great for pulling out a specific invoice from a batch, a particular form from a packet, or a few key pages from a report.
            </p>
          </div>

          <AdSlot slot="guide-reduce-email-tips" format="rectangle" className="my-6 sm:my-8" />

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Tips for Keeping PDFs Small</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Prevention is better than cure. If you frequently create PDFs that end up too large, these habits will keep file sizes manageable from the start:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Use digital-native PDFs over scans whenever possible.</strong> A PDF created by &ldquo;saving as PDF&rdquo; from Word or Excel is dramatically smaller than one created by scanning a printed version of the same document. Digital PDFs store text as text (a few kilobytes per page); scans store text as images (several megabytes per page). If you have access to the original digital file, always create the PDF from that rather than scanning a printout.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Reduce image resolution before inserting into documents.</strong> Before adding photos to a Word document or presentation that will become a PDF, resize them to the resolution you actually need. A photo embedded in a report rarely needs to be more than 1200 pixels wide. Resizing a 4000x3000 image to 1200x900 before insertion can reduce the final PDF size by 80% or more.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Limit the number of fonts.</strong> Each font embedded in a PDF adds to the file size. Stick to one or two font families (e.g., one serif and one sans-serif) to keep the PDF lean. Avoid decorative fonts that have large character sets.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Use &ldquo;Save as PDF&rdquo; rather than &ldquo;Print to PDF&rdquo; when possible.</strong> The &ldquo;Save as PDF&rdquo; option in most office software produces smaller, more optimized files than the generic &ldquo;Print to PDF&rdquo; driver, because it can pass text and vector data through directly instead of rasterizing everything.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Flatten forms and annotations before sharing.</strong> If your PDF contains fillable form fields, annotations, or comments, flattening them (converting them to static content) can reduce file size by removing the interactive overhead.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>How much can I reduce a PDF&apos;s file size?</h3>
                <p style={{ color: "var(--text-secondary)" }}>It depends on the content. Scanned documents and image-heavy PDFs often compress by 50&ndash;80%, bringing a 30 MB file down to 6&ndash;15 MB. Text-heavy PDFs with few images may only compress by 10&ndash;20%, since text data is already compact. The compression tool shows you the before and after sizes so you can judge the results immediately.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Will the recipient be able to tell the PDF was compressed?</h3>
                <p style={{ color: "var(--text-secondary)" }}>With light compression, almost certainly not. Text remains perfectly sharp at all compression levels. Photographs may show slight quality reduction at medium and heavy compression, but for business documents, reports, and forms, the difference is rarely noticeable. Heavy compression is visible in photos but still fine for text-based documents.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>What if my PDF is still too large after all four methods?</h3>
                <p style={{ color: "var(--text-secondary)" }}>If compression, splitting, and page removal still leave you over the limit, consider sharing via a cloud storage link instead. Upload the PDF to Google Drive, Dropbox, or OneDrive and share a download link in your email. Most email providers even do this automatically when an attachment exceeds the limit. Alternatively, consider whether the content could be delivered in a more compact format, like a shared Google Doc link.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Is my PDF safe during compression?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes. Our <Link href="/compress-pdf" className="theme-link hover:underline">Compress PDF</Link> tool processes everything in your browser. The file never leaves your device and is never uploaded to a server. Your original file also remains unchanged &mdash; compression creates a new, smaller copy that you download separately.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/compress-pdf" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#059669", borderRadius: "8px" }}>
              Compress Your PDF Now
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
