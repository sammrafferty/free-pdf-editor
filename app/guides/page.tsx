import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Guides — How to Edit, Convert & Manage PDFs | PDF Tools",
  description: "Step-by-step guides for splitting, merging, compressing, converting, and editing PDFs. Learn how to use free browser-based PDF tools with no uploads required.",
  keywords: "PDF guide, how to split PDF, how to merge PDF, how to compress PDF, PDF to Word, PDF tutorial",
  alternates: {
    canonical: "https://pdf-tool-pi.vercel.app/guides",
  },
  openGraph: {
    title: "PDF Guides — How to Edit, Convert & Manage PDFs | PDF Tools",
    description: "Step-by-step guides for splitting, merging, compressing, converting, and editing PDFs. Free browser-based tools with no uploads required.",
    url: "https://pdf-tool-pi.vercel.app/guides",
    siteName: "PDF Tools",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PDF Tools — Guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Guides — How to Edit, Convert & Manage PDFs | PDF Tools",
    description: "Step-by-step guides for splitting, merging, compressing, converting, and editing PDFs.",
    images: ["/og-image.png"],
  },
};

const guides = [
  {
    slug: "how-to-split-pdf",
    title: "How to Split a PDF",
    desc: "Extract specific pages or break a PDF into multiple files — no software needed.",
    color: "#6366f1",
  },
  {
    slug: "how-to-merge-pdfs",
    title: "How to Merge PDFs",
    desc: "Combine multiple PDF documents into a single file in seconds.",
    color: "#3b82f6",
  },
  {
    slug: "how-to-compress-pdf",
    title: "How to Compress a PDF",
    desc: "Reduce PDF file size for email, uploads, and faster sharing.",
    color: "#10b981",
  },
  {
    slug: "how-to-convert-pdf-to-word",
    title: "How to Convert PDF to Word",
    desc: "Turn any PDF into an editable Word document right in your browser.",
    color: "#2563eb",
  },
  {
    slug: "how-to-rotate-pdf",
    title: "How to Rotate PDF Pages",
    desc: "Fix sideways or upside-down pages in any PDF file.",
    color: "#f59e0b",
  },
];

export default function Guides() {
  return (
    <main className="min-h-screen">
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
          PDF Guides
        </h1>
        <p className="text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
          Step-by-step tutorials for every PDF task. Learn how to split, merge, compress, convert, and edit PDF files — entirely in your browser with no uploads required.
        </p>

        <div className="space-y-4">
          {guides.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group flex items-start gap-4 p-5 sm:p-6 theme-card"
            >
              <div
                className="w-1 h-full min-h-[48px] rounded-full shrink-0"
                style={{ backgroundColor: g.color }}
              />
              <div>
                <h2 className="text-lg font-semibold mb-1 group-hover:opacity-80 transition-opacity" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {g.title}
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{g.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="theme-section p-6 sm:p-8 mt-12">
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>
            Why Use Browser-Based PDF Tools?
          </h2>
          <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <p>
              Traditional PDF editors like Adobe Acrobat require expensive subscriptions and heavy software installs. Online alternatives often upload your sensitive documents to remote servers, creating privacy and security risks.
            </p>
            <p>
              Browser-based PDF tools solve both problems. They run entirely on your device using modern web technologies like JavaScript and the Canvas API. Your files are processed locally — nothing is uploaded, stored, or transmitted. This makes them faster (no upload/download wait), more private, and completely free to use.
            </p>
            <p>
              Whether you&apos;re a student organizing coursework, a professional preparing contracts, or anyone who works with PDFs regularly, these guides will help you get the most out of every tool.
            </p>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid var(--border-primary)" }} className="mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            <span>All processing happens locally in your browser.</span>
            <div className="flex items-center gap-4">
              <Link href="/guides" className="hover:opacity-80 transition-opacity">Guides</Link>
              <Link href="/faq" className="hover:opacity-80 transition-opacity">FAQ</Link>
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
