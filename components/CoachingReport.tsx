// components/CoachingReport.tsx

import { SwingAnalysis } from "@/types/analysis";
import CategoryCarousel from "@/components/CategoryCarousel";

interface CoachingReportProps {
  analysis: SwingAnalysis;
}

export default function CoachingReport({ analysis }: CoachingReportProps) {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 space-y-8 border-4 border-green-600">
      {/* Header */}
      <div className="text-center border-b-4 border-green-200 pb-6">
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          Your Coaching Report
        </h2>
        <p className="text-gray-600 capitalize text-lg">
          {analysis.shot_type} Analysis
        </p>
        <div className="mt-4">
          <div className="text-6xl font-black text-green-600">
            {analysis.overall_score.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1 font-semibold">Overall Score</div>
        </div>
      </div>

      {/* Categories - two at a time, arrows to page through */}
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl"></span>
          Technique Breakdown
        </h3>
        <CategoryCarousel categories={analysis.categories} frames={analysis.frames} />
      </div>

      {/* Top Priority */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-4 border-green-600 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-black text-green-900 mb-3 flex items-center gap-2">
          Top Priority
        </h3>
        <p className="text-green-800 text-lg leading-relaxed">{analysis.top_priority}</p>
      </div>

      {/* Drill Recommendation */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-4 border-blue-600 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-black text-blue-900 mb-3 flex items-center gap-2">
           Recommended Drill
        </h3>
        <p className="text-blue-800 text-lg leading-relaxed">{analysis.drill_recommendation}</p>
      </div>
    </div>
  );
}
