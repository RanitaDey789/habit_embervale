"use client";

import { useMemo } from "react";
import { useGame } from "@/state/gameStore";
import { StatTile, ProgressBar, EmptyState } from "@/components/ui";
import { habitCompletionRate } from "@/domain/streaks";
import { addDaysStr, todayStr, weekdayOf, formatDayShort } from "@/utils/dates";
import {
  IChart,
  ICheck,
  IFlameFill,
  IScroll,
  IShield,
  ISparkFill,
} from "@/components/icons";
import { WEEKDAYS } from "@/config/gameConfig";
import type { LogEntry } from "@/domain/types";

const COMPLETION_TYPES = new Set(["task", "daily", "habit", "milestone"]);

function isCompletion(e: LogEntry) {
  return COMPLETION_TYPES.has(e.type);
}

export default function StatsScreen() {
  const log = useGame((s) => s.log);
  const profile = useGame((s) => s.profile);
  const habits = useGame((s) => s.habits);
  const quests = useGame((s) => s.quests);

  const today = todayStr();

  const stats = useMemo(() => {
    const week = addDaysStr(today, -6);
    const month = addDaysStr(today, -29);
    const completions = log.filter(isCompletion);
    const todayCount = completions.filter((e) => e.date === today).length;
    const weekCount = completions.filter((e) => e.date >= week).length;
    const monthCount = completions.filter((e) => e.date >= month).length;

    // XP last 14 days
    const days: { day: string; xp: number }[] = [];
    for (let i = 13; i >= 0; i -= 1) {
      const day = addDaysStr(today, -i);
      const xp = log.filter((e) => e.date === day).reduce((sum, e) => sum + Math.max(0, e.xp), 0);
      days.push({ day, xp });
    }
    const maxXp = Math.max(25, ...days.map((d) => d.xp));

    // weekday productivity (this month)
    const weekdayTotals = Array.from({ length: 7 }, () => 0);
    for (const e of completions) {
      if (e.date >= month) weekdayTotals[weekdayOf(e.date)] += 1;
    }
    const bestDay = weekdayTotals.indexOf(Math.max(...weekdayTotals));

    const xpTotal14 = days.reduce((s, d) => s + d.xp, 0);
    return { todayCount, weekCount, monthCount, days, maxXp, weekdayTotals, bestDay, xpTotal14 };
  }, [log, today]);

  if (!profile) return null;

  const activeQuests = quests.filter((q) => q.status === "active");
  const noData = log.length === 0;

  return (
    <div className="px-4 pb-36">
      <header className="pt-2">
        <h1 className="font-display text-[22px] text-parchment">Chronicle</h1>
        <p className="text-[12.5px] text-ink-300">The record of your deeds, day by day.</p>
      </header>

      {noData ? (
        <EmptyState
          icon={<IChart size={26} />}
          title="The chronicle is blank"
          body="Complete your first task and the scribes will begin recording your legend."
        />
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <StatTile icon={<ICheck size={12} />} label="Today" value={String(stats.todayCount)} />
            <StatTile icon={<ICheck size={12} />} label="7 days" value={String(stats.weekCount)} />
            <StatTile icon={<ICheck size={12} />} label="30 days" value={String(stats.monthCount)} />
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            <StatTile
              icon={<IFlameFill size={12} />}
              label="Streak"
              value={`${profile.streak.current}d`}
              accent="text-ember-300"
            />
            <StatTile
              icon={<IFlameFill size={12} />}
              label="Best"
              value={`${profile.streak.best}d`}
              accent="text-ember-300"
            />
            <StatTile
              icon={<IShield size={12} />}
              label="Shields"
              value={String(profile.streak.shields)}
              accent="text-arcane-400"
            />
          </div>

          {/* XP chart */}
          <section className="mt-4 rounded-card border border-ink-600/70 bg-ink-800/90 p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink-200">
                XP — last 14 days
              </h2>
              <span className="inline-flex items-center gap-1 text-[12px] font-bold text-ember-300">
                <ISparkFill size={12} /> {stats.xpTotal14}
              </span>
            </div>
            <div className="mt-3 flex h-28 items-end gap-1.5" role="img" aria-label="XP earned per day bar chart">
              {stats.days.map((d, i) => {
                const h = d.xp === 0 ? 3 : Math.max(8, Math.round((d.xp / stats.maxXp) * 100));
                const isToday = i === stats.days.length - 1;
                return (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-md ${
                        d.xp === 0
                          ? "bg-ink-600/60"
                          : isToday
                            ? "bg-gradient-to-t from-ember-600 to-glimmer-300"
                            : "bg-gradient-to-t from-ember-600 to-ember-400"
                      }`}
                      style={{ height: `${h}%` }}
                      title={`${formatDayShort(d.day)}: ${d.xp} XP`}
                    />
                    <span className="text-[8.5px] font-semibold text-ink-400">
                      {i % 2 === 1 ? d.day.slice(8) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Weekday rhythm */}
          <section className="mt-3 rounded-card border border-ink-600/70 bg-ink-800/90 p-4">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink-200">
              Weekly rhythm
            </h2>
            <p className="mt-0.5 text-[11.5px] text-ink-300">
              Most productive: <b className="text-ember-300">{WEEKDAYS[stats.bestDay]}</b> (last 30 days)
            </p>
            <div className="mt-3 flex items-end gap-2">
              {stats.weekdayTotals.map((n, i) => {
                const max = Math.max(1, ...stats.weekdayTotals);
                return (
                  <div key={WEEKDAYS[i]} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-16 w-full items-end">
                      <div
                        className={`w-full rounded-t ${i === stats.bestDay ? "bg-glimmer-400" : "bg-ink-500"}`}
                        style={{ height: `${Math.max(6, (n / max) * 100)}%` }}
                      />
                    </div>
                    <span className={`text-[9px] font-bold ${i === stats.bestDay ? "text-glimmer-300" : "text-ink-400"}`}>
                      {WEEKDAYS[i][0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Habits */}
          {habits.length > 0 && (
            <section className="mt-3 rounded-card border border-ink-600/70 bg-ink-800/90 p-4">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink-200">
                Habit keep-rate — 14 days
              </h2>
              <div className="mt-3 space-y-3">
                {habits.map((h) => {
                  const rate = habitCompletionRate(h.completions, h.schedule, today);
                  return (
                    <div key={h.id}>
                      <div className="mb-1 flex justify-between text-[12.5px] font-semibold">
                        <span className="truncate text-parchment">
                          {h.emoji ? `${h.emoji} ` : ""}
                          {h.title}
                        </span>
                        <span className="text-ink-300 tabular-nums">
                          {Math.round(rate * 100)}% · best {h.bestStreak}d
                        </span>
                      </div>
                      <ProgressBar value={rate} max={1} tone="moss" height="h-2" label={`${h.title} keep rate`} />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Quests */}
          {activeQuests.length > 0 && (
            <section className="mt-3 rounded-card border border-ink-600/70 bg-ink-800/90 p-4">
              <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.1em] text-ink-200">
                Quest progress
              </h2>
              <div className="space-y-3">
                {activeQuests.map((q) => {
                  const done = q.steps.filter((s) => s.done).length;
                  return (
                    <div key={q.id}>
                      <div className="mb-1 flex justify-between text-[12.5px] font-semibold">
                        <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-parchment">
                          <IScroll size={13} className="shrink-0 text-ember-300" /> {q.title}
                        </span>
                        <span className="text-ink-300 tabular-nums">
                          {done}/{q.steps.length}
                        </span>
                      </div>
                      <ProgressBar value={done} max={q.steps.length || 1} height="h-2" label={`${q.title} progress`} />
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
