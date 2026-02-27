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
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
      {/* Header */}
      <div className="text-center border-b pb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Coaching Report
        </h2>
        <p className="text-gray-600 capitalize">
          {analysis.shot_type} Analysis
        </p>
        <div className="mt-4">
          <div className="text-5xl font-bold text-indigo-600">
            {analysis.overall_score.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Overall Score</div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Technique Breakdown
        </h3>
        {analysis.categories.map((category, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getSeverityColor(
              category.severity
            )}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getSeverityIcon(category.severity)}</span>
                <h4 className="font-semibold text-lg">{category.name}</h4>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                {category.score}/10
              </div>
            </div>
            <p className="text-sm mb-2 italic">
              <span className="font-medium">Observation:</span> {category.observation}
            </p>
            <p className="text-sm">
              <span className="font-medium">Tip:</span> {category.tip}
            </p>
          </div>
        ))}
      </div>

      {/* Top Priority */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          Top Priority
        </h3>
        <p className="text-indigo-800">{analysis.top_priority}</p>
      </div>

      {/* Drill Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
          Recommended Drill
        </h3>
        <p className="text-blue-800">{analysis.drill_recommendation}</p>
      </div>
    </div>
  );
}