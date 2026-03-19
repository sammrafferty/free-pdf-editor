import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Tools — Free Browser-Based PDF Suite",
  description: "Free browser-based PDF tools. Split, merge, compress, convert, rotate, edit, watermark, sign, and redact PDFs — all in your browser. Nothing gets uploaded. 100% private.",
  keywords: "PDF tools, split PDF, merge PDF, compress PDF, convert PDF, PDF to Word, PDF to Excel, PDF to PowerPoint, image to PDF, rotate PDF, watermark PDF, sign PDF, free PDF tools, online PDF editor, browser PDF tools",
  icons: {
    icon: "/favicon.svg",
  },
  metadataBase: new URL("https://free-pdf-editor.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PDF Tools — Free Browser-Based PDF Suite",
    description: "Split, merge, compress, convert, edit, and sign PDFs — all free, all in your browser. Nothing gets uploaded.",
    url: "/",
    siteName: "PDF Tools",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDF Tools — Free Browser-Based PDF Suite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Tools — Free Browser-Based PDF Suite",
    description: "Split, merge, compress, convert, edit, and sign PDFs — all free, all in your browser.",
    images: ["/og-image.png"],
  },
  other: {
    "theme-color": "#1a1a1a",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a1a",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PDF Tools",
  description: "Free browser-based PDF tools. Split, merge, compress, convert, edit, and sign PDFs — all in your browser.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  browserRequirements: "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
  url: "https://free-pdf-editor.org",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Prevent FOUC: apply dark theme before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pdf-tools-theme');if(t==='light')document.documentElement.classList.add('light')}catch(e){}})()`,
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3111610108271548"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        {children}
      </body>
    </html>
  );
}
