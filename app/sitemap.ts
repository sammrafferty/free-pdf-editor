import type { MetadataRoute } from "next";
import { getAllSlugs } from "./lib/toolData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://free-pdf-editor.org";

  const toolPages = getAllSlugs().map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const guideArticles = [
    "how-to-split-pdf",
    "how-to-merge-pdfs",
    "how-to-compress-pdf",
    "how-to-convert-pdf-to-word",
    "how-to-rotate-pdf",
    "what-is-a-pdf",
    "how-to-edit-pdf-online",
    "how-to-reduce-pdf-size-for-email",
    "best-free-pdf-editors-2026",
    "pdf-vs-word-docx-differences",
    "how-to-password-protect-pdf",
    "how-to-add-watermark-to-pdf",
    "how-to-merge-pdfs-on-mac",
    "how-to-convert-pdf-to-word-on-iphone",
    "how-to-remove-pages-from-pdf",
  ].map((slug) => ({
    url: `${baseUrl}/guides/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    ...toolPages,
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    ...guideArticles,
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
  ];
}
