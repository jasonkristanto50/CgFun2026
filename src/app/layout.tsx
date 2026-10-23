import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Orbitron, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CG FUN 2026 — Operation: Find the Code",
  description:
    "Misi rahasia di Ciputra World Surabaya. Bentuk tim, pecahkan 6 petunjuk, dan buka brankas FILE 07.",
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
      </body>
    </html>
  );
}
