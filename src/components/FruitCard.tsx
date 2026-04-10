"use client";

import { Fruit, formatSeasonMonths } from "@/data/fruits";

interface FruitCardProps {
  fruit: Fruit;
  onTap?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  dimmed?: boolean;
}

export default function FruitCard({
  fruit,
  onTap,
  isFavorite = false,
  onToggleFavorite,
  dimmed = false,
}: FruitCardProps) {
  return (
    <div
      className="w-full h-full rounded-[28px] overflow-hidden relative shadow-xl"
      style={{
        background: fruit.colorPalette.primary,
        opacity: dimmed ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
      onClick={onTap}
      role="article"
      aria-label={`${fruit.name}, in season ${formatSeasonMonths(fruit.seasonMonths)}`}
    >
      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fruit.imageUrl}
        alt={fruit.name}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Gradient scrim */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "60%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 55%, transparent 100%)",
        }}
      />

      {/* Top bar — emoji + favorite button */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between px-5 pt-5">
        <span className="text-2xl drop-shadow-sm">{fruit.emoji}</span>
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
            style={{
              background: isFavorite ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.28)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <span
              className="text-base leading-none"
              style={{
                color: isFavorite ? "#E8334A" : "rgba(255,255,255,0.85)",
              }}
            >
              {isFavorite ? "♥" : "♡"}
            </span>
          </button>
        )}
      </div>

      {/* Info panel */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-6 pt-4">
        <h2 className="text-[34px] font-extrabold tracking-tight leading-none text-white">
          {fruit.name}
        </h2>
        <p className="text-sm mt-1 font-medium text-white/70">{fruit.variety}</p>

        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
            {formatSeasonMonths(fruit.seasonMonths)}
          </span>
          {fruit.flavorProfile.slice(0, 2).map((flavor) => (
            <span
              key={flavor}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 text-white/90 backdrop-blur-sm"
            >
              {flavor}
            </span>
          ))}
        </div>

        <p className="text-xs mt-2.5 font-medium text-white/50">Tap for more ↑</p>
      </div>
    </div>
  );
}
