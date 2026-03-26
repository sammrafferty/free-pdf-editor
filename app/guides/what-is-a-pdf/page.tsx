import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import AdSlot from "@/app/components/AdSlot";

export const metadata: Metadata = {
  title: "What Is a PDF? Everything You Need to Know | PDF Tools",
  description: "Learn what PDF files are, how they work, their history, and how to create, edit, and convert them. Complete guide to the Portable Document Format.",
  keywords: "what is a PDF, PDF meaning, portable document format, PDF file, PDF format explained",
  alternates: {
    canonical: "/guides/what-is-a-pdf",
  },
  openGraph: {
    title: "What Is a PDF? Everything You Need to Know | PDF Tools",
    description: "Learn what PDF files are, how they work, their history, and how to create, edit, and convert them.",
    url: "/guides/what-is-a-pdf",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "What Is a PDF?" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "What Is a PDF? Everything You Need to Know | PDF Tools",
    description: "Learn what PDF files are, how they work, their history, and how to create, edit, and convert them.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What Is a PDF? Everything You Need to Know",
  description: "Learn what PDF files are, how they work, their history, and how to create, edit, and convert them. Complete guide to the Portable Document Format.",
  author: { "@type": "Organization", name: "PDF Tools" },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://free-pdf-editor.org/" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://free-pdf-editor.org/guides" },
    { "@type": "ListItem", position: 3, name: "What Is a PDF?" },
  ],
};

