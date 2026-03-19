import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions | PDF Tools",
  description: "Answers to common questions about PDF Tools. Learn about privacy, file processing, supported formats, browser compatibility, and more.",
  keywords: "PDF tools FAQ, PDF questions, browser PDF processing, PDF privacy, PDF file formats",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ — Frequently Asked Questions | PDF Tools",
    description: "Answers to common questions about PDF Tools. Learn about privacy, file processing, supported formats, and more.",
    url: "/faq",
    siteName: "PDF Tools",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PDF Tools — FAQ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Frequently Asked Questions | PDF Tools",
    description: "Answers to common questions about PDF Tools. Privacy, formats, compatibility, and more.",
    images: ["/og-image.png"],
  },
};

const faqs = [
  {
    q: "Are my files uploaded to a server?",
    a: "No. All processing happens locally in your web browser using JavaScript. Your files never leave your device. There is no server receiving, storing, or processing your documents. This is fundamentally different from most online PDF tools, which require uploading files to remote servers for processing.",
  },
  {
    q: "Is PDF Tools really free?",
    a: "Yes, completely free with no hidden costs. There are no premium tiers, no file limits, no watermarks on output files, and no account registration required. The site is supported by advertising, which allows us to keep all tools free for everyone.",
  },
  {
    q: "What browsers are supported?",
    a: "PDF Tools works in all modern browsers: Google Chrome, Mozilla Firefox, Safari, Microsoft Edge, and Brave. We recommend using the latest version of your preferred browser for the best performance. Internet Explorer is not supported.",
  },
  {
    q: "Is there a file size limit?",
    a: "There's no artificial file size limit imposed by the tool. Since processing happens in your browser, the practical limit depends on your device's available RAM. Most modern computers can handle PDFs up to 100–200 MB comfortably. Very large files (500+ MB) may work but could cause slower processing on devices with limited memory.",
  },
  {
    q: "Do the tools work offline?",
    a: "Once the page has loaded, most tools work without an active internet connection. The JavaScript code runs entirely in your browser, so you can disconnect from the internet after loading the site and still process PDFs. However, you'll need to be online to initially load the page.",
  },
  {
    q: "What happens to my files after processing?",
    a: "Your files exist only in your browser's memory during processing. Once you close the tab or navigate away, all data is cleared. There is no server-side storage, no temporary files saved anywhere outside your device, and no way for us to access your documents. Your processed files are available only through the download button on screen.",
  },
  {
    q: "Can I process password-protected PDFs?",
    a: "It depends on the type of protection. PDFs with an 'owner password' (which restricts editing and printing) can usually be processed by browser-based tools. PDFs with a 'user password' (required to open the file) need that password entered first. We don't have a password removal tool — if you've forgotten a password, you'll need specialized software.",
  },
  {
    q: "What PDF format versions are supported?",
    a: "PDF Tools supports PDF versions 1.0 through 2.0, which covers virtually all PDF files in circulation. This includes PDFs created by Adobe Acrobat, Microsoft Office, Google Docs, macOS Preview, LibreOffice, and any other standard PDF-generating software.",
  },
  {
    q: "Why do some conversion tools produce imperfect results?",
    a: "PDF and other document formats (Word, Excel, PowerPoint) store information in fundamentally different ways. PDFs describe exact visual positioning of every element on a page, while Word documents store flowing text with formatting instructions. Converting between these paradigms requires reverse-engineering the layout, which works well for simple documents but may need manual cleanup for complex layouts with multiple columns, text boxes, or intricate tables.",
  },
  {
    q: "Can I use PDF Tools on my phone or tablet?",
    a: "Yes. PDF Tools is fully responsive and works on mobile browsers including Chrome for Android, Safari for iOS, and Firefox Mobile. The touch interface supports drag-and-drop file selection, and all tools function identically to the desktop version. Processing speed depends on your device's capabilities.",
  },
  {
    q: "How does the Compress tool reduce file size?",
    a: "PDF compression works by optimizing embedded images (resampling to lower resolution and applying more efficient encoding), removing redundant metadata and hidden objects, and streamlining the PDF's internal structure. Text is never altered — it stays crisp at any compression level. The biggest savings come from image-heavy documents like scanned pages.",
  },
  {
    q: "Is it safe to use PDF Tools for sensitive documents?",
    a: "Yes. Because all processing happens locally in your browser, sensitive documents like financial records, medical files, legal contracts, and personal identification documents are never transmitted over the internet. This makes browser-based processing inherently more secure than cloud-based alternatives for confidential files.",
  },
  {
    q: "Can I merge PDFs with different page sizes?",
    a: "Yes. When merging PDFs, each page retains its original dimensions. If one PDF uses Letter size (8.5 × 11 inches) and another uses A4 (210 × 297 mm), the merged document will contain pages of both sizes. PDF viewers handle mixed page sizes seamlessly.",
  },
  {
    q: "What image formats are supported for Image to PDF conversion?",
    a: "The Image to PDF tool accepts JPEG, PNG, GIF, BMP, WebP, and TIFF images. You can combine multiple images of different formats into a single PDF. Each image becomes one page in the resulting document, maintaining the original image's aspect ratio.",
  },
  {
    q: "Do you collect any personal data?",
    a: "We don't collect personal data through the PDF tools themselves — no files, no content, no usage data about your documents. The site uses standard web analytics to understand overall traffic patterns (page views, not individual behavior). See our Privacy Policy for complete details.",
  },
  {
    q: "How is this different from Adobe Acrobat or Smallpdf?",
    a: "The key difference is privacy and cost. Adobe Acrobat requires a paid subscription ($12.99–$22.99/month) and desktop installation. Smallpdf and similar online tools upload your files to their servers for processing, which creates privacy concerns for sensitive documents. PDF Tools processes everything locally in your browser — no uploads, no subscriptions, no software to install.",
  },
  {
    q: "Can I batch-process multiple files?",
    a: "The Merge tool accepts multiple files simultaneously. For other tools (split, compress, rotate, etc.), you process one file at a time. We're working on adding batch processing for more tools in future updates.",
  },
  {
    q: "What technology powers PDF Tools?",
    a: "PDF Tools is built with Next.js and React for the interface, and uses pdf-lib (a JavaScript library) for PDF manipulation. Image processing uses the browser's native Canvas API. All code runs client-side in your browser — the web server only delivers the application code, never touches your files.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function FAQ() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <header className="theme-header sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80">
            <Image src="/logo.svg" alt="PDF Tools" width={36} height={36} className="w-8 h-8 sm:w-9 sm:h-9" />
            <span className="font-bold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>PDF Tools</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Tools
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight"
          style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Frequently Asked Questions
        </h1>
        <p className="text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
          Everything you need to know about using PDF Tools.
        </p>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="theme-section p-5 sm:p-6">
              <h2 className="font-semibold text-base sm:text-lg mb-2" style={{ color: "var(--text-primary)" }}>
                {faq.q}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Ready to get started?
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white" style={{ backgroundColor: "var(--accent-primary)", borderRadius: "8px" }}>
            Try PDF Tools — It&apos;s Free
          </Link>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid var(--border-primary)" }} className="mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            <span>All processing happens locally in your browser.</span>
            <div className="flex items-center gap-4">
              <Link href="/guides" className="hover:opacity-80 transition-opacity">Guides</Link>
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
