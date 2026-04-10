"use client";

export type Tab = "season" | "favorites" | "coming-soon";

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  favoritesCount: number;
  comingSoonCount: number;
}

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "season", label: "In Season", emoji: "✦" },
  { id: "favorites", label: "Saved", emoji: "♥" },
  { id: "coming-soon", label: "Coming Soon", emoji: "◷" },
];

export default function TabBar({ activeTab, onTabChange, favoritesCount, comingSoonCount }: TabBarProps) {
  return (
    <div
      className="flex items-center justify-around px-3 pt-1 pb-1"
      style={{ background: "#FFF8F0" }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        const count =
          tab.id === "favorites"
            ? favoritesCount
            : tab.id === "coming-soon"
            ? comingSoonCount
            : null;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-200 min-w-0 flex-1"
            style={{
              background: isActive ? "#3E2723" : "transparent",
            }}
            aria-selected={isActive}
            role="tab"
          >
            <span
              className="text-base leading-none"
              style={{ color: isActive ? "#FFD4A3" : "#B8A088" }}
            >
              {tab.emoji}
            </span>
            <span
              className="text-[10px] font-bold tracking-wide"
              style={{ color: isActive ? "#FFF8F0" : "#8B7355" }}
            >
              {tab.label}
              {count !== null && count > 0 ? ` (${count})` : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
