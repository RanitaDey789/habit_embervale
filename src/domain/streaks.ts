import { GAME_CONFIG } from "@/config/gameConfig";
import { addDaysStr, daysBetween, weekdayOf } from "@/utils/dates";
import type { StreakState } from "@/domain/types";

export interface ReconcileResult {
  streak: StreakState;
  shieldsUsed: number;
  broke: boolean;
}

/**
 * Reconcile the global streak against today.
 * A gap of one day (i.e. last active yesterday) is always safe.
 * Longer gaps consume streak shields; when shields run out, the streak resets.
 */
export function reconcileStreak(streak: StreakState, today: string): ReconcileResult {
  if (!streak.lastActiveDay) return { streak, shieldsUsed: 0, broke: false };
  const gap = daysBetween(streak.lastActiveDay, today);
  if (gap <= 1) return { streak, shieldsUsed: 0, broke: false };

  const missed = gap - 1;
  if (streak.shields >= missed) {
    return {
      streak: { ...streak, shields: streak.shields - missed },
      shieldsUsed: missed,
      broke: false,
    };
  }
  return {
    streak: { ...streak, current: 0, shields: 0 },
    shieldsUsed: streak.shields,
    broke: true,
  };
}

/**
 * Register an active day. Increments the streak when the previous active
 * day was yesterday, restarts at 1 otherwise, and grants shields on cadence.
 */
export function registerActiveDay(streak: StreakState, today: string): StreakState {
  if (streak.lastActiveDay === today) return streak;

  const { shieldsEvery, maxShields } = GAME_CONFIG.streak;
  const gap = streak.lastActiveDay ? daysBetween(streak.lastActiveDay, today) : Infinity;
  const current = gap === 1 ? streak.current + 1 : 1;
  const best = Math.max(streak.best, current);
  let shields = streak.shields;
  if (current > 0 && current % shieldsEvery === 0 && shields < maxShields) {
    shields += 1;
  }
  return { current, best, lastActiveDay: today, shields };
}

export function isScheduledOn(schedule: number[], day: string): boolean {
  return schedule.length === 0 || schedule.includes(weekdayOf(day));
}

/**
 * Current streak for a habit, walking back through scheduled days.
 * Up to `grace` missed scheduled days are forgiven inside the window.
 */
export function habitCurrentStreak(
  completions: string[],
  schedule: number[],
  today: string,
  grace: number = GAME_CONFIG.streak.habitGrace
): number {
  const done = new Set(completions);
  let cur = 0;
  let misses = 0;
  for (let i = 0; i < 400; i += 1) {
    const day = addDaysStr(today, -i);
    if (!isScheduledOn(schedule, day)) continue;
    if (done.has(day)) {
      cur += 1;
      misses = 0;
    } else {
      misses += 1;
      if (misses > grace) break;
    }
  }
  return cur;
}

/** Best streak recomputed from history (used after imports). */
export function habitBestStreak(completions: string[], schedule: number[]): number {
  if (completions.length === 0) return 0;
  const days = [...completions].sort();
  let best = 0;
  let cur = 0;
  const grace = GAME_CONFIG.streak.habitGrace;
  let misses = 0;
  const start = days[0];
  const end = days[days.length - 1];
  for (let d = start; d <= end; d = addDaysStr(d, 1)) {
    if (!isScheduledOn(schedule, d)) continue;
    if (completions.includes(d)) {
      cur += 1;
      misses = 0;
      best = Math.max(best, cur);
    } else {
      misses += 1;
      if (misses > grace) {
        cur = 0;
        misses = 0;
      }
    }
  }
  return best;
}

/** Completion % over the last `windowDays` scheduled days (0..1). */
export function habitCompletionRate(
  completions: string[],
  schedule: number[],
  today: string,
  windowDays = 14
): number {
  const done = new Set(completions);
  let scheduled = 0;
  let hit = 0;
  for (let i = 0; i < windowDays; i += 1) {
    const day = addDaysStr(today, -i);
    if (!isScheduledOn(schedule, day)) continue;
    scheduled += 1;
    if (done.has(day)) hit += 1;
  }
  return scheduled === 0 ? 0 : hit / scheduled;
}
