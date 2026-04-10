"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fruit, formatSeasonMonths } from "@/data/fruits";

interface FruitInfoSheetProps {
  fruit: Fruit | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function FruitInfoSheet({
  fruit,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: FruitInfoSheetProps) {
  const [shareToast, setShareToast] = useState(false);

  // Keyboard dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleShare = useCallback(async () => {
    if (!fruit) return;
    const text = `${fruit.emoji} ${fruit.name} is in season right now! ${fruit.description.slice(0, 100)}…`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${fruit.name} — In Season`,
          text,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text}\n\n${window.location.href}`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {}
  }, [fruit]);

  return (
    <AnimatePresence>
      {isOpen && fruit && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(62, 39, 35, 0.3)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[28px] shadow-2xl"
            style={{ maxHeight: "82vh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150 || info.velocity.y > 500) onClose();
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div
              className="px-5 pb-10 overflow-y-auto"
              style={{ height: "calc(82vh - 28px)" }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-2xl">{fruit.emoji}</span>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-extrabold leading-tight" style={{ color: "#3E2723" }}>
                      {fruit.name}
                    </h2>
                    <p className="text-xs font-medium" style={{ color: "#8B7355" }}>
                      {fruit.variety}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Favorite button */}
                  {onToggleFavorite && (
                    <button
                      onClick={onToggleFavorite}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
                      style={{
                        background: isFavorite ? "#FFF0F3" : "#F5F0EB",
                        color: isFavorite ? "#E8334A" : "#8B7355",
                      }}
                      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <span className="text-base">{isFavorite ? "♥" : "♡"}</span>
                    </button>
                  )}

                  {/* Share button */}
                  <button
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
                    style={{ background: "#F5F0EB", color: "#8B7355" }}
                    aria-label="Share"
                  >
                    <span className="text-sm">↑</span>
                  </button>

                  {/* Season badge */}
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: `${fruit.colorPalette.accent}18`,
                      color: fruit.colorPalette.accent,
                    }}
                  >
                    {formatSeasonMonths(fruit.seasonMonths)}
                  </span>
                </div>
              </div>

              {/* Toast */}
              <AnimatePresence>
                {shareToast && (
                  <motion.div
                    className="mt-2 text-center text-xs font-semibold py-1.5 rounded-xl"
                    style={{ background: "#3E2723", color: "#FFF8F0" }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Link copied to clipboard ✓
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Flavor tags */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {fruit.flavorProfile.map((flavor) => (
                  <span
                    key={flavor}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50"
                    style={{ color: "#8B7355" }}
                  >
                    {flavor}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "#5D4037" }}>
                {fruit.description}
              </p>

              {/* Nutrition */}
              <div className="mt-5 p-4 rounded-2xl" style={{ background: `${fruit.colorPalette.accent}0C` }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: fruit.colorPalette.accent }}>
                    Nutrition
                  </p>
                  <p className="text-xs font-semibold" style={{ color: fruit.colorPalette.accent }}>
                    {fruit.nutrition.calories} cal / 100g
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {fruit.nutrition.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: `${fruit.colorPalette.accent}18`, color: "#5D4037" }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recipes */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#8B7355" }}>
                  Recipes
                </p>
                <div className="flex flex-col gap-2.5">
                  {fruit.recipes.map((recipe, i) => (
                    <div key={i} className="p-3.5 rounded-2xl" style={{ background: "#FFF8F0" }}>
                      <p className="text-sm font-bold" style={{ color: "#3E2723" }}>
                        {recipe.name}
                      </p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8B7355" }}>
                        {recipe.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage tips */}
              <div className="mt-4 p-4 rounded-2xl" style={{ background: "#FFF8F0" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#8B7355" }}>
                  Storage tip
                </p>
                <p className="text-sm" style={{ color: "#5D4037" }}>
                  {fruit.storageTips}
                </p>
              </div>

              {/* Fun fact */}
              <div className="mt-4 p-4 rounded-2xl" style={{ background: "#FFF8F0" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#8B7355" }}>
                  Fun fact
                </p>
                <p className="text-sm" style={{ color: "#5D4037" }}>
                  {fruit.funFact}
                </p>
              </div>

              {/* Peak month */}
              <div className="mt-4 text-center">
                <p className="text-xs font-medium" style={{ color: "#B8A088" }}>
                  Peak month:{" "}
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][fruit.peakMonth - 1]}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
