'use client';

// primitives.tsx
// ────────────────────────────────────────────────────────────────────────
// Shared visual building blocks: the blueprint frame, 3D PDF page,
// annotations, dimension lines, rulers, readouts.
//
// Theming:
//   Colors are read from CSS custom properties defined on :root (dark) and
//   .light :root (light). The component does NOT accept a `theme` prop —
//   it simply uses these vars. Make sure your app defines them.
//
//   Required CSS vars:
//     --bg-primary, --bg-secondary, --bg-elevated
//     --text-primary, --text-secondary, --text-muted
//     --accent-primary
//     --border-primary
//
//   Additionally used (with fallbacks baked in):
//     --pdf-paper, --pdf-ink, --pdf-paper-border

import type { CSSProperties, ReactNode } from 'react';
import { clamp } from './animation-engine';

// ─── Font stacks (match globally-loaded Google Fonts) ───────────────────
export const MONO =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";
export const SANS =
  "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
export const HEAD =
  "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif";

// ─── CSS var helpers ─────────────────────────────────────────────────────
const v = (name: string, fallback?: string) =>
  fallback ? `var(${name}, ${fallback})` : `var(${name})`;

// ─── Dot grid background ────────────────────────────────────────────────
export function DotGrid() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(circle, ${v(
          '--pdf-grid',
          'rgba(255,255,255,0.055)'
        )} 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Corner brackets ─────────────────────────────────────────────────────
export function CornerBrackets({ size = 14, inset = 14 }: { size?: number; inset?: number }) {
  const color = v('--pdf-bracket', 'rgba(245,240,232,0.32)');
  const S = size;
  const I = inset;
  const corners = [
    { top: I, left: I, d: `M0,${S} L0,0 L${S},0` },
    { top: I, right: I, d: `M0,0 L${S},0 L${S},${S}` },
    { bottom: I, left: I, d: `M0,0 L0,${S} L${S},${S}` },
    { bottom: I, right: I, d: `M0,${S} L${S},${S} L${S},0` },
  ];
  return (
    <>
      {corners.map((cn, i) => (
        <svg
          key={i}
          width={S}
          height={S}
          style={{ position: 'absolute', ...cn, pointerEvents: 'none' }}
        >
          <path d={cn.d} fill="none" stroke={color} strokeWidth="1" />
        </svg>
      ))}
    </>
  );
}

// ─── Scene frame ────────────────────────────────────────────────────────
export function SceneFrame({
  label,
  number,
  children,
  width = 420,
  height = 420,
  responsive = true,
}: {
  label: string;
  number: string;
  children: ReactNode;
  width?: number;
  height?: number;
  responsive?: boolean;
}) {
  // responsive=true -> fills parent width, maintains 1:1
  const outer: CSSProperties = responsive
    ? { width: '100%', aspectRatio: '1 / 1', position: 'relative' }
    : { width, height: height + 32 };

  return (
    <div
      style={{
        ...outer,
        background: v('--bg-primary'),
        border: `1px solid ${v('--border-primary', 'rgba(255,255,255,0.08)')}`,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: `1px solid ${v('--border-primary', 'rgba(255,255,255,0.08)')}`,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: v('--text-muted', '#78716c'),
          flexShrink: 0,
        }}
      >
        <span>{number}</span>
        <span style={{ color: v('--text-primary'), fontWeight: 500 }}>{label}</span>
        <span style={{ opacity: 0.6 }}>1:1</span>
      </div>
      {/* canvas */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          background: v('--bg-secondary'),
          overflow: 'hidden',
        }}
      >
        <SceneScaler designWidth={width} designHeight={height}>
          <DotGrid />
          <CornerBrackets />
          {children}
        </SceneScaler>
      </div>
    </div>
  );
}

