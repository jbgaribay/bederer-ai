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

export const metadata: Metadata = {
  title: "Bederer AI",
  description: "Upload your tennis swing and get instant AI coaching feedback.",
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
