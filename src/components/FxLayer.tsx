"use client";

import { useGame } from "@/state/gameStore";
import { Btn } from "@/components/ui";
import { achievementIcon } from "@/components/icons";
import { ICheck, IFlameFill, IScroll, ISparkFill } from "@/components/icons";

function Toasts() {
  const toasts = useGame((s) => s.fx.toasts);
  const dismiss = useGame((s) => s.dismissToast);
  if (toasts.length === 0) return null;
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-[150px] left-1/2 z-[70] w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 space-y-2"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto flex w-full animate-toast-in items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-lift-lg ${
            t.tone === "danger"
              ? "border-[#e5b0a8] bg-[#ffdad6]"
              : t.tone === "gold"
                ? "border-[#e3c98d] bg-[#fff3d6]"
                : t.tone === "xp"
                  ? "border-[#ecc4ab] bg-[#ffe9dd]"
                  : "border-ink-600 bg-ink-800"
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              t.tone === "danger"
                ? "bg-[#f7c2bb] text-blood-500"
                : t.tone === "gold"
                  ? "bg-glimmer-200 text-glimmer-600"
                  : t.tone === "xp"
                    ? "bg-ember-200 text-ember-600"
                    : "bg-ink-700 text-ink-200"
            }`}
          >
            {t.tone === "gold" ? <ISparkFill size={15} /> : <ICheck size={15} strokeWidth={2.4} />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13.5px] font-bold text-parchment">{t.title}</span>
            {t.sub && <span className="block text-[11.5px] text-ink-300">{t.sub}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

function LevelUpOverlay() {
  const levelUp = useGame((s) => s.fx.levelUp);
  const ack = useGame((s) => s.ackLevelUp);
  if (!levelUp) return null;
  return (
    <div className="fixed inset-0 z-[80] flex animate-fade-in items-center justify-center bg-[rgba(30,41,34,0.45)] p-6 backdrop-blur-[4px]">
      <div className="w-full max-w-[340px] animate-level-zoom rounded-3xl border border-ember-500/50 bg-ink-850 p-6 text-center shadow-lift-lg">
        <p className="font-display text-[13px] font-semibold tracking-[0.3em] text-ember-600">
          LEVEL UP
        </p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="font-display text-[40px] text-ink-400">{levelUp.from}</span>
          <span className="text-ember-500">
            <IFlameFill size={26} />
          </span>
          <span className="font-display text-[46px] font-bold text-ember-600">{levelUp.to}</span>
        </div>
        <p className="mt-2 text-[13px] text-ink-300">Your legend grows. Keep the fire fed.</p>
        <Btn variant="primary" className="mt-5 w-full" onClick={ack}>
          Onward
        </Btn>
      </div>
    </div>
  );
}

function QuestDoneOverlay() {
  const questDone = useGame((s) => s.fx.questDone);
  const ack = useGame((s) => s.ackQuestDone);
  if (!questDone) return null;
  return (
    <div className="fixed inset-0 z-[80] flex animate-fade-in items-center justify-center bg-[rgba(30,41,34,0.45)] p-6 backdrop-blur-[4px]">
      <div className="w-full max-w-[340px] animate-level-zoom rounded-3xl border border-moss-400/60 bg-ink-850 p-6 text-center shadow-lift-lg">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-moss-300/40 text-moss-400">
          <IScroll size={28} />
        </span>
        <p className="mt-3 font-display text-[13px] font-semibold tracking-[0.26em] text-moss-400">
          QUEST COMPLETE
        </p>
        <p className="mt-2 text-[17px] font-bold text-parchment">{questDone.title}</p>
        <p className="mt-1 text-[13.5px] font-bold">
          <span className="text-ember-600">+{questDone.xp} XP</span>
          <span className="mx-2 text-ink-400">·</span>
          <span className="text-glimmer-600">+{questDone.glimmer} ✦</span>
        </p>
        <Btn variant="primary" className="mt-5 w-full" onClick={ack}>
          Claim glory
        </Btn>
      </div>
    </div>
  );
}

function AchievementOverlay() {
  const queue = useGame((s) => s.fx.achievementQueue);
  const ack = useGame((s) => s.ackAchievement);
  const def = queue[0];
  if (!def) return null;
  return (
    <div className="fixed inset-0 z-[75] flex animate-fade-in items-end justify-center bg-[rgba(30,41,34,0.4)] p-4 backdrop-blur-[2px] sm:items-center">
      <div className="w-full max-w-[360px] animate-toast-in rounded-3xl border border-glimmer-500/60 bg-ink-850 p-5 shadow-lift-lg">
        <div className="flex items-center gap-3.5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-glimmer-200 text-glimmer-600">
            {achievementIcon(def.icon, 26)}
          </span>
          <div className="min-w-0">
            <p className="font-display text-[11px] font-semibold tracking-[0.24em] text-glimmer-600">
              DEED RECORDED
            </p>
            <p className="mt-0.5 text-[16px] font-bold text-parchment">{def.name}</p>
            <p className="text-[12px] leading-snug text-ink-300">{def.description}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-ink-900 border border-ink-600 px-3.5 py-2.5">
          <span className="text-[12.5px] font-bold">
            {def.reward.xp > 0 && <span className="text-ember-600">+{def.reward.xp} XP</span>}
            {def.reward.xp > 0 && def.reward.glimmer > 0 && (
              <span className="mx-1.5 text-ink-400">·</span>
            )}
            {def.reward.glimmer > 0 && <span className="text-glimmer-600">+{def.reward.glimmer} ✦</span>}
          </span>
          <Btn variant="gold" className="!min-h-9 px-4 text-[13px]" onClick={ack}>
            Claim
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function FxLayer() {
  const levelUp = useGame((s) => s.fx.levelUp);
  const questDone = useGame((s) => s.fx.questDone);
  return (
    <>
      <Toasts />
      {!levelUp && !questDone && <AchievementOverlay />}
      {!levelUp && questDone && <QuestDoneOverlay />}
      <LevelUpOverlay />
    </>
  );
}