// ─── SceneScaler ────────────────────────────────────────────────────────
// The scenes are authored at a fixed design size (420×420). This wrapper
// places them in a fixed-size inner box and scales it to fit the responsive
// container. Keeps absolute pixel coords in the scenes correct.
function SceneScaler({
  designWidth,
  designHeight,
  children,
}: {
  designWidth: number;
  designHeight: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        containerType: 'size',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: designWidth,
          height: designHeight,
          transform: `translate(-50%, -50%) scale(min(100cqw / ${designWidth}, 100cqh / ${designHeight}))`,
          transformOrigin: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── 3D PDF page ────────────────────────────────────────────────────────
export function PDFPage({
  x = 50,
  y = 50,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  z = 0,
  scale = 1,
  width = 140,
  height = 180,
  content = 'full',
  highlight = 0,
  signature = 0,
  typed = 1,
  opacity = 1,
  cornerFold = 0,
}: {
  x?: number;
  y?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  z?: number;
  scale?: number;
  width?: number;
  height?: number;
  content?: 'full' | 'lines' | 'blank' | ReactNode;
  highlight?: number;
  signature?: number;
  typed?: number;
  opacity?: number;
  cornerFold?: number;
}) {
  const paper = v('--pdf-paper', '#f5f0e8');
  const ink = v('--pdf-ink', '#2c1a0e');
  const paperBorder = v('--pdf-paper-border', 'rgba(0,0,0,0.2)');
  const accent = v('--accent-primary', '#e8927c');

  const lineColor = `color-mix(in srgb, ${v('--pdf-ink', '#2c1a0e')} 33%, transparent)`;
  const titleColor = `color-mix(in srgb, ${v('--pdf-ink', '#2c1a0e')} 87%, transparent)`;

  const nLines = 9;
  const lineWidths = [0.9, 0.72, 0.85, 0.6, 0.78, 0.92, 0.5, 0.68, 0.3];
  const lines = [];
  for (let i = 0; i < nLines; i++) {
    const w = lineWidths[i];
    const partial = clamp(typed * nLines - i, 0, 1);
    lines.push(
      <div
        key={i}
        style={{
          height: 3.5,
          marginTop: i === 0 ? 8 : 6,
          width: `${w * 100 * partial}%`,
          background: lineColor,
          borderRadius: 1,
        }}
      />
    );
  }

  const showHighlight = highlight > 0;
  const highlightRow = 4;
  const highlightWidth = clamp(highlight, 0, 1);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        transform: `translate(-50%,-50%) translateZ(${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center',
        opacity,
        willChange: 'transform, opacity',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: paper,
          border: `1px solid ${paperBorder}`,
          borderRadius: 2,
          boxShadow: `var(--pdf-paper-shadow, 0 12px 32px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3))`,
          padding: '12px 14px 14px',
          overflow: 'hidden',
        }}
      >
        {content === 'full' && (
          <>
            <div
              style={{
                height: 6,
                width: `${typed >= 0.05 ? 56 : 0}%`,
                background: titleColor,
                borderRadius: 1,
                marginBottom: 8,
              }}
            />
            {showHighlight && (
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 32 + highlightRow * 9.5,
                  height: 7,
                  width: `${(width - 28) * highlightWidth}px`,
                  background: `color-mix(in srgb, ${accent} 33%, transparent)`,
                  borderRadius: 1,
                  mixBlendMode: 'multiply',
                }}
              />
            )}
            {lines}
            {signature > 0 && (
              <SignatureLine progress={signature} color={accent} width={width - 36} />
            )}
          </>
        )}
        {content === 'blank' && null}
        {content === 'lines' && lines}
        {typeof content === 'object' && content}
      </div>
      {cornerFold > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: cornerFold * 18,
            height: cornerFold * 18,
            background: `linear-gradient(225deg, ${v('--pdf-fold', '#c9c3b7')} 50%, transparent 50%)`,
            boxShadow: '-1px 1px 2px rgba(0,0,0,0.1)',
          }}
        />
      )}
    </div>
  );
}

// ─── Signature stroke ───────────────────────────────────────────────────
export function SignatureLine({
  progress,
  color,
  width,
}: {
  progress: number;
  color: string;
  width: number;
}) {
  const d =
    'M4,28 C-2,10 10,-2 22,6 C30,12 24,22 18,26 C24,30 34,24 42,18 C50,12 56,20 52,26 C58,24 66,14 74,20 C80,24 76,30 70,30 C78,32 90,24 100,18 C110,12 120,20 116,28 C112,34 60,38 18,34';
  const pathLen = 240;
  const visible = pathLen * progress;
  return (
    <div
      style={{
        position: 'absolute',
        left: 10,
        bottom: 8,
        width: width + 8,
        height: 50,
      }}
    >
      <svg viewBox="0 0 120 40" width={width + 8} height={50} style={{ overflow: 'visible' }}>
        <line
          x1="0"
          y1="38"
          x2="120"
          y2="38"
          stroke={`color-mix(in srgb, ${color} 16%, transparent)`}
          strokeWidth="0.4"
          strokeDasharray="1 2"
        />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLen}
          strokeDashoffset={pathLen - visible}
        />
      </svg>
    </div>
  );
}

// ─── Annotation (label + leader line) ───────────────────────────────────
export function Annotation({
  x,
  y,
  lx,
  ly,
  text,
  show = 1,
  align = 'left',
}: {
  x: number;
  y: number;
  lx: number;
  ly: number;
  text: string;
  show?: number;
  align?: 'left' | 'right' | 'center';
}) {
  const accent = v('--accent-primary', '#e8927c');
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: show,
      }}
    >
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <line
          x1={lx}
          y1={ly}
          x2={x}
          y2={y}
          stroke={accent}
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        <circle cx={x} cy={y} r="2" fill={accent} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: lx,
          top: ly,
          transform:
            align === 'right'
              ? 'translate(-100%, -100%)'
              : align === 'center'
              ? 'translate(-50%, -100%)'
              : 'translate(0, -100%)',
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: v('--text-secondary', 'rgba(245,240,232,0.75)'),
          background: v('--bg-elevated', 'rgba(30,30,30,0.9)'),
          padding: '3px 6px',
          border: `1px solid color-mix(in srgb, ${accent} 33%, transparent)`,
          borderRadius: 3,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ color: accent, marginRight: 4 }}>◆</span>
        {text}
      </div>
    </div>
  );
}

// ─── Dimension line ─────────────────────────────────────────────────────
export function DimensionLine({
  x1,
  y1,
  x2,
  y2,
  label,
  offset = 0,
  show = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  offset?: number;
  show?: number;
}) {
  const accent = v('--accent-primary', '#e8927c');
  const textColor = v('--text-primary');
  const bg = v('--bg-secondary');

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / (len || 1);
  const ny = dx / (len || 1);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: show }}>
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <line
          x1={x1}
          y1={y1}
          x2={x1 + nx * offset}
          y2={y1 + ny * offset}
          stroke={accent}
          strokeWidth="0.75"
          opacity="0.6"
        />
        <line
          x1={x2}
          y1={y2}
          x2={x2 + nx * offset}
          y2={y2 + ny * offset}
          stroke={accent}
          strokeWidth="0.75"
          opacity="0.6"
        />
        <line
          x1={x1 + nx * offset}
          y1={y1 + ny * offset}
          x2={x2 + nx * offset}
          y2={y2 + ny * offset}
          stroke={accent}
          strokeWidth="1"
        />
        <Arrowhead
          cx={x1 + nx * offset}
          cy={y1 + ny * offset}
          angle={Math.atan2(-dy, -dx)}
          color={accent}
        />
        <Arrowhead
          cx={x2 + nx * offset}
          cy={y2 + ny * offset}
          angle={Math.atan2(dy, dx)}
          color={accent}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: mx + nx * offset,
          top: my + ny * offset,
          transform: 'translate(-50%, -50%)',
          fontFamily: MONO,
          fontSize: 10,
          color: textColor,
          background: bg,
          padding: '1px 6px',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Arrowhead({
  cx,
  cy,
  angle,
  color,
}: {
  cx: number;
  cy: number;
  angle: number;
  color: string;
}) {
  const size = 5;
  const a1 = angle + Math.PI - 0.35;
  const a2 = angle + Math.PI + 0.35;
  return (
    <polyline
      points={`${cx + Math.cos(a1) * size},${cy + Math.sin(a1) * size} ${cx},${cy} ${
        cx + Math.cos(a2) * size
      },${cy + Math.sin(a2) * size}`}
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

// ─── Edge ruler ─────────────────────────────────────────────────────────
export function EdgeRuler({
  orientation = 'bottom',
  size = 420,
}: {
  orientation?: 'top' | 'bottom' | 'left' | 'right';
  size?: number;
}) {
  const color = v('--pdf-ruler', 'rgba(245,240,232,0.2)');
  const labelColor = v('--pdf-ruler-label', 'rgba(245,240,232,0.35)');
  const ticks: number[] = [];
  const step = 40;
  for (let vv = 0; vv <= size; vv += step) ticks.push(vv);

  const isHoriz = orientation === 'top' || orientation === 'bottom';

  return (
    <div
      style={{
        position: 'absolute',
        ...(orientation === 'bottom' ? { left: 0, right: 0, bottom: 0, height: 18 } : {}),
        ...(orientation === 'top' ? { left: 0, right: 0, top: 0, height: 18 } : {}),
        ...(orientation === 'left' ? { left: 0, top: 0, bottom: 0, width: 22 } : {}),
        ...(orientation === 'right' ? { right: 0, top: 0, bottom: 0, width: 22 } : {}),
        pointerEvents: 'none',
      }}
    >
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        {ticks.map((vv) => {
          const long = vv % 80 === 0;
          if (isHoriz) {
            return (
              <g key={vv}>
                <line
                  x1={vv}
                  y1={orientation === 'bottom' ? 0 : 18}
                  x2={vv}
                  y2={
                    orientation === 'bottom' ? (long ? 6 : 3) : long ? 12 : 15
                  }
                  stroke={color}
                  strokeWidth="1"
                />
                {long && (
                  <text
                    x={vv + 3}
                    y={orientation === 'bottom' ? 14 : 12}
                    fontSize="8"
                    fontFamily={MONO}
                    fill={labelColor}
                  >
                    {vv}
                  </text>
                )}
              </g>
            );
          }
          return (
            <g key={vv}>
              <line
                x1={orientation === 'right' ? 0 : 22}
                y1={vv}
                x2={orientation === 'right' ? (long ? 6 : 3) : long ? 16 : 19}
                y2={vv}
                stroke={color}
                strokeWidth="1"
              />
              {long && (
                <text
                  x={orientation === 'right' ? 8 : 2}
                  y={vv - 3}
                  fontSize="8"
                  fontFamily={MONO}
                  fill={labelColor}
                >
                  {vv}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── 3D Stage wrapper ───────────────────────────────────────────────────
export function Stage3D({
  children,
  perspective = 900,
}: {
  children: ReactNode;
  perspective?: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Progress readout ───────────────────────────────────────────────────
export function ProgressReadout({ text }: { text: string }) {
  const accent = v('--accent-primary', '#e8927c');
  return (
    <div
      style={{
        position: 'absolute',
        left: 18,
        bottom: 26,
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: v('--text-muted', '#78716c'),
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 6px ${accent}`,
        }}
      />
      {text}
    </div>
  );
}
