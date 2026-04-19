'use client';

// SceneStack — MERGE / STACK animation
// 6s loop. Four scattered PDFs spin in, magnetically snap into a cascade,
// compress into a stack, reveal thickness, then get bound with a coral spine.

import { SceneHost, useTime, Easing, clamp } from '../animation-engine';
import {
  SceneFrame,
  Stage3D,
  PDFPage,
  ProgressReadout,
  EdgeRuler,
  MONO,
} from '../primitives';

function accentCss(fallback = '#e8927c') {
  return `var(--accent-primary, ${fallback})`;
}
function textMutedCss() {
  return `var(--text-muted, #78716c)`;
}

function Inner() {
  const time = useTime();
  const DUR = 6;
  const t = time % DUR;

  const cx = 220;
  const cy = 210;
  const accent = accentCss();

  const pageConfigs = [
    { startX: -160, startY: -120, startRZ: -25, startRY: 35, delay: 0.0 },
    { startX: 170, startY: -110, startRZ: 20, startRY: -30, delay: 0.12 },
    { startX: -150, startY: 130, startRZ: 18, startRY: 25, delay: 0.24 },
    { startX: 165, startY: 125, startRZ: -22, startRY: -40, delay: 0.36 },
  ];

  const entry = (i: number) => clamp((t - pageConfigs[i].delay) / 1.2, 0, 1);

  const snap = clamp((t - 1.8) / 1.4, 0, 1);
  const snapE = Easing.easeInOutCubic(snap);
  const compress = clamp((t - 3.2) / 1.0, 0, 1);
  const compressE = Easing.easeOutCubic(compress);
  const reveal = clamp((t - 4.2) / 0.8, 0, 1);
  const revealE = Easing.easeInOutCubic(reveal);
  const bind = clamp((t - 5.0) / 0.7, 0, 1);
  const bindE = Easing.easeOutCubic(bind);
  const loopFade = 1 - clamp((t - 5.7) / 0.3, 0, 1);

  const pageLayout = (i: number) => {
    const cfg = pageConfigs[i];
    const eE = Easing.easeOutCubic(entry(i));

    const scatterX =
      cx + cfg.startX * 1.8 + (cfg.startX - cfg.startX * 1.8) * eE;
    const scatterY =
      cy + cfg.startY * 1.5 + (cfg.startY - cfg.startY * 1.5) * eE;

    const driftTime = Math.max(0, t - (cfg.delay + 1.2));
    const drift = Math.sin(driftTime * 1.2 + i) * 3;

    const stackOffsetX = (i - 1.5) * 5;
    const stackOffsetY = (i - 1.5) * 6;
    const spindleX = cx + stackOffsetX;
    const spindleY = cy + stackOffsetY;
    const finalX = cx + stackOffsetX * 0.4;
    const finalY = cy + stackOffsetY * 0.4;

    const x =
      scatterX + (spindleX - scatterX) * snapE + (finalX - spindleX) * compressE;
    const y =
      scatterY + (spindleY - scatterY) * snapE + (finalY - spindleY) * compressE;
    const rz = cfg.startRZ * (1 - snapE) + drift * (1 - snapE);
    const ry = cfg.startRY * (1 - snapE);
    const rx = 8 * (1 - snapE);

    const zBase = (i - 1.5) * 8;
    const z = zBase + zBase * compressE * 0.5;
    const scale = 1 + (1 - eE) * 0.15;

    return { x, y, rotateX: rx, rotateY: ry, rotateZ: rz, z, scale, opacity: eE };
  };

  return (
    <>
      <EdgeRuler orientation="bottom" size={420} />

      <div style={{ opacity: loopFade, position: 'absolute', inset: 0 }}>
        {snap > 0.1 && snap < 0.95 && (
          <div
            style={{
              position: 'absolute',
              left: cx,
              top: cy - 110,
              width: 1,
              height: 220,
              background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${accent} 53%, transparent), transparent)`,
              opacity: Math.sin(snap * Math.PI) * 0.8,
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
              boxShadow: `0 0 12px color-mix(in srgb, ${accent} 40%, transparent)`,
            }}
          />
        )}

        {snap > 0.05 && snap < 0.85 && (
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            {[0, 1, 2, 3].map((i) => {
              const L = pageLayout(i);
              const pulse = Math.sin(snap * Math.PI);
              return (
                <path
                  key={i}
                  d={`M ${L.x},${L.y} Q ${(L.x + cx) / 2},${
                    (L.y + cy) / 2 - 20
                  } ${cx},${cy}`}
                  fill="none"
                  stroke={accent}
                  strokeWidth="0.75"
                  strokeDasharray="2 3"
                  opacity={pulse * 0.4}
                />
              );
            })}
          </svg>
        )}

        <Stage3D perspective={1100}>
          {[0, 1, 2, 3].map((i) => {
            const L = pageLayout(i);
            return (
              <PDFPage
                key={i}
                x={L.x}
                y={L.y}
                rotateX={L.rotateX}
                rotateY={L.rotateY}
                rotateZ={L.rotateZ}
                z={L.z}
                scale={L.scale}
                opacity={L.opacity}
                width={120}
                height={155}
                content="full"
                typed={1}
              />
            );
          })}

          {revealE > 0.05 &&
            [0, 1, 2].map((i) => (
              <div
                key={`edge-${i}`}
                style={{
                  position: 'absolute',
                  left: cx + (i - 1) * 5 - 60,
                  top: cy + (i - 1) * 6 + 75,
                  width: 120,
                  height: 2,
                  background: 'var(--pdf-edge, #b8ae99)',
                  opacity: revealE * 0.7,
                  pointerEvents: 'none',
                }}
              />
            ))}
        </Stage3D>

        {bind > 0 && (
          <div
            style={{
              position: 'absolute',
              left: cx + (0 - 1.5) * 5 * 0.4 - 62,
              top: cy + (0 - 1.5) * 6 * 0.4 - 78 + (1 - bindE) * 12,
              width: 4,
              height: 156,
              background: accent,
              opacity: bindE,
              boxShadow: `2px 0 6px color-mix(in srgb, ${accent} 33%, transparent)`,
              borderRadius: 1,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* INPUT counter */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          top: 18,
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '0.15em',
          color: textMutedCss(),
          textAlign: 'right',
          lineHeight: 1.5,
        }}
      >
        <div style={{ opacity: 0.6, fontSize: 8 }}>INPUT</div>
        <div style={{ color: accent, fontSize: 18, fontWeight: 500 }}>
          {bind > 0.5
            ? '01'
            : String(Math.min(4, Math.ceil(t / 0.36))).padStart(2, '0')}
        </div>
      </div>

      {/* OUTPUT counter */}
      {revealE > 0.6 && (
        <div
          style={{
            position: 'absolute',
            left: 20,
            top: 18,
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.15em',
            color: textMutedCss(),
            opacity: clamp((revealE - 0.6) * 2.5, 0, 1),
            lineHeight: 1.5,
          }}
        >
          <div style={{ opacity: 0.6, fontSize: 8 }}>OUTPUT</div>
          <div style={{ color: accent, fontSize: 18, fontWeight: 500 }}>
            MERGED.PDF
          </div>
        </div>
      )}

      <ProgressReadout
        text={
          t < 1.8
            ? `INGEST · ${String(Math.min(4, Math.ceil(t / 0.36))).padStart(
                2,
                '0'
              )}/04`
            : t < 3.2
            ? `ALIGN · ${String(Math.floor(snapE * 100)).padStart(3, '0')}%`
            : t < 4.2
            ? 'STACK'
            : t < 5.0
            ? 'VOLUME'
            : t < 5.7
            ? 'BIND'
            : 'COMPLETE'
        }
      />
    </>
  );
}

export function SceneStack() {
  return (
    <SceneHost duration={6}>
      <SceneFrame label="MERGE · STACK" number="01">
        <Inner />
      </SceneFrame>
    </SceneHost>
  );
}
