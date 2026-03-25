import Link from "next/link";
import type { Metadata } from "next";
import Logo from "@/app/components/Logo";
import AdSlot from "@/app/components/AdSlot";
import Navbar from "@/app/components/Navbar";
import AnimatedSection from "@/app/components/AnimatedSection";

export const metadata: Metadata = {
  title: "Privacy Policy — PDF Tools",
  description: "Privacy policy for PDF Tools. Learn how we handle your data, cookies, and advertising.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — PDF Tools",
    description: "Privacy policy for PDF Tools. Learn how we handle your data, cookies, and advertising.",
    url: "/privacy",
    siteName: "PDF Tools",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PDF Tools — Privacy Policy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — PDF Tools",
    description: "Privacy policy for PDF Tools. Learn how we handle your data, cookies, and advertising.",
    images: ["/og-image.png"],
  },
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="navbar-spacer" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <AnimatedSection>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight"
            style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Privacy Policy
          </h1>
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>Last updated: March 9, 2026</p>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="theme-prose max-w-none space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>1. Information We Collect</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                PDF Tools is designed with privacy as a core principle. <strong style={{ color: "var(--text-primary)" }}>All PDF processing happens entirely in your browser.</strong> Your files are never uploaded to our servers. We do not collect, store, or have access to any files you process using our tools.
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                We may collect limited, non-personal information automatically, including browser type, device type, pages visited, and referring URLs. This data is used solely to improve our service and is collected through standard web analytics.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>2. Cookies and Advertising</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                We use Google AdSense to display advertisements on our site. Google AdSense uses cookies — including the DoubleClick DART cookie — to serve ads based on your visits to this site and other sites on the Internet.
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                These cookies allow Google and its partners to serve ads to you based on your browsing patterns. No personally identifiable information is collected through these cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>3. Third-Party Advertising Partners</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Third-party ad servers or ad networks use technologies like cookies, JavaScript, or web beacons in their advertisements and links that appear on PDF Tools. These technologies are used to measure the effectiveness of their advertising campaigns and to personalize ad content.
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                PDF Tools has no access to or control over these cookies used by third-party advertisers. We recommend consulting the respective privacy policies of these third-party ad servers for more information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>4. Google&apos;s Use of the DART Cookie</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Google, as a third-party vendor, uses the DART cookie to serve ads to users based on their visit to our site and other sites on the Internet. Users may opt out of the DART cookie by visiting the{" "}
                <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="theme-link hover:underline">
                  Google Ad and Content Network Privacy Policy
                </a>.
              </p>
            </section>

            <AdSlot slot="privacy-content" format="rectangle" className="my-6 sm:my-8" />

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>5. Your Rights and Choices</h2>
              <p style={{ color: "var(--text-secondary)" }}>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1" style={{ color: "var(--text-secondary)" }}>
                <li>Opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="theme-link hover:underline">Google Ads Settings</a></li>
                <li>Opt out of third-party cookies by visiting the <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="theme-link hover:underline">Network Advertising Initiative opt-out page</a></li>
                <li>Disable cookies in your browser settings</li>
                <li>Use browser extensions that block tracking and advertising</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>6. Children&apos;s Privacy (COPPA)</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                PDF Tools does not knowingly collect any personally identifiable information from children under the age of 13. If you believe your child has provided such information through our site, please contact us immediately and we will make every effort to remove it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>7. Data Security</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Since all file processing occurs locally in your browser, your documents are never transmitted over the Internet. This provides the highest level of data security possible — your files remain on your device at all times.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>8. Changes to This Policy</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>9. Contact Us</h2>
              <p style={{ color: "var(--text-secondary)" }}>
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:contact@pdf-tool-pi.vercel.app" className="theme-link hover:underline">contact@pdf-tool-pi.vercel.app</a>.
              </p>
            </section>
          </div>
        </AnimatedSection>
      </div>

      {/* Footer */}
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
