"use client";

import { Suspense, lazy, useEffect } from "react";
import { useGame } from "@/state/gameStore";
import { FxLayer } from "@/components/FxLayer";
import { IChart, IGem, IHelm, IHome, IMap, IFlameFill } from "@/components/icons";
import type { TabId } from "@/domain/types";

const QuestsScreen = lazy(() => import("@/features/quests/QuestsScreen"));
const HeroScreen = lazy(() => import("@/features/hero/HeroScreen"));
const RewardsScreen = lazy(() => import("@/features/rewards/RewardsScreen"));
const StatsScreen = lazy(() => import("@/features/stats/StatsScreen"));
const Onboarding = lazy(() => import("@/features/onboarding/Onboarding"));
import TodayScreen from "@/features/today/TodayScreen";

const NAV: { id: TabId; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  { id: "today", label: "Today", icon: () => <IHome size={22} /> },
  { id: "quests", label: "Quests", icon: () => <IMap size={22} /> },
  { id: "hero", label: "Hero", icon: () => <IHelm size={22} /> },
  { id: "rewards", label: "Rewards", icon: () => <IGem size={22} /> },
  { id: "stats", label: "Chronicle", icon: () => <IChart size={22} /> },
];

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
      <span className="text-ember-400 animate-aura-pulse">
        <IFlameFill size={44} />
      </span>
      <p className="font-display text-[15px] tracking-[0.3em] text-ink-200">EMBERVALE</p>
    </div>
  );
}

function ScreenFallback() {
  return <div className="py-20 text-center text-[13px] text-ink-400">Lighting the lanterns…</div>;
}

export default function AppShell() {
  const hydrated = useGame((s) => s.hydrated);
  const profile = useGame((s) => s.profile);
  const tab = useGame((s) => s.tab);
  const setTab = useGame((s) => s.setTab);
  const hydrate = useGame((s) => s.hydrate);
  const checkRollover = useGame((s) => s.checkRollover);
  const storageError = useGame((s) => s.storageError);

  useEffect(() => {
    void hydrate();
    const iv = window.setInterval(checkRollover, 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") checkRollover();
    };
    document.addEventListener("visibilitychange", onVis);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
    return () => {
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hydrated) return <Splash />;

  if (!profile || !profile.onboarded) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-[430px]">
        <Suspense fallback={<Splash />}>
          <Onboarding />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col border-x border-ink-600/60 bg-ink-950">
      {storageError && (
        <div role="alert" className="border-b border-[#e5b0a8] bg-[#ffdad6] px-4 py-2 text-[12px] font-semibold text-[#93000a]">
          {storageError}
        </div>
      )}

      <main className="flex-1 pt-safe">
        {tab === "today" && <TodayScreen />}
        {tab === "quests" && (
          <Suspense fallback={<ScreenFallback />}>
            <QuestsScreen />
          </Suspense>
        )}
        {tab === "hero" && (
          <Suspense fallback={<ScreenFallback />}>
            <HeroScreen />
          </Suspense>
        )}
        {tab === "rewards" && (
          <Suspense fallback={<ScreenFallback />}>
            <RewardsScreen />
          </Suspense>
        )}
        {tab === "stats" && (
          <Suspense fallback={<ScreenFallback />}>
            <StatsScreen />
          </Suspense>
        )}
      </main>

      {/* Bottom navigation */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-ink-600/80 bg-ink-850/95 backdrop-blur-md pb-safe shadow-[0_-4px_18px_-6px_rgb(91_64_45/0.12)]"
      >
        <div className="flex">
          {NAV.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[60px] flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? "text-ember-600" : "text-ink-400 active:text-ink-200"
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-b bg-ember-500" aria-hidden />
                )}
                {item.icon(active)}
                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <FxLayer />
    </div>
  );
}
