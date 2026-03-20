"use client";
import Link from "next/link";
import ThemeProvider from "./components/ThemeProvider";
import ToolSelector from "./components/ToolSelector";
import AdSlot from "./components/AdSlot";
import CookieConsent from "./components/CookieConsent";
import Logo from "./components/Logo";
import Navbar from "./components/Navbar";
import FeatureShowcase from "./components/FeatureShowcase";

function HomeContent() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen grid-bg">
      <Navbar onLogoClick={scrollToTop} />
      <div className="navbar-spacer" />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="py-12 sm:py-20">
          {/* Hero */}
          <div className="text-center mb-10 sm:mb-14">
            <h1
              className="hero-animate text-3xl sm:text-5xl font-bold mb-3 tracking-tight"
              style={{ color: "var(--text-primary)", animationDelay: "0.1s" }}
            >
              We Make PDF Easy.
            </h1>
            <p
              className="hero-animate text-sm sm:text-base max-w-md mx-auto leading-relaxed"
              style={{ color: "var(--text-secondary)", animationDelay: "0.25s" }}
            >
              All the tools you need to work with PDFs. Free, fast, and entirely in your browser — nothing gets uploaded.
            </p>
          </div>

          {/* Ad: Below hero */}
          <AdSlot slot="hero-banner" format="horizontal" className="my-6 sm:my-8 max-w-3xl mx-auto" />

          <div className="hero-animate" style={{ animationDelay: "0.4s" }}>
            <ToolSelector />
          </div>

          {/* Trust pills */}
          <div className="hero-animate mt-12 sm:mt-16 flex justify-center" style={{ animationDelay: "0.55s" }}>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {[
                { icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>, label: "100% Private" },
                { icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>, label: "No Upload Required" },
                { icon: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></>, label: "100% Free" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="trust-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{
                    color: "var(--text-muted)",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <FeatureShowcase />
      </div>

      {/* Ad: Above footer */}
      <AdSlot slot="footer-banner" format="horizontal" className="my-6 sm:my-8 max-w-3xl mx-auto px-4" />

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-primary)" }} className="mt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <Logo size={28} />
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

export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}
