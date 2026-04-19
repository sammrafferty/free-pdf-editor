'use client';

// SceneEdit — EDIT / SIGN animation
// A single tilted PDF. Text types in, a coral highlight sweeps a row,
// then a signature is drawn. Blueprint annotations label each action.

import { SceneHost, useTime, Easing, clamp } from '../animation-engine';
import {
  SceneFrame,
  Stage3D,
  PDFPage,
  Annotation,
  ProgressReadout,
  EdgeRuler,
} from '../primitives';

function Inner() {
  const time = useTime();
  const DUR = 6;
  const t = time % DUR;
  const accent = 'var(--accent-primary, #e8927c)';

  const intro = clamp(t / 0.5, 0, 1);
  const introEase = Easing.easeOutBack(intro);
  const typed = clamp((t - 0.5) / 1.7, 0, 1);
  const highlight = clamp((t - 2.2) / 0.8, 0, 1);
  const signature = clamp((t - 3.0) / 1.4, 0, 1);
  const outro = clamp((t - 5.2) / 0.8, 0, 1);

  const showTypeAnn =
    clamp(typed * 3, 0, 1) * (1 - clamp((t - 5.0) / 0.4, 0, 1));
  const showHlAnn =
    clamp((t - 2.2) / 0.3, 0, 1) * (1 - clamp((t - 5.0) / 0.4, 0, 1));
  const showSigAnn =
    clamp((t - 3.0) / 0.3, 0, 1) * (1 - clamp((t - 5.0) / 0.4, 0, 1));

  const cx = 210;
  const cy = 205;

  const cursorOn = Math.floor(t * 2.5) % 2 === 0 && typed > 0 && typed < 1;
  const nLines = 9;
  const curRow = clamp(Math.floor(typed * nLines), 0, nLines - 1);
  const curRowFrac = typed * nLines - curRow;
  const rowWidths = [0.9, 0.72, 0.85, 0.6, 0.78, 0.92, 0.5, 0.68, 0.3];
  const pageW = 180;
  const innerW = pageW - 28;
  const curX = 14 + innerW * rowWidths[curRow] * curRowFrac;
  const curY = 20 + 12 + 6 + curRow * 9.5;

  const pageOpacity = introEase * (1 - outro);
  const pageScale = 0.92 + 0.08 * introEase;

  return (
    <>
      <EdgeRuler orientation="bottom" size={420} />

      <Stage3D perspective={1100}>
        <PDFPage
          x={cx}
          y={cy}
          rotateX={10}
          rotateY={-14}
          rotateZ={0}
          width={180}
          height={230}
          opacity={pageOpacity}
          scale={pageScale}
          content="full"
          typed={typed}
          highlight={highlight}
          signature={signature}
        />
      </Stage3D>

      {cursorOn && typed > 0 && typed < 1 && (
        <div
          style={{
            position: 'absolute',
            left: cx - 90 + curX,
            top: cy - 115 + curY,
            width: 1.2,
            height: 5,
            background: accent,
            opacity: pageOpacity,
            transform: 'skewY(-6deg) skewX(-14deg)',
            boxShadow: `0 0 4px ${accent}`,
          }}
        />
      )}

      <Annotation
        x={cx + 46}
        y={cy - 86}
        lx={cx + 92}
        ly={cy - 110}
        text="EDIT_TEXT"
        show={showTypeAnn}
      />
      <Annotation
        x={cx - 42}
        y={cy - 42}
        lx={cx - 150}
        ly={cy - 80}
        text="HIGHLIGHT"
        show={showHlAnn}
      />
      <Annotation
        x={cx + 30}
        y={cy + 74}
        lx={cx + 80}
        ly={cy + 120}
        text="SIGN"
        show={showSigAnn}
      />

      <ProgressReadout
        text={
          t < 0.5
            ? 'OPEN'
            : t < 2.2
            ? `TYPE · ${String(Math.floor(typed * 100)).padStart(3, '0')}%`
            : t < 3.0
            ? 'HIGHLIGHT'
            : t < 4.4
            ? `SIGN · ${String(Math.floor(signature * 100)).padStart(3, '0')}%`
            : t < 5.2
            ? 'SAVED'
            : 'EXPORT'
        }
      />
    </>
  );
}

export function SceneEdit() {
  return (
    <SceneHost duration={6}>
      <SceneFrame label="EDIT · SIGN" number="02">
        <Inner />
      </SceneFrame>
    </SceneHost>
  );
}
