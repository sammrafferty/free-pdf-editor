import type { Metadata, Viewport } from "next";
import Script from "next/script";
import PostHogProvider from "./components/PostHogProvider";
import PageTransition from "./components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free PDF Editor — Split, Merge, Compress & Convert PDFs Online",
  description: "Free online PDF editor with 19 tools: split, merge, compress, rotate, delete pages, extract pages, watermark, number pages, crop, redact, sign, convert between PDF and Word, Excel, PowerPoint, and images — all in your browser. Nothing gets uploaded. 100% private.",
  keywords: "free PDF editor, edit PDF online, split PDF, merge PDF, compress PDF, convert PDF, PDF to Word, PDF to Excel, rotate PDF, watermark PDF, sign PDF, free PDF tools, online PDF editor, browser PDF tools",
  icons: {
    icon: "/favicon.svg",
  },
  metadataBase: new URL("https://free-pdf-editor.org"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Free PDF Editor — Split, Merge, Compress & Convert PDFs Online",
    description: "Split, merge, compress, convert, edit, and sign PDFs — all free, all in your browser. Nothing gets uploaded.",
    url: "/",
    siteName: "Free PDF Editor",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Free PDF Editor — Edit PDFs Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free PDF Editor — Split, Merge, Compress & Convert PDFs Online",
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
  name: "Free PDF Editor",
  description: "Free online PDF editor. Split, merge, compress, convert, edit, and sign PDFs — all in your browser.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  browserRequirements: "Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.",
  url: "https://free-pdf-editor.org",
  featureList: [
    "Split PDF",
    "Merge PDFs",
    "Compress PDF",
    "Rotate Pages",
    "Delete Pages",
    "Extract Pages",
    "Watermark",
    "Number Pages",
    "Crop PDF",
    "Redact",
    "Sign PDF",
    "Image to PDF",
    "PDF to Image",
    "PDF to Word",
    "Word to PDF",
    "PDF to Excel",
    "Excel to PDF",
    "PDF to PowerPoint",
    "PowerPoint to PDF",
  ],
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
        <PostHogProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </PostHogProvider>
      </body>
    </html>
  );
}
