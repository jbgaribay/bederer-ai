// components/DrillsList.tsx

"use client";

import { useState } from "react";
import type { SavedSwing } from "@/hooks/useSwingHistory";
import { CATEGORY_NAMES } from "@/types/analysis";
import { weakestCategory } from "@/lib/player-context";
import DrillDetails from "@/components/DrillDetails";

interface DrillsListProps {
  history: SavedSwing[];
  onView: (swing: SavedSwing) => void;
}

// Older swings have no structured drill, so use their lowest-scoring category as the focus
const drillFocus = (swing: SavedSwing) => swing.drill?.focus ?? weakestCategory(swing.categories)?.name;

export default function DrillsList({ history, onView }: DrillsListProps) {
  const [filter, setFilter] = useState<string>("All");

  const withDrills = history.filter((swing) => swing.drill || swing.drill_recommendation);
  const shown = filter === "All" ? withDrills : withDrills.filter((swing) => drillFocus(swing) === filter);

  if (withDrills.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-2xl p-12 border-4 border-dashed border-green-300 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Drills Yet</h3>
        <p className="text-gray-600">Analyze a swing to get your first drill.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter by focus area */}
      <div className="flex flex-wrap gap-2">
        {["All", ...CATEGORY_NAMES].map((name) => {
          const count =
            name === "All" ? withDrills.length : withDrills.filter((swing) => drillFocus(swing) === name).length;
          return (
            <button
              key={name}
              onClick={() => setFilter(name)}
              aria-pressed={filter === name}
              className={`px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-colors ${
                filter === name
                  ? "bg-green-600 text-white border-green-700"
                  : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50"
              }`}
            >
              {name} <span className={filter === name ? "text-green-100" : "text-gray-400"}>{count}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="text-gray-600 bg-white rounded-xl border-2 border-green-200 p-6 text-center">
          No drills for {filter} yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {shown.map((swing) => (
            <div
              key={swing.id}
              className="bg-white rounded-xl shadow-lg border-4 border-blue-200 p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-gray-900 leading-tight">
                    {swing.drill?.name ?? `Drill from ${swing.date}`}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                    {swing.shot_type} · {swing.date}
                  </p>
                </div>
                <button
                  onClick={() => onView(swing)}
                  className="shrink-0 text-sm font-bold text-green-700 hover:text-green-900 underline underline-offset-4"
                >
                  View report
                </button>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2">
                <span className="font-bold text-gray-700">Targets: </span>
                {swing.top_priority}
              </p>

              <div className="text-blue-900 bg-blue-50 rounded-lg p-3">
                <DrillDetails drill={swing.drill} fallbackText={swing.drill_recommendation} hideName />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
