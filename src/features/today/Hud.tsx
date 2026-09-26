"use client";

import { useGame } from "@/state/gameStore";
import { Avatar } from "@/components/Avatar";
import { ProgressBar } from "@/components/ui";
import { xpNeededFor } from "@/domain/progression";
import { classById } from "@/config/classes";
import { formatDayLong } from "@/utils/dates";
import { IFlameFill, IShield, ISparkFill } from "@/components/icons";
import type { Profile } from "@/domain/types";

export function Hud({ profile, dayLabel }: { profile: Profile; dayLabel: string }) {
  const setTab = useGame((s) => s.setTab);
  const needed = xpNeededFor(profile.level);
  const cls = classById(profile.classId);

  return (
    <section
      aria-label="Character status"
      className="rounded-card border border-ink-600/70 bg-gradient-to-br from-ink-800 to-ink-850 p-3.5 shadow-lift"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTab("hero")}
          aria-label="Open your hero page"
          className="shrink-0 rounded-full active:scale-95 transition-transform"
        >
          <Avatar profile={profile} size={64} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate font-display text-[16px] text-parchment">
              {profile.name}
            </span>
            <span className="truncate text-[11px] font-semibold text-ink-300">{cls.title}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="rounded-md bg-ember-500/15 border border-ember-500/40 px-1.5 py-0.5 font-display text-[12px] font-bold text-ember-300">
              Lv {profile.level}
            </span>
            <ProgressBar
              value={profile.xp}
              max={needed}
              height="h-2"
              className="flex-1"
              label="Experience toward next level"
            />
          </div>
          <p className="mt-1 text-[11px] font-semibold tabular-nums text-ink-300">
            {profile.xp} / {needed} XP
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className="inline-flex items-center gap-1 text-[13px] font-extrabold text-ember-300"
            aria-label={`${profile.streak.current} day streak`}
          >
            <IFlameFill size={15} />
            {profile.streak.current}
            {profile.streak.shields > 0 && (
              <span
                className="ml-0.5 inline-flex items-center gap-0.5 text-[11px] font-bold text-arcane-300"
                aria-label={`${profile.streak.shields} streak shields`}
              >
                <IShield size={12} />
                {profile.streak.shields}
              </span>
            )}
          </span>
          <span
            className="inline-flex items-center gap-1 text-[13px] font-extrabold text-glimmer-300"
            aria-label={`${profile.glimmer} glimmer`}
          >
            <ISparkFill size={14} />
            {profile.glimmer}
          </span>
        </div>
      </div>
      <p className="mt-2.5 border-t border-ink-600/50 pt-2 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-300">
        {dayLabel || formatDayLong(new Date().toISOString().slice(0, 10))}
      </p>
    </section>
  );
}
