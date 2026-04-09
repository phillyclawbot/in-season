"use client";

import { Fruit, formatSeasonMonths } from "@/data/fruits";

interface FruitCardProps {
  fruit: Fruit;
  onTap?: () => void;
}

export default function FruitCard({ fruit, onTap }: FruitCardProps) {
  return (
    <div
      className="w-full h-full rounded-[28px] overflow-hidden relative shadow-xl"
      style={{ background: fruit.colorPalette.primary }}
      onClick={onTap}
      role="article"
      aria-label={`${fruit.name}, in season ${formatSeasonMonths(fruit.seasonMonths)}`}
    >
      {/* Photo — fills entire card */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fruit.imageUrl}
        alt={fruit.name}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Gradient scrim at bottom so text is readable over photo */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "55%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.38) 50%, transparent 100%)",
        }}
      />

      {/* Info panel — floats over the photo at the bottom */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-6 pt-4">
        <h2 className="text-[34px] font-extrabold tracking-tight leading-none text-white">
          {fruit.name}
        </h2>
        <p className="text-sm mt-1 font-medium text-white/70">
          {fruit.variety}
        </p>

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

        <p className="text-xs mt-2.5 font-medium text-white/50">
          Tap for more ↑
        </p>
      </div>
    </div>
  );
}
