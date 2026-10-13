// components/DrillDetails.tsx

import type { Drill } from "@/types/analysis";

interface DrillDetailsProps {
  drill?: Drill | null;
  // Plain-text drill, shown for older swings that have no structured drill
  fallbackText: string;
  // Hide the drill name (when the caller already shows it as a heading)
  hideName?: boolean;
}

export default function DrillDetails({ drill, fallbackText, hideName = false }: DrillDetailsProps) {
  if (!drill) {
    return <p className="text-sm leading-snug">{fallbackText}</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      {!hideName && <p className="font-black leading-tight">{drill.name}</p>}
      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 border border-current">
        {drill.focus}
      </span>
      <ol className="list-decimal pl-5 space-y-1 leading-snug">
        {drill.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <p className="text-xs font-semibold opacity-80">
        {drill.reps} · Equipment: {drill.equipment}
      </p>
    </div>
  );
}
