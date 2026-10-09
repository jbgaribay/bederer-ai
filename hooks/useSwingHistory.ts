import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { SwingAnalysis } from "@/types/analysis";
import { createClient } from "@/lib/supabase/client";

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

interface SwingRow {
  id: string;
  created_at: string;
  shot_type: string;
  overall_score: number;
  categories: SwingAnalysis["categories"];
  top_priority: string;
  drill_recommendation: string;
}

const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const fromRow = (row: SwingRow): SavedSwing => {
  const timestamp = new Date(row.created_at).getTime();
  return {
    id: row.id,
    date: formatDate(timestamp),
    timestamp,
    shot_type: row.shot_type,
    overall_score: Number(row.overall_score),
    categories: row.categories,
    top_priority: row.top_priority,
    drill_recommendation: row.drill_recommendation,
  };
};

const readLocal = (): SavedSwing[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Guests keep history in localStorage; signed-in users keep it in Supabase.
export function useSwingHistory(user: User | null, authLoading: boolean) {
  const [history, setHistory] = useState<SavedSwing[]>([]);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    (async () => {
      if (!userId) {
        if (!cancelled) setHistory(readLocal());
        return;
      }

      const supabase = createClient();

      // Move any swings saved as a guest into the new account. Clear them before the
      // insert so a re-run of this effect (auth events, Strict Mode) can't import twice.
      const local = readLocal();
      if (local.length > 0) {
        localStorage.removeItem(STORAGE_KEY);
        const { error } = await supabase.from("swings").insert(
          local.map((s) => ({
            user_id: userId,
            created_at: new Date(s.timestamp).toISOString(),
            shot_type: s.shot_type,
            overall_score: s.overall_score,
            categories: s.categories,
            top_priority: s.top_priority,
            drill_recommendation: s.drill_recommendation,
          }))
        );
        if (error) {
          console.error("Failed to import guest swings:", error);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
        }
      }

      const { data, error } = await supabase
        .from("swings")
        .select("id, created_at, shot_type, overall_score, categories, top_priority, drill_recommendation")
        .order("created_at", { ascending: false })
        .limit(MAX_SWINGS);

      if (error) console.error("Failed to load swing history:", error);
      if (!cancelled && data) setHistory(data.map(fromRow));
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, authLoading]);

  // The analyze API already saves signed-in users' swings, so this only updates local state
  // (and localStorage for guests).
  const saveSwing = (analysis: SwingAnalysis) => {
    const timestamp = Date.now();
    const newSwing: SavedSwing = {
      id: `swing_${timestamp}`,
      date: formatDate(timestamp),
      timestamp,
      shot_type: analysis.shot_type,
      overall_score: analysis.overall_score,
      categories: analysis.categories,
      top_priority: analysis.top_priority,
      drill_recommendation: analysis.drill_recommendation,
    };

    setHistory((prev) => {
      const updated = [newSwing, ...prev].slice(0, MAX_SWINGS);
      if (!userId) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          console.error("Failed to save swing");
        }
      }
      return updated;
    });

    return newSwing.id;
  };

  const clearHistory = async () => {
    if (userId) {
      const { error } = await createClient().from("swings").delete().eq("user_id", userId);
      if (error) {
        console.error("Failed to clear history:", error);
        return;
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHistory([]);
  };

  return { history, saveSwing, clearHistory };
}
