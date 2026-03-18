# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build (must pass with 0 errors before pushing)
- `npm run lint` — ESLint check (0 errors required, warnings acceptable)

## Project Overview
Free, browser-based PDF editor suite at **free-pdf-editor.org** (also pdf-tool-pi.vercel.app). 19 PDF tools that run 100% client-side — files never leave the browser. Built with Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4. Deployed on Vercel.

## Architecture

The app is a single-page tool suite. `app/page.tsx` renders a tool selector and dynamically loads the selected tool component. All 19 tools live in `app/components/tools/` and are imported via `next/dynamic()` for code splitting.

**How tool selection works:**
1. `ToolSelector` (categories: Popular, Organize, Edit, Sign, Convert) emits a tool type string
2. `page.tsx` maps the type to a dynamically imported component via `toolComponents` object
3. Selected tool renders in place, accepts files via shared `Dropzone` component

**Key files:**
- `app/page.tsx` — Main page with dynamic imports, tool mapping, header/footer
- `app/components/ToolSelector.tsx` — Tool grid with 5 categories and tool metadata
- `app/components/Dropzone.tsx` — Shared file upload (drag-and-drop via react-dropzone)
- `app/components/ThemeProvider.tsx` — Dark/light theme context with localStorage persistence
- `app/globals.css` — Theme system with CSS variables for both modes

**Content pages:** about, faq, guides (5 how-to articles), privacy, terms — each with SEO metadata exports.

## Tool Component Pattern

Every tool in `app/components/tools/` follows this structure:
1. `"use client"` directive
2. `useState` for `file`, `loading`, `error` (and tool-specific state)
3. `handleFile` loads PDF via `PDFDocument.load()` wrapped in try/catch
4. Processing function runs client-side, creates output
5. Download via: `Blob` → `URL.createObjectURL` → anchor click → `URL.revokeObjectURL`
6. Errors displayed in-UI via `setError()` with red styling

**Libraries by tool type:**
- PDF manipulation (split, merge, rotate, crop, etc.): `pdf-lib`
- PDF parsing/rendering (PDF→image, PDF→docx): `pdfjs-dist`
- PDF generation (Excel→PDF, PPTX→PDF): `jspdf` + `jspdf-autotable`
- Word conversion: `mammoth` (DOCX→HTML) + `docx` (HTML→DOCX)
- Excel: `xlsx`
- PowerPoint: `pptxgenjs`
- Images: `html2canvas`
- ZIP output: `jszip`

## Theme System

Dark mode is default (no class). Light mode adds `.light` to `<html>`. All colors use CSS variables defined in `globals.css`:
- Backgrounds: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-elevated`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-dim`
- Accent: `--accent-primary` (warm coral), `--accent-primary-muted`, `--accent-primary-hover`
- Errors: `--error-bg`, `--error-border`, `--error-text`

Component classes: `theme-card`, `theme-input`, `theme-error`, `theme-button-disabled`, etc.

## SEO Requirements

Every page must export `metadata` with: `title`, `description`, `alternates.canonical` (full URL), `openGraph` (title, description, url, siteName, type, locale, images), `twitter` (card, title, description, images). Sitemap at `public/sitemap.xml` must include all routes.

## Build-Time Git Injection

`next.config.ts` injects `NEXT_PUBLIC_COMMIT_HASH` and `NEXT_PUBLIC_COMMIT_DATE` from git at build time. The footer displays these as a subtle version watermark.

## Adding a New Tool
1. Create `app/components/tools/NewTool.tsx` following the tool component pattern above
2. Add dynamic import in `app/page.tsx`: `const NewTool = dynamic(() => import("./components/tools/NewTool"))`
3. Add to `toolMeta` and `toolComponents` in `app/page.tsx`
4. Add to appropriate category in `app/components/ToolSelector.tsx`
5. Add URL to `public/sitemap.xml`

## Rules
- All file processing must be client-side — never upload to a server
- Use `setError()` + in-UI display for errors, never `alert()`
- Use CSS variables for colors, never hardcode
- Use `next/dynamic()` for tool imports, never static imports
- Use `@ts-expect-error` over `@ts-ignore` when suppression is needed
- Error containers use red styling (`border-red-500/30 bg-red-500/10`), not green
