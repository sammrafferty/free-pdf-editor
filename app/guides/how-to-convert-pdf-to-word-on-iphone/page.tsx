import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import AdSlot from "@/app/components/AdSlot";
import AffiliateLink from "@/app/components/AffiliateLink";

export const metadata: Metadata = {
  title: "How to Convert PDF to Word on iPhone — Free Methods | PDF Tools",
  description: "Convert PDF files to editable Word documents on your iPhone. Free methods using Safari, Google Docs, and Microsoft Word.",
  keywords: "convert PDF to Word iPhone, PDF to DOCX iPhone, edit PDF iPhone, PDF to Word iOS, iPhone PDF converter",
  alternates: {
    canonical: "/guides/how-to-convert-pdf-to-word-on-iphone",
  },
  openGraph: {
    title: "How to Convert PDF to Word on iPhone — Free Methods | PDF Tools",
    description: "Convert PDF files to editable Word documents on your iPhone. Free methods using Safari, Google Docs, and Microsoft Word.",
    url: "/guides/how-to-convert-pdf-to-word-on-iphone",
    siteName: "PDF Tools",
    type: "article",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "How to Convert PDF to Word on iPhone" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Convert PDF to Word on iPhone — Free Methods | PDF Tools",
    description: "Convert PDF files to editable Word documents on your iPhone. Free methods using Safari, Google Docs, and Microsoft Word.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Convert PDF to Word on iPhone",
  description: "Convert PDF files to editable Word documents on your iPhone using free browser-based tools, Google Docs, or Microsoft Word.",
  step: [
    { "@type": "HowToStep", name: "Open Safari on your iPhone", text: "Launch Safari and navigate to the PDF to Word conversion tool." },
    { "@type": "HowToStep", name: "Upload your PDF file", text: "Tap the upload area and select your PDF from Files, iCloud Drive, or other locations." },
    { "@type": "HowToStep", name: "Convert the file", text: "Tap Convert and wait for the processing to complete in your browser." },
    { "@type": "HowToStep", name: "Download the Word document", text: "Tap Download to save the DOCX file to your iPhone." },
  ],
  tool: { "@type": "HowToTool", name: "PDF Tools - PDF to Word" },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://free-pdf-editor.org" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://free-pdf-editor.org/guides" },
    { "@type": "ListItem", position: 3, name: "Convert PDF to Word on iPhone", item: "https://free-pdf-editor.org/guides/how-to-convert-pdf-to-word-on-iphone" },
  ],
};

