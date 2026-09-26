import { DATA_VERSION } from "@/config/gameConfig";
import {
  AchievementRepository,
  CharacterRepository,
  HabitRepository,
  LogRepository,
  QuestRepository,
  RewardRepository,
  SettingsRepository,
  TaskRepository,
  adapter,
} from "@/storage/repositories";
import type { AppData, Settings } from "@/domain/types";

/** Serialize the entire local game state into a versioned export document. */
export async function exportData(): Promise<AppData> {
  const [profile, settings, tasks, habits, quests, rewards, log, unlocks] = await Promise.all([
    CharacterRepository.get(),
    SettingsRepository.get(),
    TaskRepository.all(),
    HabitRepository.all(),
    QuestRepository.all(),
    RewardRepository.all(),
    LogRepository.all(),
    AchievementRepository.get(),
  ]);
  return {
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      profile: profile ?? null,
      settings: settings ?? { sound: true, reducedMotion: false, lastTab: "today" },
      tasks,
      habits,
      quests,
      rewards,
      log,
      unlocks,
    },
  };
}

export interface ImportResult {
  ok: boolean;
  error?: string;
}

/** Validate + restore a previously exported document. */
export async function importData(raw: string): Promise<ImportResult> {
  let doc: AppData;
  try {
    doc = JSON.parse(raw) as AppData;
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  if (!doc || typeof doc !== "object" || !doc.data || !Array.isArray(doc.data.tasks)) {
    return { ok: false, error: "This doesn't look like an Embervale backup." };
  }
  if (typeof doc.version !== "number" || doc.version > DATA_VERSION) {
    return { ok: false, error: "This backup is from a newer version of Embervale." };
  }
  try {
    await adapter.clearAll();
    await TaskRepository.saveMany(doc.data.tasks);
    await HabitRepository.saveMany(doc.data.habits);
    await QuestRepository.saveMany(doc.data.quests);
    await RewardRepository.saveMany(doc.data.rewards);
    await LogRepository.saveMany(doc.data.log);
    if (doc.data.profile) await CharacterRepository.save(doc.data.profile);
    await SettingsRepository.save(doc.data.settings as Settings);
    await AchievementRepository.save(doc.data.unlocks);
    return { ok: true };
  } catch {
    return { ok: false, error: "Something went wrong while restoring. Your data was not changed." };
  }
}
