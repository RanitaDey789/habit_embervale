import { idbAdapter } from "@/storage/idbAdapter";
import type { StorageAdapter } from "@/storage/adapter";
import type {
  AchievementUnlock,
  Habit,
  LogEntry,
  Profile,
  Quest,
  Reward,
  Settings,
  Task,
} from "@/domain/types";

export const KV_KEYS = {
  profile: "profile",
  settings: "settings",
  unlocks: "unlocks",
  meta: "meta",
} as const;

/** Thin typed wrappers over the storage adapter. Swap the adapter, keep the API. */
function makeRepo<T extends { id: string }>(store: Parameters<StorageAdapter["getAll"]>[0]) {
  return {
    all: () => idbAdapter.getAll<T>(store),
    save: (value: T) => idbAdapter.put(store, value),
    saveMany: (values: T[]) => idbAdapter.bulkPut(store, values),
    delete: (id: string) => idbAdapter.remove(store, id),
    clear: () => idbAdapter.clearStore(store),
  };
}

export const TaskRepository = makeRepo<Task>("tasks");
export const HabitRepository = makeRepo<Habit>("habits");
export const QuestRepository = makeRepo<Quest>("quests");
export const RewardRepository = makeRepo<Reward>("rewards");
export const LogRepository = makeRepo<LogEntry>("log");

export const CharacterRepository = {
  get: () => idbAdapter.kvGet<Profile>(KV_KEYS.profile),
  save: (p: Profile) => idbAdapter.kvSet(KV_KEYS.profile, p),
};

export const SettingsRepository = {
  get: () => idbAdapter.kvGet<Settings>(KV_KEYS.settings),
  save: (s: Settings) => idbAdapter.kvSet(KV_KEYS.settings, s),
};

export const AchievementRepository = {
  get: async () => (await idbAdapter.kvGet<AchievementUnlock[]>(KV_KEYS.unlocks)) ?? [],
  save: (u: AchievementUnlock[]) => idbAdapter.kvSet(KV_KEYS.unlocks, u),
};

export const MetaRepository = {
  get: () => idbAdapter.kvGet<Record<string, string>>(KV_KEYS.meta),
  save: (m: Record<string, string>) => idbAdapter.kvSet(KV_KEYS.meta, m),
};

export const adapter = idbAdapter;
