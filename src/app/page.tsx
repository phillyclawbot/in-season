"use client";

import { useState, useCallback } from "react";
import { getInSeasonFruits, fruits as allFruits } from "@/data/fruits";
import { DEFAULT_LOCATION } from "@/data/regions";
import CardStack from "@/components/CardStack";
import SeasonBar from "@/components/SeasonBar";
import DotIndicator from "@/components/DotIndicator";
import FruitInfoSheet from "@/components/FruitInfoSheet";

export default function Home() {
  const currentMonth = new Date().getMonth() + 1;
  const region = "Pacific";

  const inSeason = getInSeasonFruits(currentMonth, region);
  const displayFruits = inSeason.length > 0 ? inSeason : allFruits;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const currentFruit = displayFruits[currentIndex];

  return (
    <main className="flex flex-col h-dvh" style={{ background: "#FFF8F0" }}>
      <SeasonBar location={DEFAULT_LOCATION} month={currentMonth} />

      <div className="flex-1 relative overflow-hidden">
        <CardStack
          fruits={displayFruits}
          currentIndex={currentIndex}
          onIndexChange={handleIndexChange}
          onCardTap={handleCardTap}
        />
      </div>

      <DotIndicator
        total={displayFruits.length}
        current={currentIndex}
        accentColor={currentFruit?.colorPalette.accent || "#FF8A65"}
      />

      <FruitInfoSheet
        fruit={currentFruit}
        isOpen={sheetOpen}
        onClose={handleSheetClose}
      />
    </main>
  );
}
