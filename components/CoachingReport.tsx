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
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "needs_work":
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        );
      case "critical":
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
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
                {getSeverityIcon(category.severity)}
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
                    <span></span> Coaching Tips
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
