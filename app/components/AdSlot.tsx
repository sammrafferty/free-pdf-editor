"use client";

import { useEffect, useRef } from "react";

// Map named slots to Ezoic numeric placeholder IDs
const slotToPlaceholder: Record<string, number> = {
  "hero-banner": 101,
  "footer-banner": 102,
  "tool-complete": 103,
  "processing-interstitial": 104,
  "guide-split-mid": 105,
  "guide-split-faq": 106,
  "guide-merge-mid": 107,
  "guide-merge-faq": 108,
  "guide-compress-mid": 109,
  "guide-compress-faq": 110,
  "guide-convert-mid": 111,
  "guide-convert-faq": 112,
  "guide-rotate-mid": 113,
  "guide-rotate-faq": 114,
  "guide-mid": 115,
  "guide-faq": 116,
  "info-mid": 117,
  "info-bottom": 118,
};

// Auto-increment for unknown slots
let nextId = 119;

interface AdSlotProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  responsive?: boolean;
  className?: string;
}

export default function AdSlot({ slot, className = "" }: AdSlotProps) {
  const placeholderId = slotToPlaceholder[slot] ?? (slotToPlaceholder[slot] = nextId++);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const ez = (window as unknown as { ezstandalone?: { cmd: Array<() => void>; showAds: (...ids: number[]) => void } }).ezstandalone;
    if (ez) {
      ez.cmd.push(() => {
        ez.showAds(placeholderId);
      });
    }
  }, [placeholderId]);

  return (
    <div className={className}>
      <div id={`ezoic-pub-ad-placeholder-${placeholderId}`} />
    </div>
  );
}
