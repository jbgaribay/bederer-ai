import { useState, useEffect } from "react";
import { SwingAnalysis } from "@/types/analysis";

const STORAGE_KEY = "swingcoach_history";
const MAX_SWINGS = 10;

export interface SavedSwing {
  id: string;
  date: string;
  timestamp: number;
  shot_type: string;
  overall_score: number;
  categories: SwingAnalysis["categories"];
  top_priority: string;
  drill_recommendation: string;
}

export function useSwingHistory() {
  const [history, setHistory] = useState<SavedSwing[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      console.error("Failed to load swing history");
    }
  }, []);

  const saveSwing = (analysis: SwingAnalysis) => {
    const newSwing: SavedSwing = {
      id: `swing_${Date.now()}`,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      timestamp: Date.now(),
      shot_type: analysis.shot_type,
      overall_score: analysis.overall_score,
      categories: analysis.categories,
      top_priority: analysis.top_priority,
      drill_recommendation: analysis.drill_recommendation,
    };

    setHistory((prev) => {
      const updated = [newSwing, ...prev].slice(0, MAX_SWINGS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        console.error("Failed to save swing");
      }
      return updated;
    });

    return newSwing.id;
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  return { history, saveSwing, clearHistory };
}