# CLAUDE.md — free-pdf-editor

## Project Overview
Free, browser-based PDF editor suite at **free-pdf-editor.org**. All processing happens client-side (no server uploads). Built with Next.js 16 + React 19, deployed on Vercel.

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build (must pass before pushing)
- `npm run lint` — ESLint check (0 errors required, warnings ok)

## Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS 4, CSS variables for theming (dark/light)
- **PDF libs:** pdf-lib (manipulation), pdfjs-dist (parsing/viewing), jspdf (generation)
- **Conversion libs:** mammoth/docx (Word), xlsx (Excel), pptxgenjs (PowerPoint), html2canvas (images)
- **Other:** react-dropzone, jszip

## Architecture
- `app/page.tsx` — Main page, tool selector + all 19 tool components
- `app/components/tools/` — 19 tool components (one per PDF operation), all dynamically imported via `next/dynamic()`
- `app/components/` — Shared components (Dropzone, ToolSelector, ThemeProvider, CookieConsent, AdSlot)
- `app/*/page.tsx` — Content pages (about, faq, guides, privacy, terms)
- `public/` — Static assets, sitemap.xml, robots.txt

## Key Patterns
- **All tools follow the same pattern:** Accept file via Dropzone → process client-side → download result via blob URL
- **Error handling:** Use `setError()` state + in-UI error display. Never use `alert()`.
- **Error styling:** Red border/background for errors (`border-red-500/30 bg-red-500/10`), not green.
- **Theme colors:** Use CSS variables (`--accent-primary`, `--bg-primary`, etc.) from globals.css. Don't hardcode colors.
- **Dynamic imports:** All tool components in page.tsx use `next/dynamic()` for code splitting. New tools must follow this pattern.
- **SEO:** Every page needs metadata export with title, description, openGraph, twitter, and alternates.canonical.

## Adding a New Tool
1. Create component in `app/components/tools/NewTool.tsx`
2. Add dynamic import in `app/page.tsx`
3. Add to ToolSelector categories in `app/components/ToolSelector.tsx`
4. Add route to `public/sitemap.xml`

## Don'ts
- Don't upload files to any server — everything must stay client-side
- Don't use `alert()` for errors — use in-UI error state
- Don't use `@ts-ignore` — use `@ts-expect-error` if absolutely needed
- Don't statically import tool components — use `next/dynamic()`
