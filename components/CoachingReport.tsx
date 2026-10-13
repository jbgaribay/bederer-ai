// components/CoachingReport.tsx

import { SwingAnalysis } from "@/types/analysis";
import CategoryCarousel from "@/components/CategoryCarousel";

interface CoachingReportProps {
  analysis: SwingAnalysis;
}

export default function CoachingReport({ analysis }: CoachingReportProps) {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-5 sm:p-6 space-y-5 border-4 border-green-600">
      {/* Header: title on the left, overall score on the right */}
      <div className="flex items-end justify-between gap-4 border-b-2 border-green-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Your Coaching Report</h2>
          <p className="text-sm text-gray-600 capitalize">{analysis.shot_type} analysis</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-4xl font-black text-green-600 leading-none">
            {analysis.overall_score.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-semibold">Overall Score</div>
        </div>
      </div>

      {/* Categories - two at a time, arrows to page through */}
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-3">Technique Breakdown</h3>
        <CategoryCarousel categories={analysis.categories} frames={analysis.frames} />
      </div>

      {/* Top Priority and Drill, side by side when there's room */}
      <div className="grid xl:grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-600 rounded-xl p-4">
          <h3 className="text-base font-black text-green-900 mb-1">Top Priority</h3>
          <p className="text-green-800 text-sm leading-snug">{analysis.top_priority}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-600 rounded-xl p-4">
          <h3 className="text-base font-black text-blue-900 mb-1">Recommended Drill</h3>
          <p className="text-blue-800 text-sm leading-snug">{analysis.drill_recommendation}</p>
        </div>
      </div>
    </div>
  );
}
