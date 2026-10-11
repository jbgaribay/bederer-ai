// app/about/page.tsx

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Why Bederer AI exists and who's building it.",
};

const WHAT_YOU_GET = [
  "Six key frames pulled from your clip, from ready position to follow-through",
  "Scores for stance, backswing, contact, follow-through, and footwork",
  "The reference frame behind each score, so you can see what the coach sees",
  "A top priority and a drill to fix your biggest weakness",
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">About Bederer AI</h1>
        <p className="mt-4 text-lg text-gray-600">
          A tennis coach in your pocket, built by a player who wanted one.
        </p>
      </div>

      <section className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-4 border-green-600">
        {/* The project */}
        <h2 className="text-2xl font-black text-gray-900 mb-3">The project</h2>
        <p className="text-gray-700 leading-relaxed">
          Good coaching is expensive, and most of us don&apos;t get someone watching every swing.
          Bederer AI lets you upload a short clip of your stroke and get specific, frame-by-frame
          feedback in about 30 seconds.
        </p>
        <ul className="mt-5 space-y-2">
          {WHAT_YOU_GET.map((item) => (
            <li key={item} className="flex gap-3 text-gray-700">
              <span className="text-green-600 font-black">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-gray-700 leading-relaxed">
          Your first analysis is free with no signup. Create an account to keep analyzing and save
          your swing history.
        </p>

        {/* The developer */}
        <h2 className="text-2xl font-black text-gray-900 mt-8 pt-8 border-t-2 border-green-100 mb-3">
          Who&apos;s behind it
        </h2>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            I&apos;m a solo developer based in Hawaii. I&apos;ve been playing tennis for over 10
            years, including as a collegiate player.
          </p>
          <p>
            After finishing school, I lost the daily coaching and team practices that kept my game
            sharp. I still wanted to keep improving, so I built the tool I wished I had: something
            that could look at my swing and tell me exactly what to work on next.
          </p>
          <p>
            Bederer AI is that tool. I use it on my own game, and I&apos;m building it out for
            anyone else who wants to keep getting better.
          </p>
        </div>
      </section>

      <div className="text-center">
        <Link
          href="/upload"
          className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 rounded-xl font-black text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] border-4 border-green-800"
        >
          Analyze My Swing →
        </Link>
      </div>
    </div>
  );
}
