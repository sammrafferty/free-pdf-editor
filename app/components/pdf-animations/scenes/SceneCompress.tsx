'use client';

// SceneCompress — COMPRESS animation
// A PDF page shrinks with dimensional arrows, filesize ticks down,
// and a reduction ratio appears at the end.

import { SceneHost, useTime, Easing, clamp } from '../animation-engine';
import {
  SceneFrame,
  Stage3D,
  PDFPage,
  DimensionLine,
  ProgressReadout,
  EdgeRuler,
  MONO,
} from '../primitives';

function SqueezeArrow({
  x,
  y,
  angle,
  opacity,
}: {
  x: number;
  y: number;
  angle: number;
  opacity: number;
}) {
  const accent = 'var(--accent-primary, #e8927c)';
  return (
    <svg
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        opacity,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
      width="20"
      height="14"
      viewBox="-10 -7 20 14"
    >
      <path
        d="M-8,0 L6,0 M2,-5 L6,0 L2,5"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Inner() {
  const time = useTime();
  const DUR = 6;
  const t = time % DUR;
  const accent = 'var(--accent-primary, #e8927c)';

  const intro = clamp(t / 0.7, 0, 1);
  const introEase = Easing.easeOutCubic(intro);

  const compressStart = 1.8;
  const compressEnd = 3.6;
  const compress = clamp((t - compressStart) / (compressEnd - compressStart), 0, 1);
  const compressEase = Easing.easeInOutCubic(compress);

  const arriveShow = clamp((t - 3.6) / 0.5, 0, 1);
  const outro = clamp((t - 5.4) / 0.6, 0, 1);

  const cx = 210;
  const cy = 205;

  const beforeW = 180;
  const beforeH = 232;
  const afterW = 110;
  const afterH = 142;
  const pw = beforeW + (afterW - beforeW) * compressEase;
  const ph = beforeH + (afterH - beforeH) * compressEase;

  const beforeSize = 12.4;
  const afterSize = 2.1;
  const fs = beforeSize + (afterSize - beforeSize) * compressEase;

  const jiggle =
    compress > 0 && compress < 1
      ? Math.sin(t * 60) * 0.6 * (1 - Math.abs(compress - 0.5) * 2)
      : 0;

  const pageOp = introEase * (1 - outro);

  return (
    <>
      <EdgeRuler orientation="bottom" size={420} />

      <Stage3D perspective={1000}>
        {compress > 0.05 && compress < 0.98 && (
          <div
            style={{
              position: 'absolute',
              left: cx - beforeW / 2,
              top: cy - beforeH / 2,
              width: beforeW,
              height: beforeH,
              border: `1px dashed color-mix(in srgb, ${accent} 40%, transparent)`,
              borderRadius: 2,
              opacity: (1 - compress) * 0.8,
            }}
          />
        )}

        <PDFPage
          x={cx + jiggle}
          y={cy}
          rotateX={6}
          rotateY={-6}
          width={pw}
          height={ph}
          opacity={pageOp}
          content="full"
          typed={1}
        />

        {compress > 0 && compress < 1 && (
          <>
            <SqueezeArrow
              x={cx - pw / 2 - 24}
              y={cy}
              angle={0}
              opacity={Math.sin(compress * Math.PI) * 0.9}
            />
            <SqueezeArrow
              x={cx + pw / 2 + 24}
              y={cy}
              angle={180}
              opacity={Math.sin(compress * Math.PI) * 0.9}
            />
          </>
        )}
      </Stage3D>

      {intro > 0.5 && compress < 0.4 && (
        <DimensionLine
          x1={cx - beforeW / 2}
          y1={cy + beforeH / 2}
          x2={cx + beforeW / 2}
          y2={cy + beforeH / 2}
          label={`W · ${beforeW}`}
          offset={20}
          show={
            clamp((intro - 0.5) * 2, 0, 1) *
            (1 - clamp((compress - 0.2) * 3, 0, 1))
          }
        />
      )}

      {arriveShow > 0 && (
        <DimensionLine
          x1={cx - afterW / 2}
          y1={cy + afterH / 2}
          x2={cx + afterW / 2}
          y2={cy + afterH / 2}
          label={`W · ${afterW}`}
          offset={20}
          show={arriveShow * (1 - outro)}
        />
      )}

      <div
        style={{
          position: 'absolute',
          left: 28,
          top: 40,
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: '0.08em',
          color: 'var(--text-primary)',
          opacity: pageOp,
        }}
      >
        <div
          style={{
            fontSize: 8,
            opacity: 0.6,
            letterSpacing: '0.15em',
            color: 'var(--text-muted, #78716c)',
          }}
        >
          FILESIZE
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: compress > 0 && compress < 1 ? accent : 'inherit',
          }}
        >
          {fs.toFixed(1)}{' '}
          <span style={{ fontSize: 12, opacity: 0.7 }}>MB</span>
        </div>
        <div
          style={{
            marginTop: 6,
            width: 100,
            height: 3,
            background:
              'color-mix(in srgb, var(--text-primary) 8%, transparent)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(1 - compressEase * (1 - afterSize / beforeSize)) * 100}%`,
              height: '100%',
              background: accent,
            }}
          />
        </div>
      </div>

      {arriveShow > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 28,
            top: 40,
            fontFamily: MONO,
            fontSize: 11,
            color: accent,
            textAlign: 'right',
            opacity: arriveShow * (1 - outro),
            letterSpacing: '0.08em',
          }}
        >
          <div
            style={{
              fontSize: 8,
              opacity: 0.6,
              letterSpacing: '0.15em',
              color: 'var(--text-muted, #78716c)',
            }}
          >
            REDUCED
          </div>
          <div style={{ fontSize: 22, fontWeight: 500 }}>
            −{Math.round((1 - afterSize / beforeSize) * 100)}
            <span style={{ fontSize: 12, opacity: 0.7 }}>%</span>
          </div>
        </div>
      )}

      <ProgressReadout
        text={
          t < 0.7
            ? 'SCAN'
            : t < 1.8
            ? 'ANALYZE'
            : t < 3.6
            ? `COMPRESS · ${String(Math.floor(compressEase * 100)).padStart(3, '0')}%`
            : t < 5.4
            ? 'OPTIMIZED'
            : 'DONE'
        }
      />
    </>
  );
}

export function SceneCompress() {
  return (
    <SceneHost duration={6}>
      <SceneFrame label="COMPRESS" number="04">
        <Inner />
      </SceneFrame>
    </SceneHost>
  );
}
