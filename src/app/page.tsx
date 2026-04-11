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
import SearchOverlay from "@/components/SearchOverlay";

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
  const [searchOpen, setSearchOpen] = useState(false);

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

  const handleSearchOpen = useCallback(() => setSearchOpen(true), []);
  const handleSearchClose = useCallback(() => setSearchOpen(false), []);

  const handleSearchSelect = useCallback(
    (fruit: { id: string }) => {
      // Find the fruit in the current display list first
      const displayIndex = displayFruits.findIndex((f) => f.id === fruit.id);
      if (displayIndex !== -1) {
        setCurrentIndex(displayIndex);
      } else {
        // Switch to season tab and find it there
        setActiveTab("season");
        const seasonIndex = inSeasonFruits.findIndex((f) => f.id === fruit.id);
        if (seasonIndex !== -1) {
          setTimeout(() => setCurrentIndex(seasonIndex), 50);
        }
      }
      setSheetOpen(true);
    },
    [displayFruits, inSeasonFruits]
  );

  // Preload images for adjacent cards
  useEffect(() => {
    const preloadIndexes = [safeIndex + 1, safeIndex + 2];
    preloadIndexes.forEach((idx) => {
      const fruit = displayFruits[idx];
      if (fruit) {
        const img = new Image();
        img.src = fruit.imageUrl;
      }
    });
  }, [safeIndex, displayFruits]);

  if (loading || !favLoaded) {
    return (
      <main
        className="flex flex-col h-dvh items-center justify-center gap-4"
        style={{ background: "#FFF8F0" }}
      >
        <div className="relative">
          <div className="text-5xl animate-bounce">🍓</div>
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full opacity-20 animate-pulse"
            style={{ background: "#3E2723" }}
          />
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-sm font-bold" style={{ color: "#3E2723" }}>
            In Season
          </p>
          <p className="text-xs font-medium" style={{ color: "#8B7355" }}>
            Finding what&apos;s fresh near you…
          </p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {["🍊", "🫐", "🍑"].map((emoji, i) => (
            <span
              key={emoji}
              className="text-lg opacity-0"
              style={{
                animation: `fadeInUp 0.4s ease forwards ${0.3 + i * 0.15}s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-dvh" style={{ background: "#FFF8F0" }}>
      <SeasonBar
        location={location}
        month={currentMonth}
        onLocationClick={openPicker}
        onSearchClick={handleSearchOpen}
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

      <SearchOverlay
        fruits={allFruits}
        isOpen={searchOpen}
        onClose={handleSearchClose}
        onSelect={handleSearchSelect}
        isFavorite={isFavorite}
      />
    </main>
  );
}
