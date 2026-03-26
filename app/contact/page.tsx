import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
  title: "Contact Us — PDF Tools | Free Browser-Based PDF Suite",
  description: "Get in touch with PDF Tools. Report bugs, request features, or ask questions about our free browser-based PDF editor suite.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Us — PDF Tools",
    description: "Get in touch with PDF Tools. Report bugs, request features, or ask questions.",
    url: "/contact",
    siteName: "PDF Tools",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact PDF Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — PDF Tools",
    description: "Get in touch with PDF Tools.",
    images: ["/og-image.png"],
  },
};

export default function Contact() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://free-pdf-editor.org" },
              { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://free-pdf-editor.org/contact" }
            ]
          })
        }}
      />
      <Navbar />
      <div className="navbar-spacer" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight"
          style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Contact Us
        </h1>

        <div className="theme-prose max-w-none space-y-8 leading-relaxed">
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Whether you have a question, found a bug, or want to suggest a new feature, we would love to hear from you. PDF Tools is a small project and we read every message that comes in. Reaching out is the best way to help us improve the tools you rely on.
          </p>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Get in Touch</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              The fastest way to reach us is by email. Send your message to{" "}
              <a href="mailto:byu.iba.tech@gmail.com" className="theme-link hover:underline">byu.iba.tech@gmail.com</a>{" "}
              and we will get back to you as soon as we can. Please include as much detail as possible so we can help you effectively.
            </p>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>What to Expect</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              We aim to respond to all emails within one to two business days. During busy periods it may take slightly longer, but we do our best to reply promptly. Here is what we can help with:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Tool usage questions</strong> — If you are unsure how a tool works, need help with a specific file, or are getting unexpected results, let us know and we will walk you through it.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Bug reports</strong> — Something not working correctly? We want to know. See the section below for what information to include.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Feature requests</strong> — Have an idea for a new tool or improvement to an existing one? We are always looking for ways to make PDF Tools more useful.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>General feedback</strong> — Whether it is praise, criticism, or just a thought, we appreciate hearing from the people who use our tools.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Common Questions</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Before reaching out, you might find your answer in our{" "}
              <Link href="/faq" className="theme-link hover:underline">Frequently Asked Questions</Link> page. It covers topics like how file processing works, browser compatibility, supported formats, file size limits, and privacy. If your question is not answered there, do not hesitate to email us directly.
            </p>
          </div>

          <div className="theme-section p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Report a Bug</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              If you have encountered a problem with one of our tools, a detailed bug report helps us fix it much faster. When emailing us about a bug, please try to include the following:
            </p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--text-secondary)" }}>
              <li><strong style={{ color: "var(--text-primary)" }}>Which browser you are using</strong> — For example, Chrome 120, Firefox 121, Safari 17, or Edge 120. Include the version number if you know it.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Which tool caused the issue</strong> — Let us know which specific tool you were using (Split PDF, Merge PDFs, Compress PDF, etc.).</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Steps to reproduce</strong> — Walk us through exactly what you did before the problem appeared. For example: &ldquo;I uploaded a 50-page PDF, selected pages 10-20, and clicked Split. The download file was empty.&rdquo;</li>
              <li><strong style={{ color: "var(--text-primary)" }}>What you expected vs. what happened</strong> — Tell us what the tool should have done and what it actually did instead.</li>
              <li><strong style={{ color: "var(--text-primary)" }}>Device information</strong> — Whether you are on a desktop, laptop, tablet, or phone, and your operating system (Windows, macOS, Linux, iOS, Android).</li>
            </ul>
            <p style={{ color: "var(--text-secondary)" }}>
              You do not need to include all of these details, but the more information you provide, the quicker we can identify and resolve the issue. Never send us your actual PDF files unless we specifically ask — remember, your documents are private.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Space Grotesk', sans-serif" }}>Feature Requests</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              We are always looking to expand our tool suite and improve existing features. If there is a PDF operation you wish we supported, or if one of our current tools could work better for your use case, send us an email describing what you need. We prioritize features based on how many people request them and how feasible they are to build with browser-based processing. Every suggestion is logged and considered — many of our current tools started as user requests.
            </p>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <a href="mailto:byu.iba.tech@gmail.com" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: "#059669", borderRadius: "8px" }}>
              Send Us an Email
            </a>
            <Link href="/faq" className="text-sm theme-link hover:underline">Browse FAQ</Link>
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
