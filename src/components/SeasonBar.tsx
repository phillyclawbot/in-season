"use client";

import { getSeasonName, getSeasonEmoji } from "@/data/fruits";

interface SeasonBarProps {
  location: string;
  month: number;
}

export default function SeasonBar({ location, month }: SeasonBarProps) {
  const season = getSeasonName(month);
  const emoji = getSeasonEmoji(month);

  return (
    <div className="flex justify-between items-center px-5 py-3" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B7355" }}>
        {location}
      </span>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{ background: "#FFF0E0", color: "#D4763A" }}
      >
        {emoji} {season}
      </span>
    </div>
  );
}
