import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Free PDF Editor — Split, Merge, Compress & Convert PDFs Online";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1a1a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle grid dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,146,124,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "#222222",
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 32,
            fontSize: 40,
          }}
        >
          <span style={{ color: "#f5f0e8" }}>📄</span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#f5f5f4",
              letterSpacing: "-0.02em",
            }}
          >
            Free PDF Editor
          </span>
          <span
            style={{
              fontSize: 24,
              color: "#a8a29e",
              maxWidth: 700,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            Split, Merge, Compress & Convert PDFs — Free, Private, No Upload
          </span>
        </div>

        {/* Tool pills */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 36,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 800,
          }}
        >
          {["Split", "Merge", "Compress", "Convert", "Rotate", "Sign", "Watermark", "Redact"].map(
            (tool) => (
              <div
                key={tool}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  background: "#222222",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#a8a29e",
                  fontSize: 16,
                }}
              >
                {tool}
              </div>
            )
          )}
        </div>

        {/* Domain */}
        <span
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 16,
            color: "#e8927c",
            fontWeight: 500,
          }}
        >
          free-pdf-editor.org
        </span>
      </div>
    ),
    { ...size }
  );
}
