import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — PDF Tools",
  description: "Terms of service for PDF Tools. Read the terms governing your use of our free browser-based PDF tools.",
};

export default function TermsOfService() {
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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 9, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PDF Tools (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Service Description</h2>
            <p>
              PDF Tools provides free, browser-based tools for working with PDF documents, including but not limited to splitting, merging, compressing, rotating, converting, and editing PDFs. All file processing occurs locally within your web browser — no files are uploaded to external servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Use of the Service</h2>
            <p>You agree to use the Service only for lawful purposes. You may not:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to interfere with or disrupt the Service or its infrastructure</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service to process documents that infringe on intellectual property rights of others</li>
              <li>Use automated scripts to access the Service in a manner that overburdens our resources</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Intellectual Property</h2>
            <p>
              The Service, including its design, code, logos, and content, is the intellectual property of PDF Tools. You may not copy, modify, distribute, or create derivative works of our Service without prior written permission.
            </p>
            <p>
              You retain all rights to documents and files you process using the Service. We claim no ownership over your content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. Since all processing occurs locally in your browser:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>We are not responsible for any data loss, file corruption, or processing errors</li>
              <li>We recommend keeping backup copies of important documents before processing</li>
              <li>We do not guarantee the accuracy, completeness, or reliability of any output</li>
              <li>We are not liable for any direct, indirect, incidental, or consequential damages arising from use of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Disclaimer of Warranties</h2>
            <p>
              PDF Tools makes no warranties or representations about the suitability, reliability, availability, timeliness, or accuracy of the Service. The Service is used at your own risk. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Advertising</h2>
            <p>
              The Service may display third-party advertisements. These advertisements are governed by the advertisers&apos; own terms and privacy policies. We are not responsible for the content or accuracy of any advertising material.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be effective upon posting to this page. Your continued use of the Service after any changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:contact@pdf-tool-pi.vercel.app" className="text-blue-600 hover:underline">contact@pdf-tool-pi.vercel.app</a>.
            </p>
          </section>
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
