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
      className="fixed bottom-0 left-0 right-0 z-[100] transform transition-transform duration-500 ease-out"
      style={{ animation: "slideUp 0.5s ease-out" }}
    >
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <p className="text-sm text-gray-600 text-center sm:text-left flex-1">
            We use cookies for analytics and advertising. By continuing to use this site, you agree to our{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">cookie policy</Link>.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/privacy"
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Learn More
            </Link>
            <button
              onClick={accept}
              className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
