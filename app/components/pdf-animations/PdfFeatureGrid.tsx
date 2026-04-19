'use client';

// PdfFeatureGrid — 2×2 responsive grid wrapping all four scenes.
// Stacks on mobile.

import { SceneStack } from './scenes/SceneStack';
import { SceneEdit } from './scenes/SceneEdit';
import { SceneSplit } from './scenes/SceneSplit';
import { SceneCompress } from './scenes/SceneCompress';

export function PdfFeatureGrid({ className = '' }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(360px, 100%), 1fr))',
        gap: 16,
        width: '100%',
      }}
    >
      <SceneStack />
      <SceneEdit />
      <SceneSplit />
      <SceneCompress />
    </div>
  );
}
