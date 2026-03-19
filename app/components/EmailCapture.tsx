"use client";
import { useState, useEffect, FormEvent } from "react";

export default function EmailCapture() {
  const [hidden, setHidden] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const captured = localStorage.getItem("pdf-tools-email-captured");
      const dismissed = localStorage.getItem("pdf-tools-email-dismissed");
      if (!captured && !dismissed) {
        setHidden(false);
      }
    } catch {
      // localStorage unavailable (private browsing) — hide the component
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try { localStorage.setItem("pdf-tools-email-captured", "true"); } catch { /* private browsing */ }
    setSubmitted(true);
  };

  const handleDismiss = () => {
    try { localStorage.setItem("pdf-tools-email-dismissed", "true"); } catch { /* private browsing */ }
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div
      className="mt-8 p-5 sm:p-6 theme-card animate-fade-in"
      style={{ borderColor: "var(--border-primary)" }}
    >
      {submitted ? (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg"
            style={{ backgroundColor: "var(--success-bg)", border: "1px solid var(--success-border)" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Thanks! You&apos;re subscribed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg"
              style={{ backgroundColor: "var(--accent-primary-muted)" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Get notified about new tools
              </p>
              <p
                className="text-xs mt-1 leading-snug"
                style={{ color: "var(--text-muted)" }}
              >
                Get updates when we launch new PDF tools. No spam, ever.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="theme-input px-3 py-1.5 text-sm w-48"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-4 py-1.5 text-sm font-medium rounded-xl transition-colors shrink-0"
                style={{
                  background: "var(--accent-primary)",
                  color: "#fff",
                  borderRadius: "var(--radius-md)",
                }}
              >
                Subscribe
              </button>
            </form>
            <button
              onClick={handleDismiss}
              className="text-xs transition-colors self-start sm:self-end"
              style={{ color: "var(--text-muted)" }}
            >
              No thanks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
