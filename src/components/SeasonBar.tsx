"use client";

import { getSeasonName, getSeasonEmoji } from "@/data/fruits";

interface SeasonBarProps {
  location: string;
  month: number;
  onLocationClick?: () => void;
}

export default function SeasonBar({ location, month, onLocationClick }: SeasonBarProps) {
  const season = getSeasonName(month);
  const emoji = getSeasonEmoji(month);

  return (
    <div
      className="flex justify-between items-center px-5 py-3"
      style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
    >
      <button
        onClick={onLocationClick}
        className="flex items-center gap-1.5 group"
        aria-label="Change region"
      >
        <span
          className="text-xs font-semibold uppercase tracking-wide transition-opacity group-active:opacity-60"
          style={{ color: "#8B7355" }}
        >
          {location}
        </span>
        <span className="text-[10px]" style={{ color: "#B8A088" }}>
          ▾
        </span>
      </button>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ background: "#FFF0E0", color: "#D4763A" }}
      >
        {emoji} {season}
      </span>
    </div>
  );
}
