// components/CategoryCard.tsx

import { AnalysisCategory } from "@/types/analysis";

interface CategoryCardProps {
  category: AnalysisCategory;
  // Image src for this category's reference frame (data URL or static path)
  frame?: string;
  // Tighter spacing, smaller text, and a shorter frame (used in the report carousel)
  compact?: boolean;
}

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

export const getScoreColor = (score: number) => {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-yellow-600";
  return "text-red-600";
};

export default function CategoryCard({ category, frame, compact = false }: CategoryCardProps) {
  return (
    <div
      className={`rounded-xl ${compact ? "border-2 p-3" : "border-4 p-5"} ${getSeverityColor(
        category.severity
      )} transition-all hover:shadow-lg`}
    >
      {/* Category Header with Score */}
      {/* Wraps so the score drops below the name when the card is narrow */}
      <div className={`flex flex-wrap items-start justify-between gap-x-3 gap-y-1 ${compact ? "mb-2" : "mb-4"}`}>
        <div className="flex items-start gap-2">
          <span className={`shrink-0 mt-0.5 ${compact ? "[&>svg]:w-5 [&>svg]:h-5" : ""}`}>
            {getSeverityIcon(category.severity)}
          </span>
          <h4 className={`font-black leading-tight ${compact ? "text-base" : "text-lg"}`}>{category.name}</h4>
        </div>
        <div className={`shrink-0 font-black ${compact ? "text-lg" : "text-2xl"} ${getScoreColor(category.score)}`}>
          {category.score}/10
        </div>
      </div>

      {/* Frame Image */}
      {frame && category.frameIndex !== undefined && (
        <div className={compact ? "mb-2" : "mb-4"}>
          <div className={`text-xs font-bold text-gray-600 uppercase tracking-wide ${compact ? "mb-1" : "mb-2"}`}>
            Reference Frame #{category.frameIndex + 1}
          </div>
          <img
            src={frame}
            alt={`Frame for ${category.name}`}
            className={
              compact
                ? "w-full aspect-video object-cover rounded-md border-2 border-gray-800"
                : "w-full rounded-lg border-4 border-gray-800 shadow-md"
            }
          />
        </div>
      )}

      {/* Observation and Tip */}
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <div>
          <div className={`text-xs font-bold text-gray-600 uppercase tracking-wide ${compact ? "mb-0.5" : "mb-1"}`}>
            Observation
          </div>
          <p className={`italic ${compact ? "text-[13px] leading-snug" : "text-sm leading-relaxed"}`}>
            {category.observation}
          </p>
        </div>
        <div className={`border-t-2 border-gray-300 ${compact ? "pt-1.5" : "pt-2"}`}>
          <div className={`text-xs font-bold text-gray-600 uppercase tracking-wide ${compact ? "mb-0.5" : "mb-1"}`}>
            Coaching Tips
          </div>
          <p className={`font-medium ${compact ? "text-[13px] leading-snug" : "text-sm leading-relaxed"}`}>
            {category.tip}
          </p>
        </div>
      </div>
    </div>
  );
}
