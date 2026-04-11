"use client";

interface DotIndicatorProps {
  total: number;
  current: number;
  accentColor: string;
}

const MAX_DOTS = 7;

function getDotSize(distFromActive: number, distFromEdge: number): number {
  if (distFromActive === 0) return 20;
  if (distFromEdge === 0) return 3;
  if (distFromEdge === 1) return 5;
  return 6;
}

export default function DotIndicator({ total, current, accentColor }: DotIndicatorProps) {
  if (total <= 1) return null;

  const renderDots = () => {
    if (total <= MAX_DOTS) {
      return Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            backgroundColor: i === current ? accentColor : "#D7CCC8",
          }}
          role="tab"
          aria-selected={i === current}
          aria-label={`Fruit ${i + 1} of ${total}`}
        />
      ));
    }

    // Windowed dot indicator for large lists
    const half = Math.floor(MAX_DOTS / 2);
    let windowStart = Math.max(0, current - half);
    const windowEnd = Math.min(total - 1, windowStart + MAX_DOTS - 1);
    windowStart = Math.max(0, windowEnd - MAX_DOTS + 1);

    const dots = Array.from({ length: MAX_DOTS }, (_, i) => {
      const index = windowStart + i;
      const distFromActive = Math.abs(index - current);
      const distFromEdge = Math.min(i, MAX_DOTS - 1 - i);
      return { index, distFromActive, distFromEdge };
    });

    return dots.map(({ index, distFromActive, distFromEdge }) => {
      const w = getDotSize(distFromActive, distFromEdge);
      const isActive = index === current;
      return (
        <div
          key={index}
          className="rounded-full transition-all duration-300"
          style={{
            width: isActive ? 20 : w,
            height: Math.min(w, 6),
            backgroundColor: isActive ? accentColor : "#D7CCC8",
            opacity: distFromEdge === 0 ? 0.4 : distFromEdge === 1 ? 0.7 : 1,
          }}
          role="tab"
          aria-selected={isActive}
          aria-label={`Fruit ${index + 1} of ${total}`}
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="flex justify-center items-center gap-1.5" role="tablist" aria-label="Fruit position">
        {renderDots()}
      </div>
      <p className="text-[10px] font-semibold tabular-nums" style={{ color: "#B8A088" }}>
        {current + 1} of {total}
      </p>
    </div>
  );
}
