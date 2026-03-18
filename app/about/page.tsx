import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — PDF Tools",
  description: "Learn about PDF Tools — a free, privacy-first, browser-based PDF suite. No uploads, no servers, just fast PDF processing.",
};

export default function About() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="theme-header sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80">
            <img src="/logo.svg" alt="PDF Tools" className="w-8 h-8 sm:w-9 sm:h-9" />
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
          className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight"
          style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          About PDF Tools
        </h1>

        <div className="theme-prose max-w-none space-y-6 leading-relaxed">
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            PDF Tools is a free, browser-based suite for working with PDF files. Split, merge, compress, convert, edit, sign, and more — all without uploading a single file.
          </p>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Privacy-First by Design</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Unlike most online PDF tools, <strong style={{ color: "var(--text-primary)" }}>your files never leave your device</strong>. All processing happens locally in your web browser using JavaScript. There are no servers receiving your documents, no cloud storage, and no data retention. When you close the tab, your files are gone from our site entirely — because they were never here.
            </p>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>How It Works</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              PDF Tools leverages modern web technologies to process PDFs directly in your browser:
            </p>
            <ul className="list-disc pl-6 space-y-1" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>PDF-lib</strong> — for splitting, merging, rotating, watermarking, and page manipulation</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Canvas API</strong> — for rendering, cropping, and image conversion</li>
              <li><strong style={{ color: "var(--text-primary)" }}>JavaScript</strong> — all tool logic runs client-side, meaning zero server interaction</li>
            </ul>
            <p style={{ color: "var(--text-secondary)" }}>
              This means the tools work offline once the page loads, and performance scales with your device rather than a remote server.
            </p>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Built With</h2>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "React", "TypeScript", "Tailwind CSS", "pdf-lib", "Vercel"].map((tech) => (
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
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-primary)" }} className="mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>
            <span>All processing happens locally in your browser.</span>
            <div className="flex items-center gap-4">
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
