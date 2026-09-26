import { describe, expect, it } from "vitest";
import { applyXpGain, taskRewards, totalXpForLevel, xpNeededFor } from "@/domain/progression";
import {
  habitBestStreak,
  habitCurrentStreak,
  reconcileStreak,
  registerActiveDay,
} from "@/domain/streaks";
import { evaluateAchievements } from "@/domain/achievementsEngine";
import { buildSnapshot } from "@/state/snapshot";
import { GAME_CONFIG } from "@/config/gameConfig";
import type { Profile } from "@/domain/types";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    name: "Test",
    classId: "vanguard",
    avatarSeed: 1,
    level: 1,
    xp: 0,
    totalXp: 0,
    glimmer: 0,
    equipped: {},
    owned: [],
    streak: { current: 0, best: 0, shields: 0 },
    stats: {},
    onboarded: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("progression", () => {
  it("computes a growing level curve", () => {
    expect(xpNeededFor(1)).toBe(GAME_CONFIG.level.base);
    expect(xpNeededFor(5)).toBeGreaterThan(xpNeededFor(4));
    expect(xpNeededFor(20)).toBeGreaterThan(xpNeededFor(5));
  });

  it("applies XP with single level up", () => {
    const r = applyXpGain(1, 90, 30);
    expect(r.level).toBe(2);
    expect(r.xp).toBe(20);
    expect(r.levelsGained).toBe(1);
  });

  it("applies XP with multiple level ups", () => {
    const r = applyXpGain(1, 0, 10_000);
    expect(r.level).toBeGreaterThan(3);
    expect(r.levelsGained).toBeGreaterThan(1);
    expect(totalXpForLevel(r.level) + r.xp).toBe(10_000);
  });

  it("scales rewards by priority", () => {
    const calm = taskRewards("todo", 1);
    const urgent = taskRewards("todo", 3);
    expect(urgent.xp).toBeGreaterThan(calm.xp);
    expect(urgent.glimmer).toBeGreaterThan(calm.glimmer);
    expect(calm.xp).toBe(GAME_CONFIG.rewards.xp.todo);
  });

  it("gives milestone rewards", () => {
    const r = taskRewards("milestone");
    expect(r.xp).toBe(GAME_CONFIG.rewards.xp.milestone);
  });
});

describe("streaks", () => {
  const base = { current: 5, best: 9, lastActiveDay: "2025-01-10", shields: 1 };

  it("keeps streak when last active yesterday", () => {
    const r = reconcileStreak(base, "2025-01-11");
    expect(r.broke).toBe(false);
    expect(r.shieldsUsed).toBe(0);
    expect(r.streak.current).toBe(5);
  });

  it("spends a shield for one missed day", () => {
    const r = reconcileStreak(base, "2025-01-12");
    expect(r.broke).toBe(false);
    expect(r.shieldsUsed).toBe(1);
    expect(r.streak.shields).toBe(0);
    expect(r.streak.current).toBe(5);
  });

  it("resets when shields run out", () => {
    const r = reconcileStreak({ ...base, shields: 0 }, "2025-01-13");
    expect(r.broke).toBe(true);
    expect(r.streak.current).toBe(0);
  });

  it("increments on consecutive days and tracks best", () => {
    const s1 = registerActiveDay({ current: 0, best: 0, shields: 0 }, "2025-01-10");
    expect(s1.current).toBe(1);
    const s2 = registerActiveDay(s1, "2025-01-11");
    expect(s2.current).toBe(2);
    expect(s2.best).toBe(2);
    // idempotent within the same day
    expect(registerActiveDay(s2, "2025-01-11").current).toBe(2);
  });

  it("grants a shield every 7 consecutive days", () => {
    let s = { current: 0, best: 0, shields: 0 } as { current: number; best: number; lastActiveDay?: string; shields: number };
    for (let i = 0; i < 7; i += 1) {
      s = registerActiveDay(s, `2025-01-${String(i + 10).padStart(2, "0")}`);
    }
    expect(s.current).toBe(7);
    expect(s.shields).toBe(1);
  });

  it("restarts after a gap", () => {
    const s = registerActiveDay(base, "2025-02-01");
    expect(s.current).toBe(1);
  });

  it("computes habit streaks with grace", () => {
    const today = "2025-01-14";
    const completions = ["2025-01-14", "2025-01-13", "2025-01-11", "2025-01-10"];
    // schedule every day; 2025-01-12 missed but forgiven by grace=1
    expect(habitCurrentStreak(completions, [], today, 1)).toBe(4);
    expect(habitCurrentStreak(completions, [], today, 0)).toBe(2);
  });

  it("respects weekly schedules", () => {
    // schedule only Mondays (weekday 1)
    const today = "2025-01-13"; // a Monday
    const completions = ["2025-01-13", "2025-01-06"];
    expect(habitCurrentStreak(completions, [1], today, 0)).toBe(2);
  });

  it("recomputes best streak from history", () => {
    const completions = ["2025-01-10", "2025-01-11", "2025-01-12", "2025-01-14", "2025-01-15"];
    expect(habitBestStreak(completions, [])).toBeGreaterThanOrEqual(3);
  });
});

describe("achievements", () => {
  it("unlocks First Spark on the first completion", () => {
    const p = profile({ stats: { tasks: 1 } });
    const newly = evaluateAchievements(buildSnapshot(p), new Set());
    expect(newly.map((a) => a.id)).toContain("first-spark");
  });

  it("does not re-unlock already earned deeds", () => {
    const p = profile({ stats: { tasks: 1 } });
    const newly = evaluateAchievements(buildSnapshot(p), new Set(["first-spark"]));
    expect(newly.map((a) => a.id)).not.toContain("first-spark");
  });

  it("unlocks level achievements", () => {
    const p = profile({ level: 5, stats: {} });
    const ids = evaluateAchievements(buildSnapshot(p), new Set()).map((a) => a.id);
    expect(ids).toContain("torchbearer");
    expect(ids).toContain("rising-ember");
  });

  it("unlocks streak achievements", () => {
    const p = profile({ streak: { current: 7, best: 7, shields: 1 } });
    const ids = evaluateAchievements(buildSnapshot(p), new Set()).map((a) => a.id);
    expect(ids).toContain("week-of-fire");
  });
});
