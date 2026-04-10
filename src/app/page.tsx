"use client";

import { useState, useCallback, useEffect } from "react";
import { getInSeasonFruits, fruits as allFruits } from "@/data/fruits";
import { useLocation } from "@/hooks/useLocation";
import CardStack from "@/components/CardStack";
import SeasonBar from "@/components/SeasonBar";
import DotIndicator from "@/components/DotIndicator";
import FruitInfoSheet from "@/components/FruitInfoSheet";
import RegionPicker from "@/components/RegionPicker";

export default function Home() {
  const currentMonth = new Date().getMonth() + 1;
  const { region, location, loading, showPicker, setRegion, openPicker, closePicker } =
    useLocation();

  const inSeason = getInSeasonFruits(currentMonth, region);
  const displayFruits = inSeason.length > 0 ? inSeason : allFruits;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Reset to first card when region changes
  useEffect(() => {
    setCurrentIndex(0);
    setSheetOpen(false);
  }, [region]);

  const handleIndexChange = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex);
    setSheetOpen(false);
  }, []);

  const handleCardTap = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const currentFruit = displayFruits[Math.min(currentIndex, displayFruits.length - 1)];

  if (loading) {
    return (
      <main className="flex flex-col h-dvh items-center justify-center" style={{ background: "#FFF8F0" }}>
        <div className="text-3xl mb-3">🍓</div>
        <p className="text-sm font-medium" style={{ color: "#8B7355" }}>
          Finding your fruits…
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-dvh" style={{ background: "#FFF8F0" }}>
      <SeasonBar
        location={location}
        month={currentMonth}
        onLocationClick={openPicker}
      />

      <div className="flex-1 relative overflow-hidden">
        <CardStack
          fruits={displayFruits}
          currentIndex={Math.min(currentIndex, displayFruits.length - 1)}
          onIndexChange={handleIndexChange}
          onCardTap={handleCardTap}
        />
      </div>

      <DotIndicator
        total={displayFruits.length}
        current={Math.min(currentIndex, displayFruits.length - 1)}
        accentColor={currentFruit?.colorPalette.accent || "#FF8A65"}
      />

      <FruitInfoSheet
        fruit={currentFruit}
        isOpen={sheetOpen}
        onClose={handleSheetClose}
      />

      {showPicker && (
        <RegionPicker
          currentRegion={region}
          onSelect={setRegion}
          onDismiss={closePicker}
          required={false}
        />
      )}
    </main>
  );
}
