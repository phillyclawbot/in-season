"use client";

import { motion, AnimatePresence } from "framer-motion";

interface RegionPickerProps {
  currentRegion: string;
  onSelect: (region: string, location: string) => void;
  onDismiss: () => void;
  required?: boolean;
}

const REGIONS = [
  {
    value: "Pacific",
    label: "Pacific",
    states: "CA · OR · WA · HI · AK",
    emoji: "🌊",
  },
  {
    value: "Mountain",
    label: "Mountain West",
    states: "CO · AZ · NV · UT · ID · MT · WY · NM",
    emoji: "⛰️",
  },
  {
    value: "Midwest",
    label: "Midwest",
    states: "IL · OH · MI · WI · MN · IA · MO · KS · NE · SD · ND · IN",
    emoji: "🌾",
  },
  {
    value: "Northeast",
    label: "Northeast",
    states: "NY · PA · MA · CT · NJ · MD · ME · NH · VT · RI · DE · DC",
    emoji: "🍁",
  },
  {
    value: "Southeast",
    label: "Southeast",
    states: "FL · GA · NC · TN · AL · VA · SC · MS · KY · WV",
    emoji: "🌴",
  },
  {
    value: "South Central",
    label: "South Central",
    states: "TX · OK · AR · LA",
    emoji: "☀️",
  },
];

export default function RegionPicker({
  currentRegion,
  onSelect,
  onDismiss,
  required = false,
}: RegionPickerProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        {!required && (
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(62, 39, 35, 0.4)" }}
            onClick={onDismiss}
          />
        )}
        {required && (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(62, 39, 35, 0.5)" }}
          />
        )}

        {/* Sheet */}
        <motion.div
          className="relative w-full rounded-t-[28px] shadow-2xl"
          style={{ background: "#FFF8F0" }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: "#D7CCC8" }} />
          </div>

          <div className="px-5 pt-2 pb-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: "#3E2723" }}>
                  Your Region
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#8B7355" }}>
                  We show fruits grown near you
                </p>
              </div>
              {!required && (
                <button
                  onClick={onDismiss}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "#EDE0D4", color: "#8B7355" }}
                  aria-label="Close"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {REGIONS.map((r) => {
                const isSelected = r.value === currentRegion;
                return (
                  <button
                    key={r.value}
                    onClick={() => onSelect(r.value, r.label)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-left transition-all"
                    style={{
                      background: isSelected ? "#3E2723" : "#FFF0E0",
                      color: isSelected ? "#FFF8F0" : "#3E2723",
                    }}
                  >
                    <span className="text-xl">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{r.label}</p>
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: isSelected ? "#FFD4A3" : "#8B7355" }}
                      >
                        {r.states}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-sm font-bold" style={{ color: "#FFD4A3" }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
