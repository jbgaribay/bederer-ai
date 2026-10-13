"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { SavedSwing } from "@/hooks/useSwingHistory";
import { CATEGORY_NAMES } from "@/types/analysis";
import SwingCompare from "@/components/SwingCompare";

// Fixed color per category (validated colorblind-safe on white), so hiding one never
// repaints the others
const CATEGORY_COLORS: Record<(typeof CATEGORY_NAMES)[number], string> = {
  "Stance & Preparation": "#2a78d6",
  "Backswing & Unit Turn": "#eb6834",
  "Contact Point": "#1baf7a",
  "Follow-Through": "#eda100",
  "Footwork & Balance": "#e87ba4",
};

interface SwingHistoryProps {
  history: SavedSwing[];
  onClear: () => void;
  onDelete: (id: string) => void;
  onView: (swing: SavedSwing) => void;
}

export default function SwingHistory({ history, onClear, onDelete, onView }: SwingHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chartView, setChartView] = useState<"overall" | "categories">("overall");
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  // Compare mode: pick two swings from the list, then show them side by side
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);

  const toggleSelected = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );

  const exitCompare = () => {
    setCompareMode(false);
    setSelectedIds([]);
    setComparing(false);
  };

  const comparedSwings = selectedIds
    .map((id) => history.find((swing) => swing.id === id))
    .filter((swing): swing is SavedSwing => Boolean(swing));

  const toggleCategory = (name: string) =>
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "good": return "text-green-600";
      case "needs_work": return "text-yellow-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  // Chart data — oldest first so the line reads left to right
  const chartData = [...history]
    .reverse()
    .map((swing, index) => ({
      name: `#${index + 1}`,
      score: parseFloat(swing.overall_score.toFixed(1)),
      date: swing.date,
      shot: swing.shot_type,
      ...Object.fromEntries(swing.categories.map((cat) => [cat.name, cat.score])),
    })) as Array<Record<string, string | number | undefined>>;

  // First vs latest score per category, for the table under the category chart
  const categoryChanges = CATEGORY_NAMES.map((name) => {
    const scores = chartData.map((point) => point[name]).filter((v): v is number => typeof v === "number");
    const first = scores[0];
    const latest = scores[scores.length - 1];
    // Round to one decimal so 8.6 - 7.4 shows 1.2, not 1.1999999
    const change = first === undefined ? undefined : Math.round((latest - first) * 10) / 10;
    return { name, first, latest, change };
  });

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-2xl p-12 border-4 border-dashed border-green-300 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Swings Yet</h3>
        <p className="text-gray-600">
          Analyze your first swing and it'll appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-2xl p-6 border-4 border-green-600">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="text-2xl font-black text-gray-900">My Progress</h2>
          <div className="flex items-center gap-2">
          {history.length >= 2 && (
            <button
              onClick={() => (compareMode ? exitCompare() : setCompareMode(true))}
              aria-pressed={compareMode}
              className={`text-sm font-semibold border-2 px-3 py-1 rounded-lg transition-colors ${
                compareMode
                  ? "bg-green-600 text-white border-green-700"
                  : "text-green-700 border-green-200 hover:border-green-400"
              }`}
            >
              {compareMode ? "Cancel compare" : "Compare swings"}
            </button>
          )}
          <button
            onClick={() => {
              if (confirm("Clear all swing history? This cannot be undone.")) {
                onClear();
              }
            }}
            className="text-sm text-red-500 hover:text-red-700 font-semibold border-2 border-red-200 hover:border-red-400 px-3 py-1 rounded-lg transition-colors"
          >
            Clear History
          </button>
          </div>
        </div>
        <p className="text-gray-500 text-sm">
          {history.length} swing{history.length !== 1 ? "s" : ""} shown
        </p>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl shadow-2xl p-6 border-4 border-green-600">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-black text-gray-900">
            {chartView === "overall" ? "Overall Score Over Time" : "Scores by Category"}
          </h3>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1" role="group" aria-label="Chart view">
            {(
              [
                ["overall", "Overall"],
                ["categories", "By category"],
              ] as const
            ).map(([view, label]) => (
              <button
                key={view}
                onClick={() => setChartView(view)}
                aria-pressed={chartView === view}
                className={`px-3 py-1 rounded-md text-sm font-bold transition-colors ${
                  chartView === view ? "bg-white text-green-700 shadow" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend doubles as show/hide toggles */}
        {chartView === "categories" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORY_NAMES.map((name) => {
              const hidden = hiddenCategories.has(name);
              return (
                <button
                  key={name}
                  onClick={() => toggleCategory(name)}
                  aria-pressed={!hidden}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-opacity ${
                    hidden ? "opacity-40 border-gray-200" : "border-gray-300"
                  } text-gray-800`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[name] }}
                    aria-hidden
                  />
                  {name}
                </button>
              );
            })}
          </div>
        )}

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fontWeight: 700 }}
              stroke="#6b7280"
            />
            <YAxis
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 12, fontWeight: 700 }}
              stroke="#6b7280"
            />
            <Tooltip
              cursor={{ stroke: "#9ca3af", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border-2 border-green-600 rounded-lg p-3 shadow-lg min-w-40">
                    <p className="text-gray-400 text-xs">
                      {d.date} · <span className="capitalize">{d.shot}</span>
                    </p>
                    {chartView === "overall" ? (
                      <p className="font-black text-gray-900 text-lg">{d.score}/10</p>
                    ) : (
                      <ul className="mt-1 space-y-0.5">
                        {CATEGORY_NAMES.filter((name) => !hiddenCategories.has(name) && d[name] !== undefined).map(
                          (name) => (
                            <li key={name} className="flex items-center justify-between gap-3 text-xs text-gray-800">
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: CATEGORY_COLORS[name] }}
                                  aria-hidden
                                />
                                {name}
                              </span>
                              <span className="font-black">{d[name]}</span>
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                );
              }}
            />
            {chartView === "overall" ? (
              <>
                <ReferenceLine y={8} stroke="#16a34a" strokeDasharray="4 4" label={{ value: "Great", position: "right", fontSize: 11, fill: "#16a34a" }} />
                <ReferenceLine y={6} stroke="#ca8a04" strokeDasharray="4 4" label={{ value: "Good", position: "right", fontSize: 11, fill: "#ca8a04" }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: "#16a34a", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: "#15803d" }}
                />
              </>
            ) : (
              CATEGORY_NAMES.filter((name) => !hiddenCategories.has(name)).map((name) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  name={name}
                  stroke={CATEGORY_COLORS[name]}
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 4, fill: CATEGORY_COLORS[name], stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: CATEGORY_COLORS[name], stroke: "#ffffff", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              ))
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Text version of the category chart: first vs latest score */}
        {chartView === "categories" && (
          <table className="w-full mt-4 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                <th className="py-1.5 font-bold">Category</th>
                <th className="py-1.5 font-bold text-right">First</th>
                <th className="py-1.5 font-bold text-right">Latest</th>
                <th className="py-1.5 font-bold text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {categoryChanges.map(({ name, first, latest, change }) => (
                <tr key={name} className="border-b border-gray-100 last:border-0 text-gray-800">
                  <td className="py-1.5">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[name] }}
                        aria-hidden
                      />
                      {name}
                    </span>
                  </td>
                  <td className="py-1.5 text-right">{first ?? "–"}</td>
                  <td className="py-1.5 text-right">{latest ?? "–"}</td>
                  <td
                    className={`py-1.5 text-right font-black ${
                      change === undefined || change === 0
                        ? "text-gray-500"
                        : change > 0
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {change === undefined ? "–" : `${change > 0 ? "+" : change < 0 ? "−" : "±"}${Math.abs(change)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Side-by-side comparison of the two picked swings */}
      {comparing && comparedSwings.length === 2 && (
        <SwingCompare swings={[comparedSwings[0], comparedSwings[1]]} onClose={exitCompare} />
      )}

      {/* Swing Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-gray-900 px-1">Recent Swings</h3>
        {compareMode && !comparing && (
          <div className="sticky top-2 z-10 flex items-center justify-between gap-3 bg-white border-2 border-green-600 rounded-xl px-4 py-3 shadow-lg">
            <span className="text-sm font-semibold text-gray-700">
              Pick two swings to compare ({selectedIds.length}/2)
            </span>
            <button
              onClick={() => {
                setComparing(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={selectedIds.length !== 2}
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-800 border-2 border-green-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Compare
            </button>
          </div>
        )}
        {history.map((swing) => (
          <div
            key={swing.id}
            className={`bg-white rounded-xl shadow-lg border-4 transition-all ${
              compareMode && selectedIds.includes(swing.id)
                ? "border-green-600"
                : "border-green-200 hover:border-green-500"
            }`}
          >
            {/* Card Header - always visible; picks the swing while comparing */}
            <button
              className="w-full p-5 text-left"
              aria-pressed={compareMode ? selectedIds.includes(swing.id) : undefined}
              onClick={() =>
                compareMode
                  ? toggleSelected(swing.id)
                  : setExpandedId(expandedId === swing.id ? null : swing.id)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {compareMode && (
                    <span
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-black ${
                        selectedIds.includes(swing.id)
                          ? "bg-green-600 border-green-700 text-white"
                          : "border-gray-300 text-transparent"
                      }`}
                      aria-hidden
                    >
                      ✓
                    </span>
                  )}
                  <div
                    className={`text-2xl font-black ${getScoreColor(swing.overall_score)}`}
                  >
                    {swing.overall_score.toFixed(1)}
                  </div>
                  <div>
                    <div className="font-black text-gray-900 capitalize">
                      {swing.shot_type}
                    </div>
                    <div className="text-sm text-gray-500">{swing.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full border-2 ${getScoreBadgeColor(swing.overall_score)}`}
                  >
                    {swing.overall_score >= 8
                      ? "GREAT"
                      : swing.overall_score >= 6
                      ? "GOOD"
                      : "NEEDS WORK"}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === swing.id ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded Detail */}
            {expandedId === swing.id && !compareMode && (
              <div className="px-5 pb-5 border-t-2 border-green-100 pt-4 space-y-4">
                {/* Category scores */}
                <div className="grid grid-cols-1 gap-2">
                  {swing.categories.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cat.score >= 8
                                ? "bg-green-500"
                                : cat.score >= 6
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                            style={{ width: `${cat.score * 10}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-black w-8 text-right ${getSeverityColor(cat.severity)}`}
                        >
                          {cat.score}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top priority */}
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                  <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                     Top Priority
                  </div>
                  <p className="text-sm text-green-900">{swing.top_priority}</p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => onView(swing)}
                    className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-800 border-2 border-green-900"
                  >
                    View full report
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this swing? This cannot be undone.")) {
                        onDelete(swing.id);
                      }
                    }}
                    className="text-sm font-bold text-gray-500 hover:text-red-700 underline underline-offset-4"
                  >
                    Delete swing
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}