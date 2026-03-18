"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100]"
      role="dialog"
      aria-label="Cookie consent"
      style={{ animation: "slideUp 0.5s ease-out" }}
    >
      <div
        className="backdrop-blur-xl"
        style={{
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-primary)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center gap-3">
          <p className="text-xs text-center sm:text-left flex-1" style={{ color: "var(--text-secondary)" }}>
            We use cookies for analytics and advertising. By continuing to use this site, you agree to our{" "}
            <Link href="/privacy" className="theme-link hover:underline">cookie policy</Link>.
          </p>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/privacy"
              className="text-xs font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Learn More
            </Link>
            <button
              onClick={accept}
              className="px-4 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{
                background: "var(--text-primary)",
                color: "var(--bg-primary)",
              }}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
