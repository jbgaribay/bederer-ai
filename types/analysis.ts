// types/analysis.ts

export interface AnalysisCategory {
    name: string;
    score: number;
    severity: "good" | "needs_work" | "critical";
    observation: string;
    tip: string;
  }
  
  export interface SwingAnalysis {
    overall_score: number;
    shot_type: string;
    categories: AnalysisCategory[];
    top_priority: string;
    drill_recommendation: string;
  }