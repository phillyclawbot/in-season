"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fruit, formatSeasonMonths } from "@/data/fruits";

interface FruitInfoSheetProps {
  fruit: Fruit | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FruitInfoSheet({ fruit, isOpen, onClose }: FruitInfoSheetProps) {
  // Keyboard dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
            style={{ height: "60vh", maxHeight: "500px" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150 || info.velocity.y > 500) {
                onClose();
              }
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="px-6 pb-8 overflow-y-auto" style={{ height: "calc(100% - 28px)" }}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "#3E2723" }}>
                    {fruit.name}
                  </h2>
                  <p className="text-sm font-medium" style={{ color: "#8B7355" }}>
                    {fruit.variety}
                  </p>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: `${fruit.colorPalette.accent}20`, color: fruit.colorPalette.accent }}
                >
                  {formatSeasonMonths(fruit.seasonMonths)}
                </span>
              </div>

              {/* Flavor tags */}
              <div className="flex gap-2 mt-4">
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
              <p className="mt-5 text-sm leading-relaxed" style={{ color: "#5D4037" }}>
                {fruit.description}
              </p>

              {/* Storage tips */}
              <div className="mt-5 p-4 rounded-2xl" style={{ background: "#FFF8F0" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#8B7355" }}>
                  Storage tip
                </p>
                <p className="text-sm" style={{ color: "#5D4037" }}>
                  {fruit.storageTips}
                </p>
              </div>

              {/* Fun fact */}
              <div className="mt-4 p-4 rounded-2xl" style={{ background: `${fruit.colorPalette.accent}08` }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: fruit.colorPalette.accent }}>
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
