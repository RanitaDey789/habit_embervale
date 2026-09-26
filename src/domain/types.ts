/** Core entity types for Embervale. IDs are used for relationships. */

export type ID = string;

export type TabId = "today" | "quests" | "hero" | "rewards" | "stats";

export type TaskKind = "todo" | "daily";
export type Priority = 1 | 2 | 3; // 1 = calm, 2 = steady, 3 = urgent

export interface Task {
  id: ID;
  title: string;
  notes?: string;
  kind: TaskKind;
  priority: Priority;
  /** YYYY-MM-DD, for one-time todos */
  dueDate?: string;
  /** HH:mm */
  dueTime?: string;
  /** Weekdays the daily repeats (0=Sun..6=Sat). Empty = every day. */
  recurrence: number[];
  /** YYYY-MM-DD of last completion for dailies */
  lastCompletedDay?: string;
  /** ISO timestamp for one-time todos */
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: ID;
  title: string;
  emoji?: string;
  /** Weekdays (0..6). Empty = every day. */
  schedule: number[];
  /** Completed days, YYYY-MM-DD */
  completions: string[];
  bestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestStep {
  id: ID;
  title: string;
  done: boolean;
  completedAt?: string;
}

export type QuestStatus = "active" | "done";

export interface Quest {
  id: ID;
  title: string;
  description?: string;
  steps: QuestStep[];
  status: QuestStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ClassId =
  | "vanguard"
  | "arcanist"
  | "pathstrider"
  | "loreweaver"
  | "emberwright";

export type CosmeticSlot = "frame" | "aura" | "title";

export interface Cosmetic {
  id: string;
  slot: CosmeticSlot;
  name: string;
  price: number;
  /** HSL hue used by the avatar renderer */
  hue: number;
  flavor: string;
}

export interface StreakState {
  current: number;
  best: number;
  /** YYYY-MM-DD of the last day with at least one completion */
  lastActiveDay?: string;
  /** Streak shields absorb missed days */
  shields: number;
}

export interface Profile {
  name: string;
  classId: ClassId;
  avatarSeed: number;
  level: number;
  /** XP accumulated within the current level */
  xp: number;
  totalXp: number;
  glimmer: number;
  equipped: Partial<Record<CosmeticSlot, string>>;
  owned: string[];
  streak: StreakState;
  /** Cumulative counters used by achievements & stats */
  stats: Record<string, number>;
  onboarded: boolean;
  createdAt: string;
}

export interface Reward {
  id: ID;
  title: string;
  price: number;
  icon: string;
  note?: string;
  redeemedCount: number;
  createdAt: string;
  updatedAt: string;
}

export type LogType =
  | "task"
  | "daily"
  | "habit"
  | "milestone"
  | "quest"
  | "levelup"
  | "redeem"
  | "achievement";

export interface LogEntry {
  id: ID;
  date: string; // YYYY-MM-DD
  ts: number;
  type: LogType;
  title: string;
  xp: number;
  gold: number;
  refId?: ID;
}

export interface AchievementUnlock {
  id: string;
  unlockedAt: string;
}

export interface Settings {
  sound: boolean;
  reducedMotion: boolean;
  lastTab: TabId;
}

export interface AppData {
  version: number;
  exportedAt: string;
  data: {
    profile: Profile | null;
    settings: Settings;
    tasks: Task[];
    habits: Habit[];
    quests: Quest[];
    rewards: Reward[];
    log: LogEntry[];
    unlocks: AchievementUnlock[];
  };
}

/** Snapshot of cumulative counters used to evaluate achievements. */
export interface CounterSnapshot {
  level: number;
  totalXp: number;
  glimmer: number;
  glimmerEarned: number;
  glimmerSpent: number;
  completions: number;
  tasks: number;
  dailies: number;
  habits: number;
  milestones: number;
  quests: number;
  streak: number;
  bestStreak: number;
  redeemed: number;
  earlyBird: number;
  nightOwl: number;
  cosmeticsOwned: number;
}
