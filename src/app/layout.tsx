import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Orbitron, Plus_Jakarta_Sans } from "next/font/google";
import { MusicToggle } from "@/components/ui/music-toggle";
import "./globals.css";

const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

// Absolute base for link-preview image URLs (Vercel sets this automatically in production).
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const title = "CG FUN 2026 — Operation: Find the Code";
const description =
  "Misi rahasia di Ciputra World Surabaya. Bentuk tim, pecahkan 6 petunjuk, dan buka brankas FILE 07. Daftar jadi agent sekarang!";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "CG FUN 2026",
    locale: "id_ID",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#090D16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${orbitron.variable} ${jetbrains.variable} ${jakarta.variable} antialiased`}>
        {children}
        <MusicToggle />
      </body>
    </html>
  );
}
