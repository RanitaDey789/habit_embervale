import { ACHIEVEMENTS, type AchievementDef } from "@/config/achievements";
import type { CounterSnapshot } from "@/domain/types";

/** Returns definitions that are newly satisfied given already-unlocked ids. */
export function evaluateAchievements(
  snapshot: CounterSnapshot,
  unlockedIds: Set<string>
): AchievementDef[] {
  return ACHIEVEMENTS.filter((def) => !unlockedIds.has(def.id) && def.when(snapshot));
}
