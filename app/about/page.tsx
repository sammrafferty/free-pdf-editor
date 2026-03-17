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
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80">
            <img src="/logo.svg" alt="PDF Tools" className="w-8 h-8 sm:w-9 sm:h-9" />
            <span className="font-bold text-lg text-gray-900 tracking-tight">PDF Tools</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Tools
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 tracking-tight">About PDF Tools</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <p className="text-lg">
            PDF Tools is a free, browser-based suite for working with PDF files. Split, merge, compress, convert, edit, sign, and more — all without uploading a single file.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Privacy-First by Design</h2>
            <p>
              Unlike most online PDF tools, <strong>your files never leave your device</strong>. All processing happens locally in your web browser using JavaScript. There are no servers receiving your documents, no cloud storage, and no data retention. When you close the tab, your files are gone from our site entirely — because they were never here.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">How It Works</h2>
            <p>
              PDF Tools leverages modern web technologies to process PDFs directly in your browser:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>PDF-lib</strong> — for splitting, merging, rotating, watermarking, and page manipulation</li>
              <li><strong>Canvas API</strong> — for rendering, cropping, and image conversion</li>
              <li><strong>JavaScript</strong> — all tool logic runs client-side, meaning zero server interaction</li>
            </ul>
            <p>
              This means the tools work offline once the page loads, and performance scales with your device rather than a remote server.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Built With</h2>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "React", "TypeScript", "Tailwind CSS", "pdf-lib", "Vercel"].map((tech) => (
                <span key={tech} className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-700 border border-gray-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Legal</h2>
            <p>
              Read our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> and{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> for full details on how we operate.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-400">
            <span>All processing happens locally in your browser.</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
              <Link href="/about" className="hover:text-gray-600 transition-colors">About</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
