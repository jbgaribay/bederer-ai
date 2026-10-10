// app/page.tsx

import Link from "next/link";
import CategoryCard from "@/components/CategoryCard";
import { SwingAnalysis } from "@/types/analysis";
import sampleAnalysisJson from "@/lib/sample-analysis.json";

// Real analysis of the clip whose frames live in public/how-it-works
const sampleAnalysis = sampleAnalysisJson as SwingAnalysis;
const SAMPLE_FRAMES = [1, 2, 3, 4, 5, 6].map((n) => `/how-it-works/frame-${n}.jpg`);
const SAMPLE_CATEGORIES = ["Stance & Preparation", "Backswing & Unit Turn"];

const STEPS = [
  {
    title: "Record your swing",
    body: "5–10 seconds of video from your phone. Forehand, backhand, serve, or volley.",
  },
  {
    title: "AI analyzes it",
    body: "We pull key frames from your clip and break down stance, backswing, contact, follow-through, and footwork.",
  },
  {
    title: "Get your report",
    body: "Scores, the frame behind each one, specific tips, and a drill for your biggest weakness.",
  },
];

const ctaClass =
  "inline-block bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 rounded-xl font-black text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-xl hover:shadow-2xl transform hover:scale-[1.02] border-4 border-green-800";

export default function HomePage() {
  const sampleCards = sampleAnalysis.categories.filter((c) => SAMPLE_CATEGORIES.includes(c.name));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
          Your AI tennis coach
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Upload a short clip of your swing and get specific, frame-by-frame coaching feedback in
          about 30 seconds.
        </p>
        <div className="mt-8">
          <Link href="/upload" className={ctaClass}>
            Analyze My Swing →
          </Link>
          <p className="mt-3 text-sm text-gray-500">First analysis free · No signup to try</p>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-3xl font-black text-gray-900 text-center mb-8">How it works</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="bg-white rounded-xl shadow-lg p-6 border-4 border-green-600">
              <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-black mb-4">
                {i + 1}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.body}</p>
            </div>
          ))}
        </div>

        {/* Reference frames from a real scan */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-4 border-green-600">
          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">
            We pull 6 key frames from your clip, just like a real scan
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {SAMPLE_FRAMES.map((src, i) => (
              <figure key={src}>
                <img
                  src={src}
                  alt={`Reference frame ${i + 1}`}
                  className="w-full aspect-video object-cover rounded-lg border-4 border-gray-800 shadow-md"
                />
                <figcaption className="mt-1 text-xs font-bold text-gray-500 text-center">
                  Frame {i + 1}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900">What your report looks like</h2>
          <p className="mt-2 text-gray-600">Real output from the swing above.</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 border-4 border-green-600 space-y-6">
          <div className="text-center">
            <div className="text-5xl font-black text-green-600">
              {sampleAnalysis.overall_score.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500 mt-1 font-semibold capitalize">
              Overall Score · {sampleAnalysis.shot_type}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {sampleCards.map((category) => (
              <CategoryCard
                key={category.name}
                category={category}
                frame={
                  category.frameIndex !== undefined ? SAMPLE_FRAMES[category.frameIndex] : undefined
                }
              />
            ))}
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 border-4 border-green-600 rounded-xl p-6">
            <h3 className="text-xl font-black text-green-900 mb-2">Top Priority</h3>
            <p className="text-green-800 leading-relaxed">{sampleAnalysis.top_priority}</p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/upload" className={ctaClass}>
            Try It on Your Swing →
          </Link>
        </div>
      </section>
    </div>
  );
}
