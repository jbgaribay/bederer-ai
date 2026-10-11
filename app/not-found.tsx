// app/not-found.tsx

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-10 border-4 border-green-600 text-center">
        <p className="text-5xl font-black text-green-600">404</p>
        <h1 className="mt-3 text-2xl font-black text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-600">That page is out of bounds. Let&apos;s get you back on court.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-yellow-400 text-green-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 border-2 border-yellow-500"
          >
            Go Home
          </Link>
          <Link
            href="/upload"
            className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 border-2 border-green-900"
          >
            Upload a Swing
          </Link>
        </div>
      </div>
    </div>
  );
}
