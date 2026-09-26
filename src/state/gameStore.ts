import { create } from "zustand";
import { GAME_CONFIG } from "@/config/gameConfig";
import { CLASSES } from "@/config/classes";
import { cosmeticById } from "@/config/cosmetics";
import type { AchievementDef } from "@/config/achievements";
import {
  starterDailies,
  starterHabits,
  starterQuests,
  starterRewards,
  starterTasks,
} from "@/config/starterContent";
import { applyXpGain, taskRewards } from "@/domain/progression";
import { habitCurrentStreak, reconcileStreak, registerActiveDay } from "@/domain/streaks";
import { evaluateAchievements } from "@/domain/achievementsEngine";
import type {
  AchievementUnlock,
  ClassId,
  CosmeticSlot,
  Habit,
  LogEntry,
  LogType,
  Priority,
  Profile,
  Quest,
  Reward,
  Settings,
  TabId,
  Task,
  TaskKind,
} from "@/domain/types";
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
import { exportData, importData } from "@/storage/exportImport";
import { hourOf, isSameDay, todayStr } from "@/utils/dates";
import { uid } from "@/utils/uid";
import { buildSnapshot, stat } from "@/state/snapshot";
import { setSfxEnabled, sfx, vibrate } from "@/services/sound";

export interface FxToast {
  id: string;
  title: string;
  sub?: string;
  tone: "xp" | "gold" | "info" | "danger";
}

interface FxState {
  toasts: FxToast[];
  levelUp?: { from: number; to: number };
  achievementQueue: AchievementDef[];
  questDone?: { title: string; xp: number; glimmer: number };
}

export interface TaskInput {
  title: string;
  notes?: string;
  kind: TaskKind;
  priority: Priority;
  dueDate?: string;
  dueTime?: string;
  recurrence: number[];
}

export interface HabitInput {
  title: string;
  emoji?: string;
  schedule: number[];
}

export interface QuestInput {
  title: string;
  description?: string;
  steps: string[];
}

export interface RewardInput {
  title: string;
  price: number;
  icon: string;
  note?: string;
}

const DEFAULT_SETTINGS: Settings = { sound: true, reducedMotion: false, lastTab: "today" };
const TAB_KEY = "embervale.tab";
const VALID_TABS: TabId[] = ["today", "quests", "hero", "rewards", "stats"];

function initialTab(): TabId {
  if (typeof window === "undefined") return "today";
  const saved = window.localStorage.getItem(TAB_KEY) as TabId | null;
  return saved && VALID_TABS.includes(saved) ? saved : "today";
}

const nowIso = () => new Date().toISOString();

function bump(stats: Record<string, number>, key: string, amount = 1) {
  stats[key] = (stats[key] ?? 0) + amount;
}

function counterKeyFor(type: LogType): string | null {
  switch (type) {
    case "task":
      return "tasks";
    case "daily":
      return "dailies";
    case "habit":
      return "habits";
    case "milestone":
      return "milestones";
    default:
      return null;
  }
}

interface GameStore {
  // persistent app state
  hydrated: boolean;
  storageError: string | null;
  profile: Profile | null;
  settings: Settings;
  tasks: Task[];
  habits: Habit[];
  quests: Quest[];
  rewards: Reward[];
  log: LogEntry[];
  unlocks: AchievementUnlock[];
  lastOpenDay: string;
  // ui state
  tab: TabId;
  fx: FxState;

  // lifecycle
  hydrate: () => Promise<void>;
  checkRollover: () => void;
  applyPrefs: () => void;
  finishOnboarding: (input: { name: string; classId: ClassId; avatarSeed: number }) => Promise<void>;

  // tasks & habits
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, patch: Partial<TaskInput>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => { xp: number; glimmer: number } | null;
  addHabit: (input: HabitInput) => void;
  updateHabit: (id: string, patch: Partial<HabitInput>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string) => { xp: number; glimmer: number } | null;

