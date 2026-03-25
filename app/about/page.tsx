import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/app/components/Logo";
import AdSlot from "@/app/components/AdSlot";
import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
  title: "About — PDF Tools | Free Browser-Based PDF Suite",
  description: "Learn about PDF Tools — a free, privacy-first, browser-based PDF suite. No uploads, no servers, just fast PDF processing entirely on your device.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About — PDF Tools | Free Browser-Based PDF Suite",
    description: "Learn about PDF Tools — a free, privacy-first, browser-based PDF suite. No uploads, no servers, just fast PDF processing entirely on your device.",
    url: "/about",
    siteName: "PDF Tools",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PDF Tools — About" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — PDF Tools | Free Browser-Based PDF Suite",
    description: "Learn about PDF Tools — a free, privacy-first, browser-based PDF suite.",
    images: ["/og-image.png"],
  },
};

export default function About() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="navbar-spacer" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1
          className="hero-animate text-3xl sm:text-4xl font-bold mb-6 tracking-tight"
          style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif", animationDelay: "0.1s" }}
        >
          About PDF Tools
        </h1>

        <div className="theme-prose max-w-none space-y-8 leading-relaxed">
          <p className="hero-animate text-lg" style={{ color: "var(--text-secondary)", animationDelay: "0.25s" }}>
            PDF Tools is a free, browser-based suite for working with PDF files. Split, merge, compress, convert, edit, sign, and more — all without uploading a single file to any server.
          </p>

          <div className="hero-animate theme-section p-6 sm:p-8 space-y-4" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Our Mission</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              We believe basic document tools should be free, private, and accessible to everyone. The PDF format powers modern document exchange — from student assignments and tax forms to business contracts and medical records. Yet working with PDFs often means choosing between expensive desktop software, sketchy free downloads, or online tools that upload your sensitive files to unknown servers.
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              PDF Tools exists to eliminate that trade-off. By processing everything locally in your browser, we deliver the convenience of online tools with the privacy of desktop software — at zero cost. No accounts, no subscriptions, no file limits, no watermarks.
            </p>
          </div>

          <div className="hero-animate theme-section p-6 sm:p-8 space-y-4" style={{ animationDelay: "0.15s" }}>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Privacy-First by Design</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Unlike most online PDF tools, <strong style={{ color: "var(--text-primary)" }}>your files never leave your device</strong>. This isn&apos;t a marketing claim with caveats — it&apos;s an architectural fact. Here&apos;s how it works:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li>When you load PDF Tools, your browser downloads the application code (HTML, CSS, JavaScript) — just like any website.</li>
              <li>When you select a file, it&apos;s loaded into your browser&apos;s local memory. No network request is made.</li>
              <li>All processing — splitting, merging, compressing, converting — happens via JavaScript running on your CPU.</li>
              <li>The result is generated in local memory and offered as a download. Still no network activity.</li>
              <li>When you close the tab, all data is cleared from memory. Nothing persists on our end because nothing was ever sent.</li>
            </ul>
            <p style={{ color: "var(--text-secondary)" }}>
              You can verify this yourself: open your browser&apos;s developer tools, go to the Network tab, and watch what happens when you process a file. You&apos;ll see zero upload requests. This makes PDF Tools inherently safe for confidential documents — financial statements, legal contracts, medical records, personal identification, or anything else you wouldn&apos;t want on someone else&apos;s server.
            </p>
          </div>

          <div className="hero-animate theme-section p-6 sm:p-8 space-y-4" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>How It Compares</h2>
            <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>vs. Adobe Acrobat</h3>
                <p>Adobe Acrobat is the gold standard for PDF editing, but it requires a subscription ($12.99–$22.99/month) and desktop installation. For common tasks like splitting, merging, compressing, and rotating, browser-based tools deliver the same results instantly without the cost or setup. Acrobat still excels at advanced features like form creation, digital certificates, and detailed text editing.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>vs. Online PDF services (Smallpdf, iLovePDF, etc.)</h3>
                <p>Online services are convenient but upload your files to remote servers for processing. This creates privacy and security concerns, especially for sensitive documents. Many also impose file size limits, daily usage caps, or require paid upgrades for basic features. PDF Tools offers comparable functionality with local processing — no uploads, no limits, no upsells.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>vs. macOS Preview / built-in tools</h3>
                <p>Operating system tools like macOS Preview handle some PDF tasks (merging, annotating, basic editing) but lack others (compression, conversion, watermarking, batch operations). They&apos;re also platform-locked — Preview is macOS only. PDF Tools works on any device with a modern browser, regardless of operating system.</p>
              </div>
            </div>
          </div>

          <div className="hero-animate theme-section p-6 sm:p-8 space-y-4" style={{ animationDelay: "0.25s" }}>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>How It Works</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              PDF Tools leverages modern web technologies to process PDFs directly in your browser:
            </p>
            <ul className="list-disc pl-6 space-y-1" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>PDF-lib</strong> — An open-source JavaScript library for creating and modifying PDF documents. Handles splitting, merging, rotating, watermarking, page numbering, and other structural operations.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Canvas API</strong> — The browser&apos;s built-in rendering engine for image processing. Used for PDF-to-image conversion, cropping, compression, and redaction.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>pdf.js</strong> — Mozilla&apos;s PDF rendering library, used for accurate page preview and text extraction.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Next.js + React</strong> — The application framework providing fast page loads, SEO optimization, and a responsive interface.</li>
            </ul>
            <p style={{ color: "var(--text-secondary)" }}>
              All tool logic runs client-side, meaning zero server interaction during file processing. Performance scales with your device — a modern laptop processes most files in seconds.
            </p>
          </div>

          <div className="hero-animate theme-section p-6 sm:p-8 space-y-4" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Who Uses PDF Tools</h2>
            <div className="space-y-2" style={{ color: "var(--text-secondary)" }}>
              <p><strong style={{ color: "var(--text-primary)" }}>Students</strong> — Combining lecture slides, extracting textbook chapters, compressing assignments for submission portals, converting notes between formats.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Professionals</strong> — Merging contracts and exhibits, compressing files for email, converting documents between PDF and Office formats, adding watermarks to drafts.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Small businesses</strong> — Creating invoices, signing documents, organizing receipts, preparing files for clients without investing in enterprise PDF software.</p>
              <p><strong style={{ color: "var(--text-primary)" }}>Anyone who works with PDFs</strong> — Whether you handle PDFs daily or once a month, having free, instant access to reliable tools without software installation or account creation saves time and hassle.</p>
            </div>
          </div>

          <div className="hero-animate theme-section p-6 sm:p-8 space-y-4" style={{ animationDelay: "0.35s" }}>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Built With</h2>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "React", "TypeScript", "Tailwind CSS", "pdf-lib", "pdf.js", "Vercel"].map((tech) => (
                <span key={tech} className="px-3 py-1.5 text-sm font-medium theme-badge font-mono">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Legal</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Read our <Link href="/privacy" className="theme-link hover:underline">Privacy Policy</Link> and{" "}
              <Link href="/terms" className="theme-link hover:underline">Terms of Service</Link> for full details on how we operate.
              Visit our <Link href="/faq" className="theme-link hover:underline">FAQ</Link> for answers to common questions, or check out our <Link href="/guides" className="theme-link hover:underline">Guides</Link> for step-by-step tutorials.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <AdSlot slot="about-content" format="horizontal" className="my-6 sm:my-8" />
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
