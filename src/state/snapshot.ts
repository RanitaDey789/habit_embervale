import type { CounterSnapshot, Profile } from "@/domain/types";

export function stat(p: Profile, key: string): number {
  return p.stats[key] ?? 0;
}

/** Build the cumulative counters snapshot used by the achievement engine. */
export function buildSnapshot(p: Profile): CounterSnapshot {
  const tasks = stat(p, "tasks");
  const dailies = stat(p, "dailies");
  const habits = stat(p, "habits");
  return {
    level: p.level,
    totalXp: p.totalXp,
    glimmer: p.glimmer,
    glimmerEarned: stat(p, "glimmerEarned"),
    glimmerSpent: stat(p, "glimmerSpent"),
    tasks,
    dailies,
    habits,
    completions: tasks + dailies + habits,
    milestones: stat(p, "milestones"),
    quests: stat(p, "quests"),
    streak: p.streak.current,
    bestStreak: p.streak.best,
    redeemed: stat(p, "redeemed"),
    earlyBird: stat(p, "earlyBird"),
    nightOwl: stat(p, "nightOwl"),
    cosmeticsOwned: p.owned.length,
  };
}
