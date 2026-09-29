"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useHousehold } from "@/hooks/useHousehold";
import { useGroceryList, createHousehold, lookupHousehold } from "@/hooks/useGroceryList";
import { useSales } from "@/hooks/useSales";
import type { GroceryItem } from "@/lib/grocery/types";
import WelcomeScreen from "./WelcomeScreen";
import AddBar from "./AddBar";
import ListView from "./ListView";
import DealsView from "./DealsView";
import SettingsSheet from "./SettingsSheet";
import ItemSheet from "./ItemSheet";
import { C } from "./theme";

type View = "list" | "deals";

const EMPTY_ITEMS: GroceryItem[] = [];
const EMPTY_STORES: number[] = [];

export default function GroceryApp() {
  const { profile, loaded, setName, setCode, leave } = useHousehold();
  const list = useGroceryList(profile.code, profile.name);

  const [view, setView] = useState<View>("list");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  // Invite links look like /grocery?join=ABC123
  const [joinCode] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return new URLSearchParams(window.location.search).get("join")?.toUpperCase() ?? "";
    } catch {
      return "";
    }
  });
  useEffect(() => {
    if (joinCode) window.history.replaceState(null, "", window.location.pathname);
  }, [joinCode]);

  const items = list.state?.items ?? EMPTY_ITEMS;
  const zip = list.state?.settings.zip ?? "";
  const storeIds = list.state?.settings.storeIds ?? EMPTY_STORES;
  const salesEnabled = /^\d{5}$/.test(zip);
  const sales = useSales(items, zip, storeIds, salesEnabled);

  const openItem = useMemo(() => items.find((i) => i.id === openItemId) ?? null, [items, openItemId]);

  const handleCreate = useCallback(
    async (name: string) => {
      const state = await createHousehold();
      setName(name);
      setCode(state.code);
    },
    [setName, setCode]
  );

  const handleJoin = useCallback(
    async (name: string, code: string) => {
      const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      const state = await lookupHousehold(clean);
      if (!state) throw new Error("No list with that code. Double-check it with your partner.");
      setName(name);
      setCode(state.code);
    },
    [setName, setCode]
  );

  // Leave-list from inside the settings sheet (also used when the list was deleted server-side)
  const handleLeave = useCallback(() => {
    setSettingsOpen(false);
    leave();
  }, [leave]);

  if (!loaded) {
    return <main className="h-dvh" style={{ background: C.cream }} />;
  }

  if (!profile.code || (list.status === "missing" && list.hydrated)) {
    return (
      <WelcomeScreen
        key={profile.code ?? "none"}
        initialName={profile.name}
        initialCode={joinCode}
        onCreate={handleCreate}
        onJoin={handleJoin}
      />
    );
  }

  const openCount = items.filter((i) => !i.checked).length;
  const dealCount = salesEnabled ? items.filter((i) => !i.checked && sales.salesFor(i).length > 0).length : 0;

  return (
    <main className="flex flex-col h-dvh" style={{ background: C.cream }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
      >
        <Link href="/" className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.earth }} aria-label="Back to fruits">
          🍓 Fruits
        </Link>
        <div className="flex items-center gap-2">
          <StatusDot status={list.status} pending={list.pendingCount} />
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-base"
            style={{ background: C.accentSoft }}
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      <div className="px-5 pb-2">
        <h1 className="text-2xl font-extrabold leading-tight" style={{ color: C.brown }}>
          Grocery list
        </h1>
        <p className="text-xs font-semibold" style={{ color: C.earthLight }}>
          {openCount === 0 ? "Nothing to buy" : `${openCount} to buy`}
          {salesEnabled && dealCount > 0 ? ` · ${dealCount} on sale` : ""}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-5 pb-2">
        {(
          [
            { id: "list", label: "List", emoji: "🧺" },
            { id: "deals", label: "Deals", emoji: "🏷" },
          ] as { id: View; label: string; emoji: string }[]
        ).map((tab) => {
          const on = tab.id === view;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              role="tab"
              aria-selected={on}
              className="flex-1 py-2 rounded-2xl text-xs font-bold tracking-wide"
              style={{ background: on ? C.brown : "transparent", color: on ? C.cream : C.earth }}
            >
              {tab.emoji} {tab.label}
              {tab.id === "deals" && dealCount > 0 ? ` (${dealCount})` : ""}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        {!list.state ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-8">
            <div className="text-4xl">🛒</div>
            <p className="text-sm font-medium" style={{ color: C.earth }}>
              {list.status === "offline" ? "Can't reach the server yet…" : "Loading your list…"}
            </p>
          </div>
        ) : view === "list" ? (
          <ListView
            items={items}
            salesFor={sales.salesFor}
            isLoadingSale={sales.isLoading}
            salesEnabled={salesEnabled}
            onToggle={list.toggleItem}
            onOpen={(item) => setOpenItemId(item.id)}
            onClearChecked={list.clearChecked}
          />
        ) : (
          <DealsView
            items={items}
            zip={zip}
            storeNames={list.state.settings.storeNames}
            salesFor={sales.salesFor}
            anyLoading={sales.anyLoading}
            error={sales.error}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenItem={(item) => setOpenItemId(item.id)}
            onRefresh={sales.refresh}
          />
        )}
      </div>

      {view === "list" && <AddBar onAdd={list.addItems} />}

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        code={profile.code}
        name={profile.name}
        settings={list.state?.settings ?? { zip: "", storeIds: [], storeNames: {} }}
        onChangeName={setName}
        onChangeSettings={list.updateSettings}
        onLeave={handleLeave}
      />

      <ItemSheet
        item={openItem}
        matches={openItem ? sales.salesFor(openItem) : []}
        loading={openItem ? sales.isLoading(openItem) : false}
        salesEnabled={salesEnabled}
        onClose={() => setOpenItemId(null)}
        onUpdate={list.updateItem}
        onRemove={list.removeItem}
      />
    </main>
  );
}

function StatusDot({ status, pending }: { status: string; pending: number }) {
  const color =
    status === "synced" ? C.sale : status === "syncing" || status === "loading" ? C.accent : C.earthLight;
  const label =
    status === "synced"
      ? "Synced"
      : status === "syncing"
      ? "Syncing…"
      : status === "offline"
      ? pending > 0
        ? `Offline · ${pending} to send`
        : "Offline"
      : "Loading";
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: C.earth }} title={label}>
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