  // quests
  addQuest: (input: QuestInput) => void;
  updateQuest: (id: string, input: QuestInput) => void;
  deleteQuest: (id: string) => void;
  toggleMilestone: (questId: string, stepId: string) => { xp: number; glimmer: number } | null;

  // economy
  redeemReward: (id: string) => boolean;
  addReward: (input: RewardInput) => void;
  updateReward: (id: string, patch: Partial<RewardInput>) => void;
  deleteReward: (id: string) => void;
  buyCosmetic: (id: string) => boolean;
  equipCosmetic: (slot: CosmeticSlot, id: string) => void;

  // profile & settings
  updateProfile: (patch: Partial<Pick<Profile, "name" | "classId" | "avatarSeed">>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setTab: (tab: TabId) => void;

  // fx
  pushToast: (t: Omit<FxToast, "id">) => void;
  dismissToast: (id: string) => void;
  ackLevelUp: () => void;
  ackAchievement: () => void;
  ackQuestDone: () => void;

  // backup
  exportBackup: () => Promise<string>;
  importBackup: (raw: string) => Promise<{ ok: boolean; error?: string }>;
  resetAll: () => Promise<void>;

  // internals
  rewardCompletion: (opts: {
    type: LogType;
    title: string;
    refId?: string;
    xp: number;
    glimmer: number;
  }) => void;
  revokeToday: (refId: string, type: LogType, xp: number, glimmer: number) => void;
  checkAchievements: () => void;
}

export const useGame = create<GameStore>()((set, get) => {
  const persist = (p: Promise<unknown>) => {
    p.catch(() => set({ storageError: "Couldn't write to this device's storage." }));
  };

  return {
    hydrated: false,
    storageError: null,
    profile: null,
    settings: DEFAULT_SETTINGS,
    tasks: [],
    habits: [],
    quests: [],
    rewards: [],
    log: [],
    unlocks: [],
    lastOpenDay: "",
    tab: initialTab(),
    fx: { toasts: [], achievementQueue: [] },

    hydrate: async () => {
      try {
        const [profile, settings, tasks, habits, quests, rewards, log, unlocks] =
          await Promise.all([
            CharacterRepository.get(),
            SettingsRepository.get(),
            TaskRepository.all(),
            HabitRepository.all(),
            QuestRepository.all(),
            RewardRepository.all(),
            LogRepository.all(),
            AchievementRepository.get(),
          ]);
        const today = todayStr();
        let p = profile ?? null;
        if (p) {
          const r = reconcileStreak(p.streak, today);
          if (r.streak !== p.streak) {
            p = { ...p, streak: r.streak };
            persist(CharacterRepository.save(p));
          }
          if (r.broke && p.streak.best > 0) {
            get().pushToast({
              title: "Your streak faded out",
              sub: "No guilt — a fresh one starts today.",
              tone: "info",
            });
          } else if (r.shieldsUsed > 0) {
            get().pushToast({
              title: "Streak shield spent",
              sub: `${r.shieldsUsed} missed day${r.shieldsUsed > 1 ? "s" : ""} forgiven.`,
              tone: "info",
            });
          }
        }
        log.sort((a, b) => a.ts - b.ts);
        set({
          hydrated: true,
          profile: p,
          settings: settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS,
          tasks,
          habits,
          quests,
          rewards,
          log,
          unlocks,
          lastOpenDay: today,
        });
        get().applyPrefs();
      } catch {
        set({
          hydrated: true,
          storageError: "Local storage couldn't be opened. Progress may not be saved.",
        });
      }
    },

    checkRollover: () => {
      const s = get();
      const today = todayStr();
      if (!s.hydrated || s.lastOpenDay === today) return;
      if (s.profile) {
        const r = reconcileStreak(s.profile.streak, today);
        if (r.streak !== s.profile.streak) {
          const profile = { ...s.profile, streak: r.streak };
          set({ profile });
          persist(CharacterRepository.save(profile));
        }
      }
      set({ lastOpenDay: today });
    },

    applyPrefs: () => {
      const { settings } = get();
      setSfxEnabled(settings.sound);
      if (typeof document !== "undefined") {
        document.documentElement.dataset.motion = settings.reducedMotion ? "reduced" : "full";
      }
    },

    finishOnboarding: async (input) => {
      const t = nowIso();
      const profile: Profile = {
        name: input.name.trim() || "Wanderer",
        classId: input.classId,
        avatarSeed: input.avatarSeed,
        level: 1,
        xp: 0,
        totalXp: 0,
        glimmer: 30,
        equipped: {},
        owned: [],
        streak: { current: 0, best: 0, shields: 0 },
        stats: {},
        onboarded: true,
        createdAt: t,
      };
      const tasks = [...starterTasks(), ...starterDailies()];
      const habits = starterHabits();
      const quests = starterQuests();
      const rewards = starterRewards();
      set({ profile, tasks, habits, quests, rewards, log: [], unlocks: [] });
      persist(CharacterRepository.save(profile));
      persist(TaskRepository.saveMany(tasks));
      persist(HabitRepository.saveMany(habits));
      persist(QuestRepository.saveMany(quests));
      persist(RewardRepository.saveMany(rewards));
      get().pushToast({
        title: `Welcome to Embervale, ${profile.name}`,
        sub: "Complete tasks to earn XP and Glimmer.",
        tone: "xp",
      });
    },

    addTask: (input) => {
      const t: Task = {
        id: uid(),
        title: input.title.trim(),
        notes: input.notes?.trim() || undefined,
        kind: input.kind,
        priority: input.priority,
        dueDate: input.kind === "todo" ? input.dueDate : undefined,
        dueTime: input.kind === "todo" ? input.dueTime : undefined,
        recurrence: input.kind === "daily" ? input.recurrence : [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      set({ tasks: [...get().tasks, t] });
      persist(TaskRepository.save(t));
    },

    updateTask: (id, patch) => {
      const cur = get().tasks.find((t) => t.id === id);
      if (!cur) return;
      const next: Task = {
        ...cur,
        ...patch,
        id,
        title: patch.title?.trim() || cur.title,
        updatedAt: nowIso(),
      };
      set({ tasks: get().tasks.map((t) => (t.id === id ? next : t)) });
      persist(TaskRepository.save(next));
    },

    deleteTask: (id) => {
      set({ tasks: get().tasks.filter((t) => t.id !== id) });
      persist(TaskRepository.delete(id));
    },

    toggleTask: (id) => {
      const s = get();
      const task = s.tasks.find((t) => t.id === id);
      if (!task || !s.profile) return null;
      const today = todayStr();

      if (task.kind === "daily") {
        if (task.lastCompletedDay === today) return null;
        const rewards = taskRewards("daily", task.priority);
        const updated: Task = { ...task, lastCompletedDay: today, updatedAt: nowIso() };
        set({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) });
        persist(TaskRepository.save(updated));
        get().rewardCompletion({ type: "daily", title: task.title, refId: id, ...rewards });
        sfx.complete();
        vibrate();
        return rewards;
      }

      if (!task.completedAt) {
        const rewards = taskRewards("todo", task.priority);
        const updated: Task = { ...task, completedAt: nowIso(), updatedAt: nowIso() };
        set({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) });
        persist(TaskRepository.save(updated));
        get().rewardCompletion({ type: "task", title: task.title, refId: id, ...rewards });
        sfx.complete();
        vibrate();
        return rewards;
      }

      // reopen a todo completed today (undo)
      if (!isSameDay(task.completedAt, today)) return null;
      const rewards = taskRewards("todo", task.priority);
      const updated: Task = { ...task, completedAt: undefined, updatedAt: nowIso() };
      set({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) });
      persist(TaskRepository.save(updated));
      get().revokeToday(id, "task", rewards.xp, rewards.glimmer);
      return null;
    },

    addHabit: (input) => {
      const h: Habit = {
        id: uid(),
        title: input.title.trim(),
        emoji: input.emoji || undefined,
        schedule: input.schedule,
        completions: [],
        bestStreak: 0,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      set({ habits: [...get().habits, h] });
      persist(HabitRepository.save(h));
    },

    updateHabit: (id, patch) => {
      const cur = get().habits.find((h) => h.id === id);
      if (!cur) return;
      const next: Habit = {
        ...cur,
        ...patch,
        id,
        title: patch.title?.trim() || cur.title,
        updatedAt: nowIso(),
      };
      set({ habits: get().habits.map((h) => (h.id === id ? next : h)) });
      persist(HabitRepository.save(next));
    },

    deleteHabit: (id) => {
      set({ habits: get().habits.filter((h) => h.id !== id) });
      persist(HabitRepository.delete(id));
    },

    toggleHabit: (id) => {
      const s = get();
      const habit = s.habits.find((h) => h.id === id);
      if (!habit || !s.profile) return null;
      const today = todayStr();
      const doneToday = habit.completions.includes(today);
      const maxHistory = GAME_CONFIG.limits.habitHistory;

      if (!doneToday) {
        const completions = [...habit.completions, today].sort().slice(-maxHistory);
        const current = habitCurrentStreak(completions, habit.schedule, today);
        const updated: Habit = {
          ...habit,
          completions,
          bestStreak: Math.max(habit.bestStreak, current),
          updatedAt: nowIso(),
        };
        set({ habits: s.habits.map((h) => (h.id === id ? updated : h)) });
        persist(HabitRepository.save(updated));
        const rewards = taskRewards("habit");
        get().rewardCompletion({ type: "habit", title: habit.title, refId: id, ...rewards });
        sfx.complete();
        vibrate();
        return rewards;
      }

      const completions = habit.completions.filter((d) => d !== today);
      const updated: Habit = { ...habit, completions, updatedAt: nowIso() };
      set({ habits: s.habits.map((h) => (h.id === id ? updated : h)) });
      persist(HabitRepository.save(updated));
      const rewards = taskRewards("habit");
      get().revokeToday(id, "habit", rewards.xp, rewards.glimmer);
      return null;
    },

    addQuest: (input) => {
      const q: Quest = {
        id: uid(),
        title: input.title.trim(),
        description: input.description?.trim() || undefined,
        status: "active",
        steps: input.steps
          .map((t) => t.trim())
          .filter(Boolean)
          .map((title) => ({ id: uid(), title, done: false })),
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      set({ quests: [...get().quests, q] });
      persist(QuestRepository.save(q));
    },

    updateQuest: (id, input) => {
      const cur = get().quests.find((q) => q.id === id);
      if (!cur) return;
      const next: Quest = {
        ...cur,
        title: input.title.trim() || cur.title,
        description: input.description?.trim() || undefined,
        steps: input.steps
          .map((t) => t.trim())
          .filter(Boolean)
          .map((title, i) => ({
            id: cur.steps[i]?.id ?? uid(),
            title,
            done: cur.steps[i]?.done ?? false,
            completedAt: cur.steps[i]?.completedAt,
          })),
        updatedAt: nowIso(),
      };
      set({ quests: get().quests.map((q) => (q.id === id ? next : q)) });
      persist(QuestRepository.save(next));
    },

    deleteQuest: (id) => {
      set({ quests: get().quests.filter((q) => q.id !== id) });
      persist(QuestRepository.delete(id));
    },

    toggleMilestone: (questId, stepId) => {
      const s = get();
      const quest = s.quests.find((q) => q.id === questId);
      const step = quest?.steps.find((st) => st.id === stepId);
      if (!quest || !step || !s.profile || quest.status === "done") return null;

      const willDone = !step.done;
      const steps = quest.steps.map((st) =>
        st.id === stepId
          ? { ...st, done: willDone, completedAt: willDone ? nowIso() : undefined }
          : st
      );
      const allDone = steps.length > 0 && steps.every((st) => st.done);
      const updated: Quest = {
        ...quest,
        steps,
        status: allDone ? "done" : "active",
        completedAt: allDone ? nowIso() : undefined,
        updatedAt: nowIso(),
      };
      set({ quests: s.quests.map((q) => (q.id === questId ? updated : q)) });
      persist(QuestRepository.save(updated));

      const rewards = taskRewards("milestone");
      if (willDone) {
        get().rewardCompletion({
          type: "milestone",
          title: step.title,
          refId: stepId,
          ...rewards,
        });
        sfx.complete();
        vibrate();
        if (allDone) {
          const bonus = GAME_CONFIG.rewards.questCompletionBonus;
          const p = get().profile;
          if (p) {
            const res = applyXpGain(p.level, p.xp, bonus.xp);
            const stats = { ...p.stats };
            bump(stats, "quests");
            bump(stats, "glimmerEarned", bonus.glimmer);
            const profile: Profile = {
              ...p,
              level: res.level,
              xp: res.xp,
              totalXp: p.totalXp + bonus.xp,
              glimmer: p.glimmer + bonus.glimmer,
              stats,
            };
            set({
              profile,
              fx: {
                ...get().fx,
                questDone: { title: quest.title, xp: bonus.xp, glimmer: bonus.glimmer },
                levelUp: res.levelsGained > 0 ? { from: p.level, to: res.level } : get().fx.levelUp,
              },
            });
            persist(CharacterRepository.save(profile));
            if (res.levelsGained > 0) sfx.levelUp();
            else sfx.unlock();
            get().checkAchievements();
          }
        }
        return rewards;
      }
      get().revokeToday(stepId, "milestone", rewards.xp, rewards.glimmer);
      return null;
    },

    rewardCompletion: (opts) => {
      const s = get();
      const p = s.profile;
      if (!p) return;
      const today = todayStr();
      const firstToday = p.streak.lastActiveDay !== today;
      const streak = registerActiveDay(p.streak, today);
      const bonus = firstToday ? GAME_CONFIG.streak.dailyGlimmerBonus : 0;
      const totalGold = opts.glimmer + bonus;

      const res = applyXpGain(p.level, p.xp, opts.xp);
      const stats = { ...p.stats };
      const key = counterKeyFor(opts.type);
      if (key) bump(stats, key);
      bump(stats, "glimmerEarned", totalGold);
      const hour = hourOf(Date.now());
      if (hour < 8) bump(stats, "earlyBird");
      if (hour >= 22) bump(stats, "nightOwl");

      const profile: Profile = {
        ...p,
        streak,
        level: res.level,
        xp: res.xp,
        totalXp: p.totalXp + opts.xp,
        glimmer: p.glimmer + totalGold,
        stats,
      };
      const entry: LogEntry = {
        id: uid(),
        date: today,
        ts: Date.now(),
        type: opts.type,
        title: opts.title,
        xp: opts.xp,
        gold: totalGold,
        refId: opts.refId,
      };
      const log = [...s.log, entry];
      const cap = GAME_CONFIG.limits.logEntries;
      const trimmed = log.length > cap ? log.slice(log.length - cap) : log;
      set({ profile, log: trimmed });
      persist(CharacterRepository.save(profile));
      persist(LogRepository.save(entry));
      if (res.levelsGained > 0) {
        set({ fx: { ...get().fx, levelUp: { from: p.level, to: res.level } } });
        sfx.levelUp();
      }
      get().checkAchievements();
    },

    revokeToday: (refId, type, xp, glimmer) => {
      const s = get();
      const p = s.profile;
      if (!p) return;
      const today = todayStr();
      const idx = s.log.findIndex(
        (e) => e.refId === refId && e.type === type && e.date === today
      );
      let log = s.log;
      if (idx >= 0) {
        const removed = s.log[idx];
        log = s.log.filter((e) => e.id !== removed.id);
        persist(LogRepository.delete(removed.id));
      }
      const stats = { ...p.stats };
      const key = counterKeyFor(type);
      if (key) bump(stats, key, -1);
      bump(stats, "glimmerEarned", -glimmer);
      const profile: Profile = {
        ...p,
        xp: Math.max(0, p.xp - xp),
        totalXp: Math.max(0, p.totalXp - xp),
        glimmer: Math.max(0, p.glimmer - glimmer),
        stats,
      };
      set({ profile, log });
      persist(CharacterRepository.save(profile));
    },

    checkAchievements: () => {
      const s = get();
      if (!s.profile) return;
      let unlocked = new Set(s.unlocks.map((u) => u.id));
      let newly = evaluateAchievements(buildSnapshot(s.profile), unlocked);
      if (newly.length === 0) return;

      let profile = s.profile;
      const unlocks = [...s.unlocks];
      const queue: AchievementDef[] = [];
      let guard = 0;
      while (newly.length > 0 && guard < 4) {
        guard += 1;
        for (const def of newly) {
          unlocks.push({ id: def.id, unlockedAt: nowIso() });
          queue.push(def);
          const res = applyXpGain(profile.level, profile.xp, def.reward.xp);
          const stats = { ...profile.stats };
          bump(stats, "glimmerEarned", def.reward.glimmer);
          profile = {
            ...profile,
            level: res.level,
            xp: res.xp,
            totalXp: profile.totalXp + def.reward.xp,
            glimmer: profile.glimmer + def.reward.glimmer,
            stats,
          };
        }
        unlocked = new Set(unlocks.map((u) => u.id));
        newly = evaluateAchievements(buildSnapshot(profile), unlocked);
      }
      set({
        profile,
        unlocks,
        fx: { ...get().fx, achievementQueue: [...get().fx.achievementQueue, ...queue] },
      });
      persist(CharacterRepository.save(profile));
      persist(AchievementRepository.save(unlocks));
      sfx.unlock();
    },

    redeemReward: (id) => {
      const s = get();
      const reward = s.rewards.find((r) => r.id === id);
      const p = s.profile;
      if (!reward || !p) return false;
      if (p.glimmer < reward.price) {
        sfx.error();
        get().pushToast({
          title: "Not enough Glimmer",
          sub: `${reward.price - p.glimmer} more to go — you've got this.`,
          tone: "danger",
        });
        return false;
      }
      const stats = { ...p.stats };
      bump(stats, "redeemed");
      bump(stats, "glimmerSpent", reward.price);
      const profile: Profile = { ...p, glimmer: p.glimmer - reward.price, stats };
      const updated: Reward = { ...reward, redeemedCount: reward.redeemedCount + 1, updatedAt: nowIso() };
      const entry: LogEntry = {
        id: uid(),
        date: todayStr(),
        ts: Date.now(),
        type: "redeem",
        title: reward.title,
        xp: 0,
        gold: -reward.price,
        refId: id,
      };
      set({
        profile,
        rewards: s.rewards.map((r) => (r.id === id ? updated : r)),
        log: [...s.log, entry],
      });
      persist(CharacterRepository.save(profile));
      persist(RewardRepository.save(updated));
      persist(LogRepository.save(entry));
      sfx.spend();
      get().pushToast({ title: `Enjoy: ${reward.title}`, sub: `-${reward.price} Glimmer`, tone: "gold" });
      get().checkAchievements();
      return true;
    },

    addReward: (input) => {
      const r: Reward = {
        id: uid(),
        title: input.title.trim(),
        price: Math.max(1, Math.round(input.price)),
        icon: input.icon,
        note: input.note?.trim() || undefined,
        redeemedCount: 0,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      set({ rewards: [...get().rewards, r] });
      persist(RewardRepository.save(r));
    },

    updateReward: (id, patch) => {
      const cur = get().rewards.find((r) => r.id === id);
      if (!cur) return;
      const next: Reward = {
        ...cur,
        ...patch,
        id,
        title: patch.title?.trim() || cur.title,
        price: patch.price !== undefined ? Math.max(1, Math.round(patch.price)) : cur.price,
        updatedAt: nowIso(),
      };
      set({ rewards: get().rewards.map((r) => (r.id === id ? next : r)) });
      persist(RewardRepository.save(next));
    },

    deleteReward: (id) => {
      set({ rewards: get().rewards.filter((r) => r.id !== id) });
      persist(RewardRepository.delete(id));
    },

    buyCosmetic: (id) => {
      const s = get();
      const p = s.profile;
      const cosmetic = cosmeticById(id);
      if (!p || !cosmetic || p.owned.includes(id)) return false;
      if (p.glimmer < cosmetic.price) {
        sfx.error();
        get().pushToast({
          title: "Not enough Glimmer",
          sub: `${cosmetic.price - p.glimmer} more to go.`,
          tone: "danger",
        });
        return false;
      }
      const stats = { ...p.stats };
      bump(stats, "glimmerSpent", cosmetic.price);
      const profile: Profile = {
        ...p,
        glimmer: p.glimmer - cosmetic.price,
        owned: [...p.owned, id],
        equipped: { ...p.equipped, [cosmetic.slot]: id },
        stats,
      };
      set({ profile });
      persist(CharacterRepository.save(profile));
      sfx.spend();
      get().pushToast({ title: `${cosmetic.name} unlocked`, sub: "Equipped automatically.", tone: "gold" });
      get().checkAchievements();
      return true;
    },

    equipCosmetic: (slot, id) => {
      const p = get().profile;
      if (!p) return;
      const equipped = { ...p.equipped };
      if (id) equipped[slot] = id;
      else delete equipped[slot];
      const profile: Profile = { ...p, equipped };
      set({ profile });
      persist(CharacterRepository.save(profile));
    },

    updateProfile: (patch) => {
      const p = get().profile;
      if (!p) return;
      const profile: Profile = { ...p, ...patch, name: patch.name?.trim() || p.name };
      set({ profile });
      persist(CharacterRepository.save(profile));
    },

    updateSettings: (patch) => {
      const settings: Settings = { ...get().settings, ...patch };
      set({ settings });
      persist(SettingsRepository.save(settings));
      get().applyPrefs();
      if (patch.lastTab && typeof window !== "undefined") {
        window.localStorage.setItem(TAB_KEY, patch.lastTab);
      }
    },

    setTab: (tab) => {
      set({ tab });
      if (typeof window !== "undefined") window.localStorage.setItem(TAB_KEY, tab);
    },

    pushToast: (t) => {
      const toast: FxToast = { ...t, id: uid() };
      set({ fx: { ...get().fx, toasts: [...get().fx.toasts.slice(-2), toast] } });
      window.setTimeout(() => get().dismissToast(toast.id), 3200);
    },

    dismissToast: (id) => {
      set({ fx: { ...get().fx, toasts: get().fx.toasts.filter((t) => t.id !== id) } });
    },

    ackLevelUp: () => set({ fx: { ...get().fx, levelUp: undefined } }),
    ackAchievement: () =>
      set({ fx: { ...get().fx, achievementQueue: get().fx.achievementQueue.slice(1) } }),
    ackQuestDone: () => set({ fx: { ...get().fx, questDone: undefined } }),

    exportBackup: async () => JSON.stringify(await exportData(), null, 2),

    importBackup: async (raw) => {
      const res = await importData(raw);
      if (res.ok) {
        set({ hydrated: false });
        await get().hydrate();
        get().pushToast({ title: "Backup restored", sub: "Welcome back, hero.", tone: "xp" });
      }
      return res;
    },

    resetAll: async () => {
      await adapter.clearAll();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TAB_KEY);
        window.localStorage.removeItem("embervale.onboarded");
        window.location.reload();
      }
    },
  };
});

/** Convenience hook: is this daily task done today? */
export function isDailyDone(task: Task, today: string): boolean {
  return task.kind === "daily" && task.lastCompletedDay === today;
}

export const CLASSES_LIST = CLASSES;
