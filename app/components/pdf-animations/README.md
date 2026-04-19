# PDF Animations — Next.js drop-in

Four looping, feature-section animations for PDF workflows (merge, edit/sign,
split, compress). Authored in React + TSX, no external runtime deps beyond
React itself. Animations pause when scrolled offscreen and respect
`prefers-reduced-motion`.

## Install

1. Copy the entire `pdf-animations/` folder into your project, e.g.
   `components/pdf-animations/`.

2. Add the required CSS variables somewhere global (e.g. `app/globals.css`).
   Dark values on `:root`, light overrides on `.light`:

   ```css
   :root {
     --bg-primary: #1a1a1a;
     --bg-secondary: #1e1e1e;
     --bg-elevated: #2e2e2e;
     --text-primary: #f5f5f4;
     --text-secondary: #a8a29e;
     --text-muted: #78716c;
     --accent-primary: #e8927c;
     --border-primary: rgba(255, 255, 255, 0.08);

     /* optional tuning (defaults baked in) */
     --pdf-paper: #f5f0e8;
     --pdf-ink: #2c1a0e;
     --pdf-paper-border: rgba(0, 0, 0, 0.2);
     --pdf-paper-shadow: 0 12px 32px rgba(0, 0, 0, 0.5),
       0 4px 10px rgba(0, 0, 0, 0.3);
     --pdf-edge: #b8ae99;
     --pdf-fold: #c9c3b7;
     --pdf-grid: rgba(255, 255, 255, 0.055);
     --pdf-bracket: rgba(245, 240, 232, 0.32);
     --pdf-ruler: rgba(245, 240, 232, 0.2);
     --pdf-ruler-label: rgba(245, 240, 232, 0.35);
   }

   html.light {
     --bg-primary: #fafaf9;
     --bg-secondary: #ffffff;
     --bg-elevated: #ffffff;
     --text-primary: #1c1917;
     --text-secondary: #57534e;
     --text-muted: #78716c;
     --accent-primary: #c2715c;
     --border-primary: rgba(0, 0, 0, 0.08);

     --pdf-paper: #ffffff;
     --pdf-ink: #3a3a3a;
     --pdf-paper-border: rgba(0, 0, 0, 0.1);
     --pdf-paper-shadow: 0 8px 24px rgba(0, 0, 0, 0.1),
       0 2px 6px rgba(0, 0, 0, 0.06);
     --pdf-edge: #d8cfbe;
     --pdf-fold: #e5e5e4;
     --pdf-grid: rgba(0, 0, 0, 0.055);
     --pdf-bracket: rgba(0, 0, 0, 0.32);
     --pdf-ruler: rgba(0, 0, 0, 0.2);
     --pdf-ruler-label: rgba(0, 0, 0, 0.35);
   }
   ```

   The components key off your existing `.light` class on `<html>` automatically —
   no prop passing, no context provider.

3. Fonts: the components use `Inter`, `Space Grotesk`, and `JetBrains Mono` via
   font-family declarations. You mentioned these are already loaded globally, so
   nothing more to do.

## Usage

### All four in a 2×2 grid (default)

```tsx
// app/(marketing)/page.tsx
import { PdfFeatureGrid } from '@/components/pdf-animations';

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="text-4xl font-semibold mb-4">Built for every PDF job.</h2>
      <p className="text-[var(--text-secondary)] mb-12 max-w-2xl">
        Merge, edit, split, and compress — all in one tool.
      </p>
      <PdfFeatureGrid />
    </section>
  );
}
```

### Individual scenes

```tsx
import { SceneStack, SceneEdit, SceneSplit, SceneCompress } from '@/components/pdf-animations';

<div className="grid md:grid-cols-2 gap-6">
  <SceneStack />
  <SceneEdit />
</div>
```

Each `Scene*` component is self-sized at 1:1 and fills its parent's width.
Put it in any container (a flex child, grid cell, div with `max-width: 500px`)
and it will scale cleanly.

## Files

```
pdf-animations/
├── index.ts                    — public exports
├── PdfFeatureGrid.tsx          — 2×2 grid wrapper
├── animation-engine.tsx        — time/easing/IntersectionObserver
├── primitives.tsx              — SceneFrame, PDFPage, annotations, rulers
└── scenes/
    ├── SceneStack.tsx          — Merge
    ├── SceneEdit.tsx           — Edit / Sign
    ├── SceneSplit.tsx          — Split
    └── SceneCompress.tsx       — Compress
```

## Performance notes

- **Offscreen pause.** Every scene wraps itself in `<SceneHost>`, which attaches
  an `IntersectionObserver` and stops the `requestAnimationFrame` loop when the
  scene leaves the viewport. No CPU cost when scrolled past.
- **Reduced motion.** If the user has `prefers-reduced-motion: reduce`, the
  scene freezes on a representative frame (~60% through the loop) instead of
  animating.
- **Component-size-aware scaling.** Each scene is authored at 420×420 and
  scaled via CSS container queries to fill any parent width while staying 1:1.
  No ResizeObservers, no JS layout.

## Browser support

Uses `container queries` (`container-type: size`) and `color-mix()` — both
shipping in every evergreen browser since 2023. No polyfills needed for modern
Next.js audiences.

## Customizing

- **Accent color** — change `--accent-primary` in your CSS. Every coral highlight
  updates.
- **Loop speed** — each scene's `SceneHost duration={6}` controls the loop in
  seconds. Timeline constants inside each scene's `Inner()` assume 6s; if you
  change it, rescale the timeline breakpoints proportionally.
- **Stop pausing offscreen** — pass `pauseOffscreen={false}` into `<SceneHost>`
  (requires editing the scene file).

## Gotchas

- Every scene file has `'use client'` at the top. They use hooks (`useState`,
  `useEffect`, `useRef`, `useContext`) and cannot be rendered as server
  components.
- If your app uses Tailwind's `dark:` strategy instead of a `.light` class,
  flip the CSS-var definitions: put dark values under `.dark`, light on `:root`.
