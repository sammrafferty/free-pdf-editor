import Link from "next/link";
import { TOOLS } from "@/app/lib/toolData";

export default function RelatedTools({ currentSlug }: { currentSlug: string }) {
  const currentTool = TOOLS[currentSlug];
  if (!currentTool) return null;

  const relatedSlugs = currentTool.relatedTools;
  if (!relatedSlugs || relatedSlugs.length === 0) return null;

  const relatedTools = relatedSlugs
    .map((slug) => TOOLS[slug])
    .filter(Boolean);

  return (
    <section className="mt-12 sm:mt-16">
      <h2
        className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        Related Tools
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {relatedTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${tool.slug}`}
            className="group flex items-center gap-3.5 p-4 sm:p-5 no-underline theme-card"
          >
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0 rounded-lg group-hover:scale-110 transition-transform duration-200"
              style={{ backgroundColor: tool.color + "15", color: tool.color }}
            >
              <span className="block w-4 h-4 rounded-sm" style={{ backgroundColor: tool.color }} />
            </div>
            <div className="min-w-0">
              <div
                className="font-medium text-sm leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {tool.label}
              </div>
              <div
                className="text-xs leading-snug mt-0.5 truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {tool.shortDesc}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
