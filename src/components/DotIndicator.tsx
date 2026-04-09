"use client";

interface DotIndicatorProps {
  total: number;
  current: number;
  accentColor: string;
}

export default function DotIndicator({ total, current, accentColor }: DotIndicatorProps) {
  return (
    <div className="flex justify-center items-center gap-2 py-3" role="tablist" aria-label="Fruit position">
      {Array.from({ length: total }, (_, i) => (
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
          aria-current={i === current ? "true" : undefined}
          aria-label={`Fruit ${i + 1} of ${total}`}
        />
      ))}
    </div>
  );
}
