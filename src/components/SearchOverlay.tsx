"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fruit, formatSeasonMonths } from "@/data/fruits";

interface SearchOverlayProps {
  fruits: Fruit[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fruit: Fruit) => void;
  isFavorite: (id: string) => boolean;
}

export default function SearchOverlay({
  fruits,
  isOpen,
  onClose,
  onSelect,
  isFavorite,
}: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = query.trim()
    ? fruits.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          f.variety.toLowerCase().includes(query.toLowerCase()) ||
          f.flavorProfile.some((fp) =>
            fp.toLowerCase().includes(query.toLowerCase())
          )
      )
    : fruits;

  const handleSelect = useCallback(
    (fruit: Fruit) => {
      onSelect(fruit);
      onClose();
    },
    [onSelect, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(62, 39, 35, 0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-x-0 top-0 z-50 bg-white rounded-b-[28px] shadow-2xl"
            style={{
              maxHeight: "85vh",
              paddingTop: "max(12px, env(safe-area-inset-top))",
            }}
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            {/* Search input */}
            <div className="px-5 pt-3 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
                  style={{ background: "#F5F0EB" }}
                >
                  <span className="text-sm" style={{ color: "#B8A088" }}>
                    ⌕
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search fruits, flavors…"
                    className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[#B8A088]"
                    style={{ color: "#3E2723" }}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{ background: "#D7CCC8", color: "#8B7355" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-sm font-semibold"
                  style={{ color: "#8B7355" }}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Results */}
            <div
              className="overflow-y-auto px-3 pb-6"
              style={{ maxHeight: "calc(85vh - 70px)" }}
            >
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">🔍</p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#8B7355" }}
                  >
                    No fruits found
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#B8A088" }}>
                    Try a different search term
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filtered.map((fruit) => (
                    <button
                      key={fruit.id}
                      onClick={() => handleSelect(fruit)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-left transition-all active:scale-[0.98]"
                      style={{ background: "transparent" }}
                    >
                      <span className="text-2xl w-9 text-center">
                        {fruit.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-bold truncate"
                          style={{ color: "#3E2723" }}
                        >
                          {fruit.name}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "#8B7355" }}
                        >
                          {fruit.variety} · {formatSeasonMonths(fruit.seasonMonths)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isFavorite(fruit.id) && (
                          <span className="text-xs" style={{ color: "#E8334A" }}>
                            ♥
                          </span>
                        )}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: fruit.colorPalette.accent }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
