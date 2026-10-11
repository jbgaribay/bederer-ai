import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Upload a short clip of your tennis swing and get frame-by-frame AI coaching feedback in about 30 seconds.";

// Absolute base for link-preview image URLs: set NEXT_PUBLIC_SITE_URL in production
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const previewImage = {
  url: "/how-it-works/frame-3.jpg",
  width: 640,
  height: 548,
  alt: "A forehand swing analyzed by Bederer AI",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Bederer AI", template: "%s · Bederer AI" },
  description,
  openGraph: {
    title: "Bederer AI",
    description,
    siteName: "Bederer AI",
    type: "website",
    images: [previewImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bederer AI",
    description,
    images: [previewImage.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-gray-50 to-green-100 text-gray-900`}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="py-6 text-center text-sm text-green-800/70">
          <span className="font-bold text-green-900">Bederer AI</span> · Coaching feedback on
          your swing, without the $150/hour lesson.
        </footer>
      </body>
    </html>
  );
}
