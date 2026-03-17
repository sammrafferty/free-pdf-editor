import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — PDF Tools",
  description: "Privacy policy for PDF Tools. Learn how we handle your data, cookies, and advertising.",
};

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: March 9, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>
              PDF Tools is designed with privacy as a core principle. <strong>All PDF processing happens entirely in your browser.</strong> Your files are never uploaded to our servers. We do not collect, store, or have access to any files you process using our tools.
            </p>
            <p>
              We may collect limited, non-personal information automatically, including browser type, device type, pages visited, and referring URLs. This data is used solely to improve our service and is collected through standard web analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Cookies and Advertising</h2>
            <p>
              We use Google AdSense to display advertisements on our site. Google AdSense uses cookies — including the DoubleClick DART cookie — to serve ads based on your visits to this site and other sites on the Internet.
            </p>
            <p>
              These cookies allow Google and its partners to serve ads to you based on your browsing patterns. No personally identifiable information is collected through these cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Third-Party Advertising Partners</h2>
            <p>
              Third-party ad servers or ad networks use technologies like cookies, JavaScript, or web beacons in their advertisements and links that appear on PDF Tools. These technologies are used to measure the effectiveness of their advertising campaigns and to personalize ad content.
            </p>
            <p>
              PDF Tools has no access to or control over these cookies used by third-party advertisers. We recommend consulting the respective privacy policies of these third-party ad servers for more information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Google&apos;s Use of the DART Cookie</h2>
            <p>
              Google, as a third-party vendor, uses the DART cookie to serve ads to users based on their visit to our site and other sites on the Internet. Users may opt out of the DART cookie by visiting the{" "}
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Google Ad and Content Network Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ads Settings</a></li>
              <li>Opt out of third-party cookies by visiting the <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Network Advertising Initiative opt-out page</a></li>
              <li>Disable cookies in your browser settings</li>
              <li>Use browser extensions that block tracking and advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Children&apos;s Privacy (COPPA)</h2>
            <p>
              PDF Tools does not knowingly collect any personally identifiable information from children under the age of 13. If you believe your child has provided such information through our site, please contact us immediately and we will make every effort to remove it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Security</h2>
            <p>
              Since all file processing occurs locally in your browser, your documents are never transmitted over the Internet. This provides the highest level of data security possible — your files remain on your device at all times.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
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
