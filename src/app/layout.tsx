import type { Metadata } from "next";
import { Fraunces, Inter, DM_Mono } from "next/font/google";
import { DesignTweakPanel } from "@/components/dev/design-tweak-panel";
import { FloatingChat } from "@/components/floating-chat";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aesthetictraininghub.example"),
  title: {
    default: "Aesthetic Training Hub — Vetted training. Verified reviews.",
    template: "%s · Aesthetic Training Hub",
  },
  description:
    "The UK's vetted directory for aesthetics training. Every trainer is insurance-checked, qualification-verified, and reviewed only by students with a real booking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} ${dmMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-ivory text-ink-soft antialiased">
        {children}
        <FloatingChat />
        <DesignTweakPanel />
      </body>
    </html>
  );
}
