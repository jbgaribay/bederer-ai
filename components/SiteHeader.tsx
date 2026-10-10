"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderAuth from "@/components/HeaderAuth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload Swing" },
  { href: "/about", label: "About" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="relative bg-gradient-to-r from-green-800 to-green-700 text-white overflow-hidden">
      {/* Court lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-white"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-y-3">
        {/* Title: own row on phones, centered column from sm up */}
        <Link
          href="/"
          className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 justify-self-center text-2xl font-black flex items-center gap-2"
        >
          <span>🎾</span>
          Bederer AI
        </Link>

        <nav className="sm:col-start-1 sm:row-start-1 flex items-center gap-3 sm:gap-4 text-sm font-bold whitespace-nowrap">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-yellow-300 underline underline-offset-8 decoration-2"
                    : "text-green-100 hover:text-yellow-200"
                }
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="sm:col-start-3 sm:row-start-1 justify-self-end">
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
