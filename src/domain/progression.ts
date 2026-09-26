import { GAME_CONFIG } from "@/config/gameConfig";
import type { Priority, TaskKind } from "@/domain/types";

/** XP required to advance from `level` to `level + 1`. */
export function xpNeededFor(level: number): number {
  const { base, growth, roundTo, maxLevel } = GAME_CONFIG.level;
  if (level >= maxLevel) return Infinity;
  const raw = base * Math.pow(growth, Math.max(0, level - 1));
  return Math.max(roundTo, Math.round(raw / roundTo) * roundTo);
}

export interface XpResult {
  level: number;
  xp: number; // xp within the new level
  levelsGained: number;
  capped: boolean;
}

/** Pure XP application with the configured level curve. */
export function applyXpGain(level: number, xpInLevel: number, gain: number): XpResult {
  const { maxLevel } = GAME_CONFIG.level;
  let lvl = level;
  let xp = xpInLevel + Math.max(0, Math.round(gain));
  let gained = 0;
  while (lvl < maxLevel && xp >= xpNeededFor(lvl)) {
    xp -= xpNeededFor(lvl);
    lvl += 1;
    gained += 1;
  }
  if (lvl >= maxLevel) {
    return { level: maxLevel, xp: 0, levelsGained: gained, capped: true };
  }
  return { level: lvl, xp, levelsGained: gained, capped: false };
}

/** Reward for completing a task/habit, honoring priority multipliers. */
export function taskRewards(
  kind: TaskKind | "habit" | "milestone",
  priority: Priority = 1
): { xp: number; glimmer: number } {
  const r = GAME_CONFIG.rewards;
  const mult = r.priorityMultiplier[priority] ?? 1;
  const baseXp =
    kind === "habit" ? r.xp.habit : kind === "milestone" ? r.xp.milestone : r.xp[kind];
  const baseG =
    kind === "habit"
      ? r.glimmer.habit
      : kind === "milestone"
        ? r.glimmer.milestone
        : r.glimmer[kind];
  return {
    xp: Math.round(baseXp * mult),
    glimmer: Math.round(baseG * mult),
  };
}

/** Total XP required to reach a given level from level 1. */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l += 1) total += xpNeededFor(l);
  return total;
}