export default function WhatIsAPdfGuide() {
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
          <span style={{ color: "var(--text-secondary)" }}>What Is a PDF?</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          What Is a PDF? Everything You Need to Know
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          The PDF is one of the most widely used file formats in the world. Whether you&apos;re signing a contract, reading an ebook, or submitting a tax form, chances are you&apos;re working with a PDF. But what exactly is a PDF, how does it work, and why has it become the universal standard for sharing documents? This guide covers everything you need to know.
        </p>

        <div className="theme-prose space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>What Does PDF Stand For?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              PDF stands for <strong style={{ color: "var(--text-primary)" }}>Portable Document Format</strong>. The name captures the format&apos;s core purpose: portability. A PDF file looks exactly the same no matter what device, operating system, or software you use to open it. Whether you view it on a Windows laptop, a Mac, an Android phone, or an iPad, the layout, fonts, images, and formatting are preserved precisely as the creator intended.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              This consistency is what makes PDFs so valuable. Unlike a Word document that might reflow text or swap fonts when opened on a different computer, a PDF is essentially a snapshot of the document. It&apos;s a finished, ready-to-view version of the content &mdash; closer to a printed page than an editable file.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              The PDF format was created by Adobe Systems in 1993. Dr. John Warnock, Adobe&apos;s co-founder, envisioned a universal way to share documents electronically while preserving their exact visual appearance. At the time, sharing formatted documents between different computer systems was a persistent headache &mdash; fonts would change, layouts would break, and images would disappear. PDF solved all of these problems in one format.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>A Brief History of PDF</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              The story of PDF begins in 1991 when Adobe co-founder John Warnock circulated an internal paper called &ldquo;The Camelot Project.&rdquo; His vision was simple but ambitious: create a file format that could capture any document from any application, send it electronically, and have it display and print identically on any machine.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>1993 &mdash; PDF 1.0 launches.</strong> Adobe released the first version of PDF along with Acrobat Reader and Acrobat Exchange. Early adoption was slow because Acrobat Reader cost $50, and internet connections were too slow to make large-file sharing practical. The format supported basic text, images, and hyperlinks.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>1994 &mdash; Acrobat Reader becomes free.</strong> This was the turning point. By giving away the reader software, Adobe ensured that anyone could open a PDF. The format began spreading rapidly as a way to publish documents online.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>1996&ndash;2001 &mdash; Feature expansion.</strong> Successive PDF versions added support for interactive forms, JavaScript, digital signatures, embedded multimedia, and accessibility features. PDF became the de facto standard for online tax forms, government publications, and business documents.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>2005 &mdash; PDF/A for archiving.</strong> The ISO published PDF/A (ISO 19005), a specialized subset of PDF designed for long-term digital preservation. Libraries, governments, and corporations adopted it to ensure documents would be readable decades into the future.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>2008 &mdash; PDF becomes an open standard.</strong> Adobe released the full PDF specification as an open ISO standard (ISO 32000-1). This was a landmark moment. By relinquishing proprietary control, Adobe allowed any software developer to create PDF tools without licensing fees. This led to an explosion of free PDF readers, editors, and libraries across every platform.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>2017&ndash;present &mdash; PDF 2.0.</strong> The latest major version (ISO 32000-2) added modern encryption, improved digital signature support, richer accessibility features, and 3D content capabilities. Today, over 2.5 trillion PDFs exist on the public web alone, and the format shows no signs of declining.
            </p>
          </div>

          <AdSlot slot="guide-what-is-pdf-mid" format="horizontal" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>How PDFs Work</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              A PDF file is a <strong style={{ color: "var(--text-primary)" }}>container format</strong>, meaning it bundles together multiple types of content into a single file. Understanding what goes inside this container helps explain why PDFs are so reliable and so widely used.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Text.</strong> Rather than storing raw text like a .txt file, PDFs store text along with precise positioning information. Each character knows exactly where it should appear on the page, down to fractions of a point. This is why text in a PDF doesn&apos;t reflow when you resize the window &mdash; the layout is fixed.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Fonts.</strong> PDFs can embed the actual font files used in the document. This means even if the recipient doesn&apos;t have the same fonts installed, the document still renders correctly. Font embedding is what prevents the dreaded &ldquo;font substitution&rdquo; problem that plagues Word documents shared between computers.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Images.</strong> Raster images (photographs, scans) are stored in compressed form, typically using JPEG or JPEG2000 compression. The PDF format also supports lossless compression formats like PNG-style deflate for images where quality is critical.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Vector graphics.</strong> Charts, logos, illustrations, and other graphics drawn with lines and curves are stored as mathematical descriptions rather than pixels. This means they scale perfectly to any resolution &mdash; a vector logo in a PDF looks just as sharp when printed on a billboard as on a business card.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Device-independent rendering.</strong> The PDF specification includes a page description language based on PostScript, the same technology used by professional printers. This means a PDF describes exactly how the page should look at any resolution and on any device. The viewer software simply follows the instructions to render the page &mdash; there&apos;s no interpretation or guesswork involved.
            </p>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>PDF vs Other Document Formats</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Understanding how PDF compares to other common formats helps you choose the right one for each situation.
            </p>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p>
                <strong style={{ color: "var(--text-primary)" }}>PDF vs DOCX (Microsoft Word).</strong> DOCX files are designed for editing &mdash; text reflows as you type, and the layout adapts to different page sizes and printers. This makes DOCX ideal for drafting and collaborating on documents. PDF, by contrast, is a <em>fixed-layout</em> format designed for final distribution. Once a document is saved as a PDF, the layout is locked. You can&apos;t easily add paragraphs or change formatting. Choose DOCX when you need to edit; choose PDF when you need to share a finished document. Need to switch between them? Use our <Link href="/pdf-to-word" className="theme-link hover:underline">PDF to Word</Link> or <Link href="/word-to-pdf" className="theme-link hover:underline">Word to PDF</Link> converters.
              </p>
              <p>
                <strong style={{ color: "var(--text-primary)" }}>PDF vs HTML (web pages).</strong> HTML is the language of the web, designed to be flexible and responsive. A web page adapts to the screen size, reflowing content for phones, tablets, and desktops. PDF is the opposite &mdash; it preserves a fixed layout that looks the same everywhere but doesn&apos;t adapt to different screen sizes. HTML is best for content that needs to be accessible online; PDF is best for content that needs to look exactly the same when printed or downloaded for offline reading.
              </p>
              <p>
                <strong style={{ color: "var(--text-primary)" }}>PDF vs image formats (JPEG, PNG).</strong> A scanned document saved as a JPEG is just a picture of the page &mdash; you can&apos;t select or search the text. A PDF, even one created from a scan, can include an invisible text layer (via OCR) that makes the content searchable and accessible. PDFs are also far more efficient for multi-page documents &mdash; a single PDF can contain hundreds of pages, while image formats require a separate file for each page.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Common Uses for PDFs</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              PDFs appear in nearly every industry and context. Here are the most common use cases:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Legal contracts and agreements.</strong> Law firms and businesses use PDFs for contracts because the fixed layout ensures no content shifts or disappears. Combined with digital signatures, PDFs provide legally binding documents that can be verified for authenticity. Our <Link href="/sign-pdf" className="theme-link hover:underline">Sign PDF</Link> tool makes adding signatures straightforward.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Academic papers and research.</strong> Journals, universities, and researchers distribute papers as PDFs to ensure figures, tables, equations, and citations appear exactly as intended. The searchable text layer also makes academic PDFs easy to cite and reference.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Government forms and applications.</strong> Tax forms, permit applications, visa paperwork &mdash; governments worldwide use PDFs for official forms. Many include fillable fields that let you type directly into the form before printing or submitting electronically.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Invoices and financial documents.</strong> Businesses send invoices, receipts, and financial statements as PDFs because the format is universally readable and preserves exact formatting for accounting and audit purposes.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Ebooks and digital publications.</strong> Many ebooks, product manuals, and guides are distributed as PDFs, especially when precise layout matters (e.g., cookbooks with images, technical manuals with diagrams, or art books).</li>
              <li><strong style={{ color: "var(--text-primary)" }}>User manuals and technical documentation.</strong> Hardware manufacturers, software companies, and engineering firms use PDFs for documentation because they can include detailed diagrams, tables of contents, bookmarks, and cross-references that remain intact across all devices.</li>
            </ul>
          </div>

          <AdSlot slot="guide-what-is-pdf-mid2" format="rectangle" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>How to Create a PDF</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Creating a PDF is straightforward, and there are several methods depending on your starting point:
            </p>
            <div className="space-y-3" style={{ color: "var(--text-secondary)" }}>
              <p>
                <strong style={{ color: "var(--text-primary)" }}>Print to PDF.</strong> Every modern operating system (Windows, macOS, Linux, ChromeOS) includes a built-in &ldquo;Print to PDF&rdquo; option. Open any document, web page, or email, select Print, and choose &ldquo;Save as PDF&rdquo; or &ldquo;Microsoft Print to PDF&rdquo; as the printer. This works from virtually any application and is the simplest way to create a PDF.
              </p>
              <p>
                <strong style={{ color: "var(--text-primary)" }}>Save As PDF from office software.</strong> Microsoft Word, Excel, PowerPoint, Google Docs, and LibreOffice all offer an &ldquo;Export as PDF&rdquo; or &ldquo;Save As PDF&rdquo; option. This typically produces smaller, cleaner files than printing to PDF because the software can optimize the output directly. You can also use our <Link href="/word-to-pdf" className="theme-link hover:underline">Word to PDF</Link> converter to do this right in your browser.
              </p>
              <p>
                <strong style={{ color: "var(--text-primary)" }}>Scan to PDF.</strong> Most modern scanners and multifunction printers can save scans directly as PDF files. Phone apps like Adobe Scan, Microsoft Lens, and Apple&apos;s built-in document scanner also create PDFs from photos of paper documents. These scanned PDFs are essentially images, so they tend to be larger and lack searchable text unless OCR is applied.
              </p>
              <p>
                <strong style={{ color: "var(--text-primary)" }}>Convert images to PDF.</strong> If you have photos or screenshots you need to combine into a document, you can convert them to PDF. Our <Link href="/merge-pdf" className="theme-link hover:underline">Merge PDF</Link> tool lets you combine multiple files into a single document.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>How to Edit a PDF</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              While PDFs are designed as a final-output format, there are many ways to modify them. Here are the most common editing tasks and the tools you can use &mdash; all free, all running directly in your browser:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Split a PDF</strong> &mdash; Break a multi-page document into separate files. Useful for extracting specific sections. <Link href="/split-pdf" className="theme-link hover:underline">Try Split PDF</Link>.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Merge PDFs</strong> &mdash; Combine multiple PDFs into one document. Great for assembling reports, portfolios, or application packets. <Link href="/merge-pdf" className="theme-link hover:underline">Try Merge PDF</Link>.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Compress a PDF</strong> &mdash; Reduce file size for easier sharing via email or upload. <Link href="/compress-pdf" className="theme-link hover:underline">Try Compress PDF</Link>.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Convert to Word</strong> &mdash; Extract the content of a PDF into an editable Word document. <Link href="/pdf-to-word" className="theme-link hover:underline">Try PDF to Word</Link>.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Rotate pages</strong> &mdash; Fix pages that are sideways or upside down. Common with scanned documents. <Link href="/rotate-pdf" className="theme-link hover:underline">Try Rotate PDF</Link>.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Sign a PDF</strong> &mdash; Add your signature to contracts, agreements, and forms without printing. <Link href="/sign-pdf" className="theme-link hover:underline">Try Sign PDF</Link>.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Add a watermark</strong> &mdash; Stamp &ldquo;DRAFT,&rdquo; &ldquo;CONFIDENTIAL,&rdquo; or your company name across pages. <Link href="/watermark-pdf" className="theme-link hover:underline">Try Watermark PDF</Link>.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Redact sensitive information</strong> &mdash; Permanently remove text, images, or other content from a PDF so it cannot be recovered. <Link href="/redact-pdf" className="theme-link hover:underline">Try Redact PDF</Link>.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>PDF Accessibility and Tagged PDFs</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Not all PDFs are created equal when it comes to accessibility. A well-structured PDF includes invisible &ldquo;tags&rdquo; that describe the document&apos;s structure &mdash; headings, paragraphs, lists, tables, and image descriptions. These tags serve several important purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Screen readers.</strong> Visually impaired users rely on screen-reading software that reads documents aloud. Tagged PDFs allow screen readers to navigate the document logically, announce headings, read table data cell by cell, and describe images using alt text. Without tags, a screen reader may read the text in the wrong order or skip important content entirely.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Reflow and zoom.</strong> Tagged PDFs can reflow text to fit smaller screens, making them more usable on phones and tablets. Without tags, the content remains fixed and may require horizontal scrolling on small devices.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>PDF/A for archiving.</strong> PDF/A is a strict subset of PDF designed for long-term preservation. It requires all fonts to be embedded, prohibits encryption and external dependencies, and ensures the file will be viewable decades from now. Government archives, legal firms, and libraries use PDF/A to preserve important documents.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>PDF/UA for universal accessibility.</strong> PDF/UA (Universal Accessibility) is the accessibility standard for PDFs, published as ISO 14289. It mandates proper tagging, alternative text for images, a logical reading order, and other features that make documents usable by people with disabilities. Many governments now require PDF/UA compliance for publicly distributed documents.</li>
            </ul>
            <p style={{ color: "var(--text-secondary)" }}>
              If you create PDFs for public distribution or official purposes, investing in proper tagging and accessibility is not just a best practice &mdash; in many jurisdictions, it&apos;s a legal requirement.
            </p>
          </div>

          <AdSlot slot="guide-what-is-pdf-faq" format="rectangle" className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Is PDF a free format?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes. Since 2008, PDF has been an open ISO standard (ISO 32000). Anyone can create software that reads or writes PDFs without paying licensing fees to Adobe or anyone else. This openness is a major reason why PDF support is built into virtually every operating system, browser, and office suite.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I edit a PDF without Adobe Acrobat?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Absolutely. There are many free tools for editing PDFs, including browser-based tools like ours. You can <Link href="/split-pdf" className="theme-link hover:underline">split</Link>, <Link href="/merge-pdf" className="theme-link hover:underline">merge</Link>, <Link href="/compress-pdf" className="theme-link hover:underline">compress</Link>, <Link href="/rotate-pdf" className="theme-link hover:underline">rotate</Link>, <Link href="/sign-pdf" className="theme-link hover:underline">sign</Link>, and <Link href="/pdf-to-word" className="theme-link hover:underline">convert</Link> PDFs without any paid software.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Are PDFs safe to open?</h3>
                <p style={{ color: "var(--text-secondary)" }}>PDFs are generally safe, but like any file format, they can potentially contain malicious content. The PDF specification allows embedded JavaScript, which has historically been exploited by attackers. To stay safe, keep your PDF reader software updated, be cautious with PDFs from unknown senders, and use a reader that sandboxes PDF content (modern browsers do this automatically when displaying PDFs).</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Why does my PDF look different when I print it?</h3>
                <p style={{ color: "var(--text-secondary)" }}>This usually happens when the PDF contains transparency or color profiles that your printer doesn&apos;t support. Most consumer printers work in CMYK color space, while many PDFs use RGB colors designed for screen viewing. Flattening transparency and converting to CMYK before printing typically resolves any visual discrepancies.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>What&apos;s the difference between PDF and PDF/A?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Standard PDF is flexible and supports a wide range of features including multimedia, JavaScript, and external font references. PDF/A is a stricter subset designed specifically for long-term archiving. It requires all fonts to be embedded, prohibits multimedia and encryption, and ensures the document is entirely self-contained. If you need to preserve a document for decades, PDF/A is the right choice.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#059669", borderRadius: "8px" }}>
              Try Our Free PDF Tools
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
