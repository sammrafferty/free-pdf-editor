import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import AdSlot from "@/app/components/AdSlot";

export const metadata: Metadata = {
  title: "How to Add Watermarks to a PDF for Free | PDF Tools",
  description: "Add text watermarks to any PDF for free. Learn when and how to use watermarks for drafts, confidential documents, and branding.",
  keywords: "add watermark to PDF, PDF watermark, watermark PDF free, text watermark PDF, stamp PDF",
  alternates: {
    canonical: "/guides/how-to-add-watermark-to-pdf",
  },
  openGraph: {
    title: "How to Add Watermarks to a PDF for Free | PDF Tools",
    description: "Add text watermarks to any PDF for free. Learn when and how to use watermarks for drafts, confidential documents, and branding.",
    url: "/guides/how-to-add-watermark-to-pdf",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Add Watermarks to a PDF" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Add Watermarks to a PDF for Free | PDF Tools",
    description: "Add text watermarks to any PDF for free. Learn when and how to use watermarks for drafts, confidential documents, and branding.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Add Watermarks to a PDF",
  description: "Add text watermarks to any PDF for free. Learn when and how to use watermarks for drafts, confidential documents, and branding.",
  step: [
    { "@type": "HowToStep", name: "Open the Add Watermark tool", text: "Navigate to the Add Watermark to PDF tool from the homepage or tools menu." },
    { "@type": "HowToStep", name: "Upload your PDF", text: "Drag and drop your PDF file or click to browse. The file loads directly into your browser." },
    { "@type": "HowToStep", name: "Enter your watermark text", text: "Type the text you want to appear as a watermark, such as DRAFT, CONFIDENTIAL, or your company name." },
    { "@type": "HowToStep", name: "Adjust watermark settings", text: "Set the opacity, rotation angle, font size, and color to match your needs." },
    { "@type": "HowToStep", name: "Apply and download", text: "Click Apply to stamp the watermark across all pages, then download your watermarked PDF." },
  ],
  tool: { "@type": "HowToTool", name: "PDF Tools - Add Watermark to PDF" },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://free-pdf-editor.org" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://free-pdf-editor.org/guides" },
    { "@type": "ListItem", position: 3, name: "Add Watermarks to PDF", item: "https://free-pdf-editor.org/guides/how-to-add-watermark-to-pdf" },
  ],
};

