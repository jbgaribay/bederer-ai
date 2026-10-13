// components/SwingCompare.tsx

"use client";

import { useEffect, useState } from "react";
import { loadFrameUrls, type SavedSwing } from "@/hooks/useSwingHistory";
import { CATEGORY_NAMES } from "@/types/analysis";

interface SwingCompareProps {
  // Order doesn't matter: the older swing is always shown as "Before"
  swings: [SavedSwing, SavedSwing];
  onClose: () => void;
}

function Change({ value }: { value: number }) {
  // Round so 8.6 - 7.4 shows 1.2, not 1.1999999
  const rounded = Math.round(value * 10) / 10;
  const color = rounded > 0 ? "text-green-700" : rounded < 0 ? "text-red-700" : "text-gray-500";
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "±";
  return <span className={`font-black ${color}`}>{`${sign}${Math.abs(rounded)}`}</span>;
}

function Frame({ src, label }: { src?: string; label: string }) {
  if (!src) {
    return (
      <div className="aspect-video rounded-md border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
        No frame saved
      </div>
    );
  }
  return (
    <img src={src} alt={label} className="w-full aspect-video object-cover rounded-md border-2 border-gray-800" />
  );
}

export default function SwingCompare({ swings, onClose }: SwingCompareProps) {
  const [before, after] = [...swings].sort((a, b) => a.timestamp - b.timestamp);
  const [frames, setFrames] = useState<[string[], string[]]>([[], []]);

  // Signed URLs for each swing's saved frames (empty for guests and older swings)
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadFrameUrls(before), loadFrameUrls(after)]).then(([b, a]) => {
      if (!cancelled) setFrames([b, a]);
    });
    return () => {
      cancelled = true;
    };
  }, [before, after]);

  const scoreFor = (swing: SavedSwing, name: string) => swing.categories.find((c) => c.name === name);

  return (
    <div className="bg-white rounded-xl shadow-2xl p-5 sm:p-6 border-4 border-green-600 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-black text-gray-900">Swing Comparison</h3>
        <button
          onClick={onClose}
          className="text-sm font-bold text-gray-600 hover:text-gray-900 border-2 border-gray-200 hover:border-gray-400 px-3 py-1 rounded-lg"
        >
          Close
        </button>
      </div>

      {/* Overall */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        {[before, after].map((swing, i) => (
          <div key={swing.id} className={`rounded-lg border-2 p-3 ${i === 0 ? "order-1" : "order-3"} border-green-200`}>
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">{i === 0 ? "Before" : "After"}</div>
            <div className="text-3xl font-black text-gray-900">{swing.overall_score.toFixed(1)}</div>
            <div className="text-xs text-gray-500 capitalize">
              {swing.shot_type} · {swing.date}
            </div>
          </div>
        ))}
        <div className="order-2 text-lg">
          <Change value={after.overall_score - before.overall_score} />
        </div>
      </div>

      {/* Per category: scores, change, and the reference frames side by side */}
      <div className="space-y-3">
        {CATEGORY_NAMES.map((name) => {
          const b = scoreFor(before, name);
          const a = scoreFor(after, name);
          if (!b && !a) return null;
          const beforeFrame = b?.frameIndex !== undefined ? frames[0][b.frameIndex] || undefined : undefined;
          const afterFrame = a?.frameIndex !== undefined ? frames[1][a.frameIndex] || undefined : undefined;
          return (
            <div key={name} className="border-t-2 border-gray-100 pt-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h4 className="font-black text-gray-900">{name}</h4>
                <div className="text-sm text-gray-700 whitespace-nowrap">
                  {b?.score ?? "–"} → {a?.score ?? "–"}{" "}
                  {b && a && (
                    <span className="ml-1">
                      <Change value={a.score - b.score} />
                    </span>
                  )}
                </div>
              </div>
              {/* Skip the frame row when neither swing has a saved frame (guests, older swings) */}
              {(beforeFrame || afterFrame) && (
                <div className="grid grid-cols-2 gap-3">
                  <Frame src={beforeFrame} label={`${name}, before`} />
                  <Frame src={afterFrame} label={`${name}, after`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Top priorities */}
      <div className="grid sm:grid-cols-2 gap-3 border-t-2 border-gray-100 pt-4">
        {[before, after].map((swing, i) => (
          <div key={swing.id} className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
            <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
              {i === 0 ? "Before" : "After"}: Top Priority
            </div>
            <p className="text-sm text-green-900 leading-snug">{swing.top_priority}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