export default function PdfToWordIphoneGuide() {
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
          <span style={{ color: "var(--text-secondary)" }}>Convert PDF to Word on iPhone</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
          How to Convert PDF to Word on iPhone
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Need to edit a PDF on your iPhone but can&apos;t change the text? Converting it to a Word document makes it fully editable. Here are four free methods that work on any iPhone — no app downloads required for most of them.
        </p>

        <div className="theme-prose space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Can You Convert PDF to Word on iPhone?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Yes — and you have several options. iPhones can view PDFs natively through the Files app and Safari, but iOS doesn&apos;t include a built-in way to convert PDFs into editable Word documents. That said, you don&apos;t need to buy an app or transfer the file to a computer.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              The simplest approach is using a browser-based conversion tool that runs directly in Safari. Your PDF gets processed right on your device without being uploaded to a remote server. Alternatively, Google Docs and Microsoft Word both offer free conversion options if you already use those apps.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              The quality of any PDF-to-Word conversion depends on how the original PDF was created. PDFs made from digital documents (like a Word file saved as PDF) convert beautifully, with text, formatting, and layout largely preserved. Scanned documents — essentially images of pages — produce rougher results because the conversion tool has to interpret the image as text.
            </p>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 1: Using PDF Tools in Safari</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Our <Link href="/pdf-to-word" className="theme-link hover:underline">PDF to Word</Link> converter runs entirely in your browser. Your file stays on your iPhone — nothing is uploaded to any server. This is the fastest method and works on any iPhone with Safari.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open Safari</strong> — Navigate to <Link href="/pdf-to-word" className="theme-link hover:underline">free-pdf-editor.org/pdf-to-word</Link>. The tool loads instantly in your browser.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Tap the upload area</strong> — Tap &ldquo;Browse&rdquo; or the upload zone. iOS will show you file locations including your Files app, iCloud Drive, recent downloads, and other connected storage services.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Select your PDF</strong> — Navigate to your PDF and tap it. The file loads into Safari&apos;s memory. If the PDF is in an email or message, save it to Files first by tapping the share icon and selecting &ldquo;Save to Files.&rdquo;</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Tap Convert</strong> — The tool processes your PDF locally on your iPhone, extracting text and formatting to create a Word document. This typically takes a few seconds for standard documents.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download the Word file</strong> — Tap the download button. The .docx file will save to your Downloads folder in the Files app. From there, you can open it in Word, Google Docs, Pages, or any other word processor on your iPhone.</li>
            </ol>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 2: Using Google Docs</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              If you have a Google account, Google Docs can open PDF files and convert them to an editable format. This method requires uploading the file to Google Drive, so it&apos;s not fully offline.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Upload the PDF to Google Drive</strong> — Open the Google Drive app (or go to drive.google.com in Safari). Tap the + button and select &ldquo;Upload,&rdquo; then choose your PDF file.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Open with Google Docs</strong> — Once uploaded, tap the PDF file in Drive. Tap the three-dot menu and select &ldquo;Open with&rdquo; &gt; &ldquo;Google Docs.&rdquo; Google will create an editable version of the document.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Edit the document</strong> — The PDF content is now editable text in Google Docs. Make any changes you need directly in the app.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Download as Word</strong> — To get a .docx file, tap the three-dot menu in Google Docs and select &ldquo;Share and export&rdquo; &gt; &ldquo;Save as Word (.docx).&rdquo; The file saves to your Downloads folder.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              Google Docs handles text-based PDFs well, but complex layouts with multiple columns, tables, or images may not convert perfectly. It works best for straightforward text documents like letters, reports, and articles.
            </p>
          </div>

          <AdSlot slot="guide-pdf-word-iphone-mid" format="horizontal" className="my-6 sm:my-8" />

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 3: Using Microsoft Word App</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              The free version of Microsoft Word for iPhone can open PDF files and convert them to editable documents. Since Word is the native format, this method often produces the best formatting results.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Install Microsoft Word</strong> — Download the free Word app from the App Store if you don&apos;t have it. You can use basic features with a free Microsoft account — no Microsoft 365 subscription is required for PDF conversion.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the PDF in Word</strong> — Launch Word, tap &ldquo;Open,&rdquo; and navigate to your PDF file. Word will display a message saying it will convert the PDF to an editable Word document. Tap &ldquo;OK&rdquo; to proceed.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Review the conversion</strong> — Word converts the PDF and displays the result. Check that the text, formatting, and layout match the original. Some elements like headers, footers, and complex tables may need minor adjustments.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Save as DOCX</strong> — The file is already in Word format. Tap the three-dot menu and &ldquo;Save As&rdquo; to choose a location. You can save to your iPhone, OneDrive, or iCloud Drive.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              Microsoft Word tends to handle formatting better than other conversion methods because the .docx format is its native format. Tables, bullet points, and basic styling usually come through accurately.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Method 4: Using the Files App + Shortcuts</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              For advanced users who convert PDFs regularly, Apple&apos;s Shortcuts app lets you build a reusable automation. This is more setup work upfront but saves time if you do conversions frequently.
            </p>
            <ol className="list-decimal pl-6 space-y-3" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Open the Shortcuts app</strong> — Find it on your home screen or in the App Library. Tap the + button to create a new shortcut.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Add a &ldquo;Get File&rdquo; action</strong> — Search for &ldquo;Get File&rdquo; in the actions list and add it. This lets you select a PDF when the shortcut runs.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Add a &ldquo;Make Rich Text from PDF&rdquo; action</strong> — This extracts the text content from your PDF and converts it to rich text format, which preserves basic formatting like bold, italic, and headings.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Add a &ldquo;Save File&rdquo; action</strong> — This saves the converted output. You can configure it to save to a specific folder in Files or prompt you each time.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Name and save your shortcut</strong> — Give it a clear name like &ldquo;PDF to Word.&rdquo; The shortcut now appears in your Shortcuts app and can be triggered from the share sheet when viewing any PDF.</li>
            </ol>
            <p style={{ color: "var(--text-secondary)" }}>
              Note that the Shortcuts method produces rich text (.rtf) rather than true Word (.docx) format. The output is editable but may lack some Word-specific formatting features. For true .docx output, use one of the other three methods.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Tips for Better Conversion Results</h2>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Digital PDFs convert better than scans</strong> — A PDF created by exporting from Word, Google Docs, or another application contains actual text data that converts cleanly. A scanned PDF is essentially a photograph of each page, and the converter must use optical character recognition (OCR) to extract text, which introduces errors.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Simple layouts produce better results</strong> — Single-column documents with standard formatting convert most accurately. Multi-column layouts, text wrapped around images, and complex tables are harder for any converter to interpret correctly.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Always check the output</strong> — No PDF-to-Word conversion is perfect. After converting, scroll through the Word document and compare it to the original PDF. Look for missing text, shifted formatting, broken tables, and images that moved out of position.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Consider file size</strong> — Very large PDFs (50+ pages) may take longer to convert on an iPhone. If your device runs slowly during conversion, try <Link href="/compress-pdf" className="theme-link hover:underline">compressing the PDF</Link> first or splitting it into smaller sections.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Keep the original PDF</strong> — Always save the original PDF as a reference. If the conversion result needs cleanup, you can refer back to the original to verify text and formatting.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>What About iPad?</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Every method described above works identically on iPad. The larger screen makes it easier to review converted documents and catch formatting issues. If you have an iPad with a keyboard, you can edit the converted Word document right away without transferring it to a computer.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              iPad also supports Split View, which is helpful for conversion: open the original PDF on one side of the screen and the converted Word document on the other to compare them side by side. If you need to go in the other direction — creating a PDF from a Word document — our <Link href="/word-to-pdf" className="theme-link hover:underline">Word to PDF</Link> tool works the same way in Safari on iPad.
            </p>
          </div>

          <AdSlot slot="guide-pdf-word-iphone-faq" format="rectangle" className="my-6 sm:my-8" />
          <AffiliateLink className="my-6 sm:my-8" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Is the browser-based converter safe for sensitive documents?</h3>
                <p style={{ color: "var(--text-secondary)" }}>Yes. Our PDF to Word tool processes everything locally in your iPhone&apos;s browser. Your file is never uploaded to any server, and it&apos;s removed from memory when you close the tab. This makes it safe for confidential documents, contracts, and personal files.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Will the converted Word file look exactly like the PDF?</h3>
                <p style={{ color: "var(--text-secondary)" }}>It depends on the PDF&apos;s complexity. Simple text documents convert very accurately. PDFs with complex layouts, custom fonts, or heavy graphics may have formatting differences. Text content is almost always preserved correctly — it&apos;s the visual layout that may shift.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Can I convert a scanned PDF to Word on iPhone?</h3>
                <p style={{ color: "var(--text-secondary)" }}>You can try, but results vary. Scanned PDFs are images, so the converter needs to perform OCR (optical character recognition) to extract text. Clean scans with standard fonts and good contrast convert reasonably well. Low-quality scans, handwritten text, or unusual fonts may produce garbled output.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Do I need to pay for any of these methods?</h3>
                <p style={{ color: "var(--text-secondary)" }}>All four methods are free. Our Safari-based tool is completely free with no account needed. Google Docs requires a free Google account. Microsoft Word&apos;s free tier supports PDF conversion. The Shortcuts method uses only built-in iOS features.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <Link href="/pdf-to-word" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#059669", borderRadius: "8px" }}>
              Try PDF to Word Now
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
