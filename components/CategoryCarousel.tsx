"use client";

// components/CategoryCarousel.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { AnalysisCategory } from "@/types/analysis";
import CategoryCard from "@/components/CategoryCard";

interface CategoryCarouselProps {
  categories: AnalysisCategory[];
  // Base64 JPEG frames from the analysis, indexed by category.frameIndex
  frames?: string[];
}

// Shows two cards at a time (one on phones); the arrows move one card per click.
export default function CategoryCarousel({ categories, frames }: CategoryCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [first, setFirst] = useState(0);
  const [visible, setVisible] = useState(1);
  const [atEnd, setAtEnd] = useState(false);
  // Card the arrows are heading to; kept separately so clicks mid-animation stack correctly
  const targetRef = useRef(0);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Distance between the start of one slide and the next
  const getStep = () => {
    const track = trackRef.current;
    const slides = track?.children;
    if (!track || !slides || slides.length < 2) return track?.clientWidth ?? 0;
    return (slides[1] as HTMLElement).offsetLeft - (slides[0] as HTMLElement).offsetLeft;
  };

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = getStep();
    if (!step) return;
    const index = Math.round(track.scrollLeft / step);
    setFirst(index);
    setVisible(Math.max(1, Math.round(track.clientWidth / step)));
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 2);

    // Once scrolling stops (including swipes), sync the arrow target to where we landed
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      targetRef.current = index;
    }, 150);
  }, []);

  // Recalculate whenever the track's width changes (window resize, layout shifts)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => observer.disconnect();
  }, [update, categories.length]);

  const scrollToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, categories.length - visible));
    targetRef.current = clamped;
    trackRef.current?.scrollTo({ left: clamped * getStep(), behavior: "smooth" });
  };

  const move = (direction: 1 | -1) => scrollToIndex(targetRef.current + direction);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    }
  };

  const last = Math.min(first + visible, categories.length);
  const atStart = first === 0;

  const arrowClass =
    "absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border-4 border-green-600 text-green-700 text-2xl font-black shadow-lg flex items-center justify-center hover:bg-green-50 disabled:opacity-0 disabled:pointer-events-none transition-opacity";

  return (
    // inline-size containment: the slides' width never widens the parent layout
    <div className="[contain:inline-size]">
      <div className="relative">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={atStart}
          aria-label="Previous tip"
          className={`${arrowClass} -left-5`}
        >
          ‹
        </button>

        <div
          ref={trackRef}
          onScroll={update}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Technique breakdown"
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-green-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((category, index) => {
            const frame =
              category.frameIndex !== undefined ? frames?.[category.frameIndex] : undefined;
            return (
              <div
                key={index}
                className="snap-start shrink-0 min-w-0 w-full sm:w-[calc(50%-0.75rem)] flex [&>*]:w-full [&>*]:min-w-0"
              >
                <CategoryCard
                  category={category}
                  frame={frame ? `data:image/jpeg;base64,${frame}` : undefined}
                />
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => move(1)}
          disabled={atEnd}
          aria-label="Next tip"
          className={`${arrowClass} -right-5`}
        >
          ›
        </button>
      </div>

      {/* Position: counter and dots */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-gray-500">
          {last - first > 1 ? `Cards ${first + 1}–${last}` : `Card ${first + 1}`} of {categories.length}
        </span>
        <div className="flex gap-2">
          {categories.map((category, index) => {
            const shown = index >= first && index < last;
            return (
              <button
                key={index}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Show ${category.name}`}
                aria-current={shown ? "true" : undefined}
                className={`h-3 rounded-full transition-all ${
                  shown ? "w-6 bg-green-600" : "w-3 bg-green-200 hover:bg-green-300"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