export default function WatermarkGuide() {
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
          <span style={{ color: "var(--text-secondary)" }}>Add Watermarks to PDF</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Add Watermarks to a PDF
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Watermarks are a simple way to mark PDF documents as drafts, label them confidential, or add branding before sharing. Here&apos;s everything you need to know about adding text watermarks to PDFs — including how to do it for free in your browser.
        </p>

        <div className="theme-prose space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Why Add a Watermark to a PDF?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              A watermark is semi-transparent text or an image overlaid on each page of a document. Unlike headers or footers that sit in the margins, watermarks appear across the main content area of the page, making them immediately visible without interfering with readability.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              Watermarks serve several practical purposes. They communicate document status — a &ldquo;DRAFT&rdquo; watermark tells readers the content isn&apos;t finalized. They discourage unauthorized distribution — a &ldquo;CONFIDENTIAL&rdquo; stamp reminds recipients to handle the document carefully. And they establish ownership — a company name watermark identifies the source at a glance.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              Unlike password protection or encryption, watermarks don&apos;t prevent anyone from reading the document. Instead, they act as a visual label. Think of them as the digital equivalent of stamping &ldquo;DRAFT&rdquo; in red ink across a printed page — everyone can still read it, but no one will mistake it for the final version.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Common Types of Watermarks</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Most watermarks fall into a few standard categories, each serving a different purpose:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>DRAFT</strong> — The most widely used watermark. Applied to documents still under review, it prevents early versions from being confused with final approved copies. Common in legal contracts, business proposals, and academic papers that go through multiple revision cycles.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>CONFIDENTIAL</strong> — Used for sensitive documents that should only be viewed by authorized recipients. You&apos;ll see this on financial reports, HR documents, medical records, and internal strategy papers. It sets a clear expectation about how the document should be handled.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Company name or logo text</strong> — Branding watermarks identify the document&apos;s origin. They&apos;re common in proposals sent to clients, marketing materials, and presentation handouts. Even a subtle company name watermark reinforces brand presence on every page.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>DO NOT COPY</strong> — Used to discourage reproduction of the document. While it doesn&apos;t technically prevent copying, it establishes clear intent. Common for proof copies, preview documents, and proprietary materials shared for review only.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>SAMPLE or PROOF</strong> — Applied to demonstration versions of documents, templates, or products. Photographers use &ldquo;PROOF&rdquo; watermarks on preview images, while publishers might watermark sample chapters or preview copies.</li>
            </ul>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Step-by-Step: Add a Watermark Using PDF Tools</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Our <Link href="/add-watermark-to-pdf" className="theme-link hover:underline">Add Watermark to PDF</Link> tool lets you stamp text watermarks onto any PDF directly in your browser. No file uploads, no accounts, no software to install.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the tool</strong> — Go to the <Link href="/add-watermark-to-pdf" className="theme-link hover:underline">Add Watermark to PDF</Link> page. You can find it under the &ldquo;Edit&rdquo; category on the homepage or navigate directly.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Upload your PDF</strong> — Drag and drop your file into the upload area, or click to browse your files. Your PDF loads entirely in your browser&apos;s memory — it&apos;s never sent to any server.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Enter your watermark text</strong> — Type the text you want to appear as a watermark. Common choices include DRAFT, CONFIDENTIAL, your company name, or any custom text. Keep it short — one to three words works best for readability.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Adjust the settings</strong> — Fine-tune the appearance. Set the opacity (15&ndash;30% is ideal for most documents), choose the font size, pick a color (light gray is standard), and set the rotation angle (45 degrees diagonal is the most common placement).</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Preview and apply</strong> — Check the preview to make sure the watermark looks right. It should be visible enough to communicate its purpose but not so dark that it obscures the underlying content.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download your watermarked PDF</strong> — Click download to save the finished file. The watermark is embedded in the PDF itself, so it appears in any PDF viewer or when printed.</li>
            </ol>
          </div>

          <AdSlot slot="guide-watermark-mid" format="horizontal" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Watermark Best Practices</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              A good watermark is noticeable without being intrusive. Here are the settings that work best for most documents:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Opacity: 15&ndash;30%</strong> — This is the sweet spot. Below 15%, the watermark is too faint and might not show up when printed. Above 30%, it starts to interfere with reading the actual content. For text-heavy documents, stay closer to 15%. For image-heavy documents or presentations, you can go up to 30%.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Diagonal placement (45 degrees)</strong> — Angling the watermark diagonally across the page makes it harder to crop out and ensures it covers both text and images. It also looks more natural than horizontal or vertical placement, which can feel like it&apos;s competing with the document&apos;s own layout.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Light gray color</strong> — Gray watermarks are visible on both white backgrounds and over images without clashing with the document&apos;s color scheme. Avoid red or other bright colors unless you specifically want the watermark to draw strong attention (like a &ldquo;VOID&rdquo; stamp on a canceled invoice).</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Don&apos;t obscure critical content</strong> — While watermarks intentionally overlap content, make sure key elements like signatures, form fields, charts, and fine print remain readable. If your document has critical visual elements, consider reducing the font size or opacity.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Use uppercase text</strong> — Watermarks in all caps (DRAFT, CONFIDENTIAL) are easier to read at low opacity than mixed-case text. They also carry more visual authority and are immediately recognizable as a stamp rather than regular document text.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>When to Use Watermarks</h2>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Draft reviews.</strong> When circulating a document for feedback, a DRAFT watermark prevents anyone from mistaking the current version for the final one. This is especially important in legal and regulatory settings where acting on a non-final document could have consequences.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Proof copies.</strong> Photographers, designers, and publishers often share proof versions with clients for approval. A watermark on the proof ensures the client reviews and approves before receiving the clean, final version.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Legal and compliance documents.</strong> Contracts in negotiation, policy drafts, and regulatory filings often carry watermarks during the review period. Once finalized and <Link href="/sign-pdf" className="theme-link hover:underline">signed</Link>, the watermark is removed from the official version.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Photography portfolios.</strong> When sharing sample images in PDF format, watermarks protect your work from being used without permission. While not foolproof, they deter casual misuse and make it clear the images are previews.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Internal documents shared externally.</strong> When you need to share an internal report or presentation with someone outside your organization, a CONFIDENTIAL watermark sets clear expectations about how the document should be treated.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Watermarks vs Page Numbers vs Headers</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              PDFs support several types of overlays, and each serves a different purpose. Knowing which one to use avoids cluttering your document:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Watermarks</strong> — Best for status labels and ownership marks. They span the content area of the page, are semi-transparent, and are designed to be seen without being read in detail. Use watermarks when you need every page to carry a visual message at a glance.</li>
              <li><strong style={{ color: "var(--text-primary)" }}><Link href="/add-page-numbers-to-pdf" className="theme-link hover:underline">Page numbers</Link></strong> — Best for navigation. They sit in the margin (header or footer area) and help readers reference specific pages. Use page numbers when your document will be discussed in meetings or cited in other work.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Headers and footers</strong> — Best for metadata like document title, author name, date, or section titles. They occupy a fixed position in the margin and are fully opaque. Use headers when you need consistent reference information on every page.</li>
            </ul>
            <p style={{ color: "var(--text-secondary)" }}>
              You can combine all three on the same document if needed — for example, a draft contract might have a DRAFT watermark, page numbers in the footer, and the client name in the header. Just make sure the layers don&apos;t overlap or create visual clutter.
            </p>
          </div>

          <AdSlot slot="guide-watermark-faq" format="rectangle" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Can Watermarks Be Removed?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Yes — and this is an important point to understand. Text watermarks added to a PDF are not a security measure. They can be removed or edited by anyone with a PDF editing tool. The watermark text is simply drawn onto each page as an additional layer, and most PDF editors can select and delete that layer.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              This means watermarks are best used for attribution and communication, not protection. A DRAFT watermark tells people the document is a draft — it doesn&apos;t prevent them from treating it as final. A CONFIDENTIAL stamp reminds recipients to be careful — it doesn&apos;t stop them from sharing it.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              If you need actual document protection, consider password-protecting the PDF, using <Link href="/redact-pdf" className="theme-link hover:underline">redaction</Link> to permanently remove sensitive content, or using digital rights management (DRM) software. Watermarks and security measures serve different purposes and work best when used together — a watermark for visual communication, and encryption or access controls for actual protection.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Will the watermark appear when I print the PDF?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes. The watermark is embedded directly in the PDF content, so it appears both on screen and in print. It&apos;s rendered at the same opacity you set in the tool, though printed results may look slightly different depending on your printer settings.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I watermark only specific pages?</h3>
                <p style={{ color: "var(--text-secondary)" }}>The tool applies the watermark to all pages in the PDF. If you need to watermark only certain pages, you can <Link href="/split-pdf" className="theme-link hover:underline">split the PDF</Link> first, watermark the pages you want, then <Link href="/merge-pdf" className="theme-link hover:underline">merge</Link> everything back together.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Is my PDF uploaded to a server?</h3>
                <p style={{ color: "var(--text-secondary)" }}>No. All processing happens locally in your browser. Your file never leaves your device, which makes this tool safe for confidential and sensitive documents.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I add an image watermark instead of text?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Currently, the tool supports text watermarks only. For most business use cases — DRAFT, CONFIDENTIAL, company names — text watermarks are the standard approach and produce clean, professional results.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/add-watermark-to-pdf" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#059669", borderRadius: "8px" }}>
              Try Add Watermark Now
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
