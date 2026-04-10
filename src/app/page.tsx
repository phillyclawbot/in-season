"use client";

import { useState, useCallback, useEffect } from "react";
import { getInSeasonFruits, getComingSoonFruits, fruits as allFruits } from "@/data/fruits";
import { useLocation } from "@/hooks/useLocation";
import { useFavorites } from "@/hooks/useFavorites";
import CardStack from "@/components/CardStack";
import SeasonBar from "@/components/SeasonBar";
import DotIndicator from "@/components/DotIndicator";
import FruitInfoSheet from "@/components/FruitInfoSheet";
import RegionPicker from "@/components/RegionPicker";
import TabBar, { Tab } from "@/components/TabBar";
import EmptyState from "@/components/EmptyState";

export default function Home() {
  const currentMonth = new Date().getMonth() + 1;
  const { region, location, loading, showPicker, setRegion, openPicker, closePicker } =
    useLocation();
  const { isFavorite, toggle, favorites, loaded: favLoaded } = useFavorites();

  const inSeason = getInSeasonFruits(currentMonth, region);
  const comingSoon = getComingSoonFruits(currentMonth, region);
  const inSeasonFruits = inSeason.length > 0 ? inSeason : allFruits;

  const [activeTab, setActiveTab] = useState<Tab>("season");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  const favoriteFruits = allFruits.filter((f) => isFavorite(f.id));

  const displayFruits =
    activeTab === "favorites"
      ? favoriteFruits
      : activeTab === "coming-soon"
      ? comingSoon
      : inSeasonFruits;

  const safeIndex = Math.min(currentIndex, Math.max(0, displayFruits.length - 1));

  // Reset index when tab or region changes
  useEffect(() => {
    setCurrentIndex(0);
    setSheetOpen(false);
  }, [activeTab, region]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

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

  const currentFruit = displayFruits[safeIndex] ?? null;

  const handleToggleFavorite = useCallback(
    (id: string) => toggle(id),
    [toggle]
  );

  const handleSheetToggleFavorite = useCallback(() => {
    if (currentFruit) toggle(currentFruit.id);
  }, [currentFruit, toggle]);

  if (loading || !favLoaded) {
    return (
      <main
        className="flex flex-col h-dvh items-center justify-center"
        style={{ background: "#FFF8F0" }}
      >
        <div className="text-4xl mb-3">🍓</div>
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

      <TabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        favoritesCount={favorites.size}
        comingSoonCount={comingSoon.length}
      />

      <div className="flex-1 relative overflow-hidden">
        {displayFruits.length === 0 ? (
          activeTab === "favorites" ? (
            <EmptyState
              emoji="♡"
              title="No favorites yet"
              subtitle="Tap the heart on any fruit card to save it here."
            />
          ) : (
            <EmptyState
              emoji="◷"
              title="Nothing coming soon"
              subtitle="All the fruits for next month are already in season in your region."
            />
          )
        ) : (
          <CardStack
            fruits={displayFruits}
            currentIndex={safeIndex}
            onIndexChange={handleIndexChange}
            onCardTap={handleCardTap}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </div>

      {displayFruits.length > 0 && (
        <DotIndicator
          total={displayFruits.length}
          current={safeIndex}
          accentColor={currentFruit?.colorPalette.accent || "#FF8A65"}
        />
      )}

      <FruitInfoSheet
        fruit={currentFruit}
        isOpen={sheetOpen}
        onClose={handleSheetClose}
        isFavorite={currentFruit ? isFavorite(currentFruit.id) : false}
        onToggleFavorite={handleSheetToggleFavorite}
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
