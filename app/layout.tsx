import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/sections/Footer";
import GrainOverlay from "@/components/GrainOverlay";
import CustomCursor from "@/components/CustomCursor";

const editorial = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HORIZONTEX — Seu móvel. Uma nova história.",
  description:
    "Restauração e tapeçaria artesanal para móveis que merecem permanecer. HORIZONTEX transforma cadeiras, poltronas, sofás e móveis clássicos com materiais premium e precisão artesanal.",
  keywords: [
    "tapeçaria",
    "restauração de móveis",
    "estofaria premium",
    "reforma de estofados",
    "HORIZONTEX",
  ],
  openGraph: {
    title: "HORIZONTEX — Seu móvel. Uma nova história.",
    description:
      "Restauração e tapeçaria artesanal para móveis que merecem permanecer.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${editorial.variable} ${body.variable}`}>
      <body className="bg-ink text-bone-100 font-sans antialiased selection:bg-brass-500 selection:text-ink">
        <GrainOverlay />
        <CustomCursor />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
