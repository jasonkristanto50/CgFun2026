import { ImageResponse } from "next/og";

// Link preview shown when the site is shared on WhatsApp / Instagram / Telegram.
export const alt = "CG FUN 2026 — Operation: Find the Code";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COPY = {
  badge: "CLASSIFIED OPERATION · SURABAYA",
  clearance: "CLEARANCE: LEVEL 07",
  line1: "OPERATION:",
  line2: "FIND THE CODE",
  subtitle: "A REAL-WORLD MALL MISSION & HANGOUT GAME",
  secret: "TOP SECRET // FILE 07",
  location: "CIPUTRA WORLD SURABAYA",
  cta: "CG FUN 2026 // DAFTAR JADI AGENT →",
};

/** Fetches a Google Font subset (TTF) at build time; falls back to the default font if offline. */
async function loadGoogleFont(family: string, weight: number, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

// The OG renderer crashes on `undefined` style values, so only set the keys we need.
function Corner({ top, left }: { top: boolean; left: boolean }) {
  const edge = "4px solid #10B981";
  return (
    <div
      style={{
        position: "absolute",
        width: 56,
        height: 56,
        ...(top ? { top: 28, borderTop: edge } : { bottom: 28, borderBottom: edge }),
        ...(left ? { left: 28, borderLeft: edge } : { right: 28, borderRight: edge }),
      }}
    />
  );
}

export default async function OpengraphImage() {
  const [orbitron, mono] = await Promise.all([
    loadGoogleFont("Orbitron", 900, COPY.line1 + COPY.line2 + "?"),
    loadGoogleFont("JetBrains+Mono", 700, Object.values(COPY).join("")),
  ]);
  const fonts = [
    ...(orbitron ? [{ name: "Orbitron", data: orbitron, weight: 900 as const, style: "normal" as const }] : []),
    ...(mono ? [{ name: "JetBrains Mono", data: mono, weight: 700 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          position: "relative",
          color: "#E2E8F0",
          fontFamily: "JetBrains Mono",
          backgroundColor: "#090D16",
          backgroundImage:
            "radial-gradient(circle at 12% 8%, rgba(16,185,129,0.28), transparent 45%), radial-gradient(circle at 92% 96%, rgba(245,158,11,0.22), transparent 42%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.09) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <Corner top left />
        <Corner top left={false} />
        <Corner top={false} left />
        <Corner top={false} left={false} />

        {/* Top telemetry */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 18px",
              borderRadius: 999,
              border: "2px solid rgba(16,185,129,0.6)",
              background: "rgba(16,185,129,0.12)",
              color: "#6EE7B7",
              letterSpacing: 3,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 999, background: "#10B981", boxShadow: "0 0 12px #10B981" }} />
            {COPY.badge}
          </div>
          <div
            style={{
              display: "flex",
              padding: "8px 16px",
              borderRadius: 6,
              border: "2px solid rgba(245,158,11,0.6)",
              background: "rgba(245,158,11,0.12)",
              color: "#FBBF24",
              letterSpacing: 2,
            }}
          >
            {COPY.clearance}
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Orbitron", lineHeight: 1.05 }}>
          <div style={{ display: "flex", fontSize: 78, color: "#F8FAFC" }}>{COPY.line1}</div>
          <div style={{ display: "flex", fontSize: 92, color: "#10B981", textShadow: "0 0 36px rgba(16,185,129,0.65)" }}>
            {COPY.line2}
          </div>
          <div style={{ display: "flex", marginTop: 18, fontFamily: "JetBrains Mono", fontSize: 26, letterSpacing: 4, color: "#F59E0B" }}>
            {COPY.subtitle}
          </div>
        </div>

        {/* Vault + footer */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", fontSize: 18, letterSpacing: 4, color: "#F87171" }}>{COPY.secret}</div>
            <div style={{ display: "flex", gap: 12 }}>
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 62,
                    height: 78,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    border: "2px solid rgba(16,185,129,0.6)",
                    background: "rgba(9,13,22,0.9)",
                    color: "#34D399",
                    fontFamily: "Orbitron",
                    fontSize: 40,
                  }}
                >
                  ?
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, fontSize: 22 }}>
            <div style={{ display: "flex", color: "#E2E8F0", letterSpacing: 2 }}>{COPY.location}</div>
            <div style={{ display: "flex", color: "#10B981", letterSpacing: 2 }}>{COPY.cta}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
