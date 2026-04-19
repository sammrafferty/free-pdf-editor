'use client';

// SceneSplit — SPLIT / EXTRACT animation
// One PDF slides in, then three sub-pages fan apart into labeled outputs.

import { SceneHost, useTime, Easing, clamp } from '../animation-engine';
import {
  SceneFrame,
  Stage3D,
  PDFPage,
  ProgressReadout,
  EdgeRuler,
  MONO,
} from '../primitives';

function Inner() {
  const time = useTime();
  const DUR = 6;
  const t = time % DUR;
  const accent = 'var(--accent-primary, #e8927c)';

  const intro = clamp(t / 0.8, 0, 1);
  const introEase = Easing.easeOutCubic(intro);

  const cutDraw = clamp((t - 0.8) / 1.0, 0, 1);

  const split = clamp((t - 2.8) / 1.6, 0, 1);
  const splitEase = Easing.easeInOutCubic(split);

  const annShow =
    clamp((t - 3.6) / 0.4, 0, 1) * (1 - clamp((t - 5.4) / 0.6, 0, 1));
  const outro = clamp((t - 5.4) / 0.6, 0, 1);

  const cx = 210;
  const cy = 210;
  const pageW = 100;
  const pageH = 130;

  const initialX = [cx, cx, cx];
  const initialY = [cy - 4, cy, cy + 4];
  const initialRotZ = [0, 0, 0];

  const finalX = [cx - 130, cx, cx + 130];
  const finalY = [cy + 14, cy - 6, cy + 14];
  const finalRotZ = [-6, 0, 6];

  const pageOp = (i: number) => {
    const introX = -260 * (1 - introEase);
    const sx = initialX[i] + (finalX[i] - initialX[i]) * splitEase;
    const sy = initialY[i] + (finalY[i] - initialY[i]) * splitEase;
    const srz = initialRotZ[i] + (finalRotZ[i] - initialRotZ[i]) * splitEase;
    const x = sx + introX * (1 - outro);
    const y = sy;
    const ox = (1 - outro) * x + outro * cx;
    return { x: ox, y, rotZ: srz, opacity: introEase * (1 - outro * 0.8) };
  };

  return (
    <>
      <EdgeRuler orientation="bottom" size={420} />

      <Stage3D perspective={900}>
        {[0, 1, 2].map((i) => {
          const P = pageOp(i);
          return (
            <PDFPage
              key={i}
              x={P.x}
              y={P.y}
              rotateX={4}
              rotateY={-2}
              rotateZ={P.rotZ}
              width={pageW}
              height={pageH}
              opacity={P.opacity}
              content="full"
              typed={1}
            />
          );
        })}
      </Stage3D>

      {[
        { i: 0, text: 'PDF 01', x: cx - 130, y: cy - 55 },
        { i: 1, text: 'PDF 02', x: cx, y: cy - 75 },
        { i: 2, text: 'PDF 03', x: cx + 130, y: cy - 55 },
      ].map((a) => (
        <div
          key={a.i}
          style={{
            position: 'absolute',
            left: a.x,
            top: a.y,
            transform: 'translate(-50%, -50%)',
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: '0.12em',
            color: accent,
            opacity: annShow,
            border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`,
            padding: '2px 6px',
            borderRadius: 3,
            background: 'var(--bg-elevated, rgba(30,30,30,0.9))',
          }}
        >
          {a.text}
        </div>
      ))}

      <ProgressReadout
        text={
          t < 0.8
            ? 'LOAD'
            : t < 1.8
            ? `MARK · ${String(Math.floor(cutDraw * 100)).padStart(3, '0')}%`
            : t < 2.8
            ? 'CONFIRM'
            : t < 4.4
            ? `SPLIT · ${String(Math.floor(splitEase * 100)).padStart(3, '0')}%`
            : t < 5.4
            ? '3 FILES OUT'
            : 'RESET'
        }
      />
    </>
  );
}

export function SceneSplit() {
  return (
    <SceneHost duration={6}>
      <SceneFrame label="SPLIT · EXTRACT" number="03">
        <Inner />
      </SceneFrame>
    </SceneHost>
  );
}
