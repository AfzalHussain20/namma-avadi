import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Tamil } from "next/font/google";
import { TVK_ASSETS } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
});

export const metadata: Metadata = {
  title: {
    default: "Namma Avadi — TVK Member System",
    template: "%s | Namma Avadi",
  },
  description:
    "TVK member registration, tracking, and profile system for Thiruninravur, Avadi and Thiruverkadu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <head>
        {/* Preload critical hero images so they render on first paint */}
        <link rel="preload" href={TVK_ASSETS.flag} as="image" />
        <link rel="preload" href={TVK_ASSETS.vijay} as="image" />
        <link rel="preload" href={TVK_ASSETS.ramesh} as="image" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
