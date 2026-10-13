import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import type { Drill, SwingAnalysis } from "@/types/analysis";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "swingcoach_history";
// Guests keep the last 10 in localStorage; signed-in users load more for the chart and Drills tab
const MAX_SWINGS = 10;
const MAX_REMOTE_SWINGS = 30;
const SWING_FRAMES_BUCKET = "swing-frames";
// Signed URLs for viewing saved frames last an hour
const FRAME_URL_TTL_SECONDS = 60 * 60;

export interface SavedSwing {
  id: string;
  date: string;
  timestamp: number;
  shot_type: string;
  overall_score: number;
  categories: SwingAnalysis["categories"];
  top_priority: string;
  drill_recommendation: string;
  drill?: Drill | null;
  // Storage paths of the 6 frames, in order (signed-in swings saved after frames were added)
  frame_paths?: (string | null)[] | null;
}

interface SwingRow {
  id: string;
  created_at: string;
  shot_type: string;
  overall_score: number;
  categories: SwingAnalysis["categories"];
  top_priority: string;
  drill_recommendation: string;
  drill: Drill | null;
  frame_paths: (string | null)[] | null;
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
    drill: row.drill,
    frame_paths: row.frame_paths,
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

// Deletes frame files from storage; a failure only leaves orphaned files, so it's just logged
async function removeFrames(supabase: ReturnType<typeof createClient>, paths: (string | null)[]) {
  const toRemove = paths.filter((p): p is string => Boolean(p));
  if (toRemove.length === 0) return;
  const { error } = await supabase.storage.from(SWING_FRAMES_BUCKET).remove(toRemove);
  if (error) console.error("Failed to delete swing frames:", error);
}

// Short-lived URLs for a saved swing's frames, in frame order ("" where a frame is missing)
export async function loadFrameUrls(swing: SavedSwing): Promise<string[]> {
  const paths = swing.frame_paths ?? [];
  const existing = paths.filter((p): p is string => Boolean(p));
  if (existing.length === 0) return [];
  const { data, error } = await createClient()
    .storage.from(SWING_FRAMES_BUCKET)
    .createSignedUrls(existing, FRAME_URL_TTL_SECONDS);
  if (error || !data) {
    console.error("Failed to load swing frames:", error);
    return [];
  }
  const urlByPath = new Map(data.map((item) => [item.path, item.signedUrl]));
  return paths.map((p) => (p ? urlByPath.get(p) ?? "" : ""));
}

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
        .select("id, created_at, shot_type, overall_score, categories, top_priority, drill_recommendation, drill, frame_paths")
        .order("created_at", { ascending: false })
        .limit(MAX_REMOTE_SWINGS);

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
      // Signed-in swings use the saved row's id so they can be deleted later
      id: analysis.swing_id ?? `swing_${timestamp}`,
      date: formatDate(timestamp),
      timestamp,
      shot_type: analysis.shot_type,
      overall_score: analysis.overall_score,
      categories: analysis.categories,
      top_priority: analysis.top_priority,
      drill_recommendation: analysis.drill_recommendation,
      drill: analysis.drill,
      frame_paths: analysis.frame_paths,
    };

    setHistory((prev) => {
      const updated = [newSwing, ...prev].slice(0, userId ? MAX_REMOTE_SWINGS : MAX_SWINGS);
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
      const supabase = createClient();
      const { data: rows } = await supabase.from("swings").select("frame_paths");
      const { error } = await supabase.from("swings").delete().eq("user_id", userId);
      if (error) {
        console.error("Failed to clear history:", error);
        return;
      }
      await removeFrames(supabase, (rows ?? []).flatMap((row) => row.frame_paths ?? []));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHistory([]);
  };

  const deleteSwing = async (id: string) => {
    if (userId) {
      // Local-only ids (swing_<timestamp>) mean the server save failed; nothing to delete there
      if (!id.startsWith("swing_")) {
        const supabase = createClient();
        const swing = history.find((s) => s.id === id);
        const { error } = await supabase.from("swings").delete().eq("id", id);
        if (error) {
          console.error("Failed to delete swing:", error);
          return;
        }
        await removeFrames(supabase, swing?.frame_paths ?? []);
      }
      setHistory((prev) => prev.filter((s) => s.id !== id));
    } else {
      setHistory((prev) => {
        const updated = prev.filter((s) => s.id !== id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          console.error("Failed to delete swing");
        }
        return updated;
      });
    }
  };

  return { history, saveSwing, deleteSwing, clearHistory };
}
