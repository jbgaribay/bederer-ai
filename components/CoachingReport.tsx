// components/CoachingReport.tsx

import { SwingAnalysis } from "@/types/analysis";

interface CoachingReportProps {
  analysis: SwingAnalysis;
}

export default function CoachingReport({ analysis }: CoachingReportProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "good":
        return "bg-green-100 text-green-800 border-green-300";
      case "needs_work":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "good":
        return "✅";
      case "needs_work":
        return "⚠️";
      case "critical":
        return "🔴";
      default:
        return "ℹ️";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 space-y-8 border-4 border-green-600">
      {/* Header */}
      <div className="text-center border-b-4 border-green-200 pb-6">
        <div className="inline-block mb-4 text-4xl">🎾</div>
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

      {/* Categories Grid - 2 columns on desktop */}
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl"></span>
          Technique Breakdown
        </h3>
        <div className="grid lg:grid-cols-2 gap-6">
          {analysis.categories.map((category, index) => (
            <div
              key={index}
              className={`border-4 rounded-xl p-5 ${getSeverityColor(
                category.severity
              )} transition-all hover:shadow-lg`}
            >
              {/* Category Header with Score */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getSeverityIcon(category.severity)}</span>
                  <h4 className="font-black text-lg">{category.name}</h4>
                </div>
                <div className={`text-2xl font-black ${getScoreColor(category.score)}`}>
                  {category.score}/10
                </div>
              </div>

              {/* Frame Image */}
              {analysis.frames && category.frameIndex !== undefined && analysis.frames[category.frameIndex] && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                    Reference Frame #{category.frameIndex + 1}
                  </div>
                  <img
                    src={`data:image/jpeg;base64,${analysis.frames[category.frameIndex]}`}
                    alt={`Frame for ${category.name}`}
                    className="w-full rounded-lg border-4 border-gray-800 shadow-md"
                  />
                </div>
              )}

              {/* Observation and Tip */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                    Observation
                  </div>
                  <p className="text-sm italic leading-relaxed">
                    {category.observation}
                  </p>
                </div>
                <div className="pt-2 border-t-2 border-gray-300">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <span></span> Coaching Tip
                  </div>
                  <p className="text-sm font-medium leading-relaxed">
                    {category.tip}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Priority */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-4 border-green-600 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-black text-green-900 mb-3 flex items-center gap-2">
          🎯 Top Priority
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
