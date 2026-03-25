import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSlugs, getToolBySlug } from "../lib/toolData";
import ToolPageClient from "./ToolPageClient";
import FaqSchema from "../components/FaqSchema";
import RelatedTools from "../components/RelatedTools";
import EmailCapture from "../components/EmailCapture";
import AdSlot from "../components/AdSlot";
import Navbar from "../components/Navbar";
import CookieConsent from "../components/CookieConsent";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ tool: slug }));
}

type PageProps = { params: Promise<{ tool: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool: slug } = await params;
  const toolData = getToolBySlug(slug);
  if (!toolData) return {};

  const canonical = `https://free-pdf-editor.org/${slug}`;

  return {
    title: toolData.seoTitle,
    description: toolData.seoDescription,
    keywords: toolData.keywords,
    alternates: { canonical },
    openGraph: {
      title: toolData.seoTitle,
      description: toolData.seoDescription,
      url: canonical,
      siteName: "PDF Tools",
      type: "website",
      locale: "en_US",
      images: [{ url: "https://free-pdf-editor.org/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: toolData.seoTitle,
      description: toolData.seoDescription,
      images: ["https://free-pdf-editor.org/og-image.png"],
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { tool: slug } = await params;
  const toolData = getToolBySlug(slug);
  if (!toolData) notFound();

  return (
    <main className="min-h-screen grid-bg">
      <Navbar />
      <div className="navbar-spacer" />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="py-8 sm:py-12 max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <nav className="hero-animate flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)", animationDelay: "0.05s" }}>
            <Link href="/" className="hover:opacity-80 transition-opacity">All Tools</Link>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{toolData.label}</span>
          </nav>

          {/* Tool header */}
          <div className="text-center mb-8">
            <div
              className="hero-animate inline-flex w-10 h-10 rounded-xl items-center justify-center mb-3"
              style={{ backgroundColor: toolData.color + "15", color: toolData.color, animationDelay: "0.05s" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h1
              className="hero-animate text-xl sm:text-2xl font-bold mb-1.5"
              style={{ color: "var(--text-primary)", animationDelay: "0.15s" }}
            >
              {toolData.h1}
            </h1>
            <p className="hero-animate text-sm" style={{ color: "var(--text-secondary)", animationDelay: "0.25s" }}>
              {toolData.shortDesc}
            </p>
          </div>

          {/* Tool component */}
          <ToolPageClient toolId={toolData.toolId} />

          {/* Ad between tool and content */}
          <AdSlot slot="tool-complete" format="rectangle" className="my-8" />

          {/* SEO content section */}
          <div className="mt-12 space-y-10">
            {/* Intro */}
            <section className="hero-animate" style={{ animationDelay: "0.1s" }}>
              {toolData.introText.split("\n\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed mb-4 last:mb-0"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {paragraph}
                </p>
              ))}
            </section>

            {/* How to Use */}
            <section
              className="hero-animate theme-card rounded-xl p-6"
              style={{ animationDelay: "0.2s" }}
            >
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                How to {toolData.label}
              </h2>
              <ol className="list-decimal list-inside space-y-2">
                {toolData.howToSteps.map((step, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            {/* Why Use Our Tool */}
            <section className="hero-animate" style={{ animationDelay: "0.3s" }}>
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Why Use Our {toolData.label} Tool
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {toolData.whyUseContent}
              </p>
            </section>

            {/* Privacy */}
            <section
              className="hero-animate theme-card rounded-xl p-6"
              style={{ animationDelay: "0.4s" }}
            >
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Your Privacy Matters
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {toolData.privacyBlurb}
              </p>
            </section>

            {/* FAQ Accordion */}
            {toolData.faqs.length > 0 && (
              <section className="hero-animate" style={{ animationDelay: "0.5s" }}>
                <h2
                  className="text-lg font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Frequently Asked Questions
                </h2>
                <div className="space-y-2">
                  {toolData.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="theme-card rounded-xl group"
                    >
                      <summary
                        className="flex items-center justify-between cursor-pointer p-4 text-sm font-medium select-none"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {faq.question}
                        <svg
                          className="w-4 h-4 shrink-0 ml-2 transition-transform duration-200 group-open:rotate-180"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <div
                        className="px-4 pb-4 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ Schema */}
            <FaqSchema faqs={toolData.faqs} />

            {/* Breadcrumb Schema */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://free-pdf-editor.org" },
                    { "@type": "ListItem", "position": 2, "name": toolData.label, "item": `https://free-pdf-editor.org/${slug}` }
                  ]
                })
              }}
            />

            {/* Email Capture */}
            <EmailCapture />

            {/* Related Tools */}
            <RelatedTools currentSlug={slug} />
          </div>
        </div>
      </div>

      {/* Ad: Above footer */}
      <AdSlot slot="footer-banner" format="horizontal" className="my-6 sm:my-8 max-w-3xl mx-auto px-4" />

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-primary)" }} className="mt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "var(--accent-primary)", color: "#fff" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <span className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>PDF Tools</span>
              </div>
              <p className="text-xs max-w-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Free, browser-based PDF tools. All processing happens locally — your files never leave your device.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <Link href="/guides" className="footer-link hover:opacity-80 transition-opacity">Guides</Link>
              <Link href="/faq" className="footer-link hover:opacity-80 transition-opacity">FAQ</Link>
              <Link href="/about" className="footer-link hover:opacity-80 transition-opacity">About</Link>
              <Link href="/privacy" className="footer-link hover:opacity-80 transition-opacity">Privacy</Link>
              <Link href="/terms" className="footer-link hover:opacity-80 transition-opacity">Terms</Link>
            </div>
          </div>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: "1px solid var(--border-secondary)" }}>
            <p className="text-xs" style={{ color: "var(--text-dim)" }}>
              &copy; {new Date().getFullYear()} PDF Tools. All rights reserved.
            </p>
            {process.env.NEXT_PUBLIC_COMMIT_HASH && (
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                Build v{process.env.NEXT_PUBLIC_COMMIT_HASH} &middot; {new Date(process.env.NEXT_PUBLIC_COMMIT_DATE || "").toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })}
              </p>
            )}
          </div>
        </div>
      </footer>

      <CookieConsent />
    </main>
  );
}
