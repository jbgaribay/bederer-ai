// types/analysis.ts

export interface AnalysisCategory {
    name: string;
    score: number;
    severity: "good" | "needs_work" | "critical";
    observation: string;
    tip: string;
    frameIndex?: number; // Which frame (0-5) corresponds to this category
  }
  
  // The five technique areas every analysis scores, in report order
  export const CATEGORY_NAMES = [
    "Stance & Preparation",
    "Backswing & Unit Turn",
    "Contact Point",
    "Follow-Through",
    "Footwork & Balance",
  ] as const;

  export interface Drill {
    name: string;
    focus: string; // One of CATEGORY_NAMES
    steps: string[];
    reps: string;
    equipment: string;
  }

  export interface SwingAnalysis {
    overall_score: number;
    shot_type: string;
    categories: AnalysisCategory[];
    top_priority: string;
    drill_recommendation: string; // Plain-text drill (all swings)
    drill?: Drill | null; // Structured drill (swings analyzed after drills were added)
    frames?: string[]; // Base64 encoded frame images
    swing_id?: string; // Saved row id in public.swings (signed-in users only)
    frame_paths?: (string | null)[] | null; // Storage paths of the saved frames (signed-in users only)
  }