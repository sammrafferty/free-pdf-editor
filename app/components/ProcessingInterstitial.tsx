"use client";

import { useEffect, useState, useCallback } from "react";
import AdSlot from "./AdSlot";

export default function ProcessingInterstitial() {
  const [visible, setVisible] = useState(false);
  const [filename, setFilename] = useState("");
  const [statusText, setStatusText] = useState("Processing your file...");

  const hide = useCallback(() => {
    setVisible(false);
    setStatusText("Processing your file...");
  }, []);

  useEffect(() => {
    let statusTimer: ReturnType<typeof setTimeout> | null = null;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const handleStart = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setFilename(detail?.filename ?? "");
      setStatusText("Processing your file...");
      setVisible(true);

      statusTimer = setTimeout(() => {
        setStatusText("Almost done...");
      }, 1500);

      // Safety fallback — auto-hide after 3.5s even if complete event never fires
      safetyTimer = setTimeout(() => {
        setVisible(false);
        setStatusText("Processing your file...");
      }, 3500);
    };

    const handleComplete = () => {
      if (statusTimer) clearTimeout(statusTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
      hide();
    };

    window.addEventListener("pdf-download-start", handleStart);
    window.addEventListener("pdf-download-complete", handleComplete);

    return () => {
      window.removeEventListener("pdf-download-start", handleStart);
      window.removeEventListener("pdf-download-complete", handleComplete);
      if (statusTimer) clearTimeout(statusTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, [hide]);

  return (
    <>
      {/* Hidden marker so downloadBlob can detect the interstitial is mounted */}
      <div data-processing-interstitial hidden />

      {visible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-overlay, rgba(0,0,0,0.6))",
            animation: "interstitialFadeIn 0.2s ease-out",
          }}
        >
          <div
            style={{
              background: "var(--bg-elevated)",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "420px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {/* Spinner */}
            <div
              style={{
                margin: "0 auto 1rem",
                width: "40px",
                height: "40px",
                border: "3px solid var(--text-muted)",
                borderTopColor: "var(--accent-primary)",
                borderRadius: "50%",
                animation: "interstitialSpin 0.8s linear infinite",
              }}
            />

            <p
              style={{
                color: "var(--text-primary)",
                fontSize: "1.125rem",
                fontWeight: 600,
                margin: "0 0 0.25rem",
              }}
            >
              {statusText}
            </p>

            <div className="processing-dots" style={{ margin: "0.75rem 0 0.25rem" }}>
              <span />
              <span />
              <span />
            </div>

            {filename && (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  margin: "0 0 1.25rem",
                  wordBreak: "break-all",
                }}
              >
                {filename}
              </p>
            )}

            <div style={{ marginTop: "1rem" }}>
              <AdSlot slot="processing-interstitial" format="rectangle" />
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animations injected once */}
      <style jsx global>{`
        @keyframes interstitialFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes interstitialSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
