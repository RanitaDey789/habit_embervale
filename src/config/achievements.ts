import type { CounterSnapshot } from "@/domain/types";

export type AchievementIcon =
  | "spark"
  | "flame"
  | "sword"
  | "scroll"
  | "trophy"
  | "moon"
  | "sun"
  | "gem"
  | "shield"
  | "helm";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: AchievementIcon;
  reward: { xp: number; glimmer: number };
  when: (s: CounterSnapshot) => boolean;
}

/** Achievement registry — add entries here, no UI changes needed. */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-spark",
    name: "First Spark",
    description: "Complete your very first task.",
    icon: "spark",
    reward: { xp: 15, glimmer: 20 },
    when: (s) => s.completions >= 1,
  },
  {
    id: "kindling",
    name: "Kindling",
    description: "Complete 25 tasks, dailies or habits.",
    icon: "flame",
    reward: { xp: 40, glimmer: 50 },
    when: (s) => s.completions >= 25,
  },
  {
    id: "centurion",
    name: "Centurion",
    description: "Reach 100 total completions.",
    icon: "trophy",
    reward: { xp: 120, glimmer: 150 },
    when: (s) => s.completions >= 100,
  },
  {
    id: "rising-ember",
    name: "Rising Ember",
    description: "Reach Level 2 — your first level up.",
    icon: "helm",
    reward: { xp: 0, glimmer: 30 },
    when: (s) => s.level >= 2,
  },
  {
    id: "torchbearer",
    name: "Torchbearer",
    description: "Reach Level 5.",
    icon: "flame",
    reward: { xp: 0, glimmer: 120 },
    when: (s) => s.level >= 5,
  },
  {
    id: "blazing-crown",
    name: "Blazing Crown",
    description: "Reach Level 10.",
    icon: "trophy",
    reward: { xp: 0, glimmer: 300 },
    when: (s) => s.level >= 10,
  },
  {
    id: "reservoir",
    name: "Reservoir of Power",
    description: "Earn 1,000 lifetime XP.",
    icon: "gem",
    reward: { xp: 0, glimmer: 100 },
    when: (s) => s.totalXp >= 1000,
  },
  {
    id: "steady-flame",
    name: "Steady Flame",
    description: "Hold a 3-day streak.",
    icon: "shield",
    reward: { xp: 30, glimmer: 40 },
    when: (s) => s.bestStreak >= 3,
  },
  {
    id: "week-of-fire",
    name: "Week of Fire",
    description: "Hold a 7-day streak.",
    icon: "flame",
    reward: { xp: 80, glimmer: 120 },
    when: (s) => s.bestStreak >= 7,
  },
  {
    id: "everburning",
    name: "Everburning",
    description: "Hold a 30-day streak.",
    icon: "trophy",
    reward: { xp: 200, glimmer: 400 },
    when: (s) => s.bestStreak >= 30,
  },
  {
    id: "first-quest",
    name: "First Quest",
    description: "Complete a quest from start to finish.",
    icon: "scroll",
    reward: { xp: 60, glimmer: 60 },
    when: (s) => s.quests >= 1,
  },
  {
    id: "questweaver",
    name: "Questweaver",
    description: "Complete 5 quests.",
    icon: "scroll",
    reward: { xp: 120, glimmer: 200 },
    when: (s) => s.quests >= 5,
  },
  {
    id: "habit-forger",
    name: "Habit Forger",
    description: "Log 30 habit completions.",
    icon: "sword",
    reward: { xp: 60, glimmer: 80 },
    when: (s) => s.habits >= 30,
  },
  {
    id: "dawnseeker",
    name: "Dawnseeker",
    description: "Complete 5 things before 8:00 AM.",
    icon: "sun",
    reward: { xp: 40, glimmer: 60 },
    when: (s) => s.earlyBird >= 5,
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Complete 5 things after 10:00 PM.",
    icon: "moon",
    reward: { xp: 40, glimmer: 60 },
    when: (s) => s.nightOwl >= 5,
  },
  {
    id: "treat-yourself",
    name: "Treat Yourself",
    description: "Redeem 5 real-life rewards.",
    icon: "gem",
    reward: { xp: 30, glimmer: 50 },
    when: (s) => s.redeemed >= 5,
  },
  {
    id: "glimmer-hoard",
    name: "Glimmer Hoard",
    description: "Earn 1,000 lifetime Glimmer.",
    icon: "gem",
    reward: { xp: 60, glimmer: 0 },
    when: (s) => s.glimmerEarned >= 1000,
  },
  {
    id: "well-appointed",
    name: "Well Appointed",
    description: "Own 4 cosmetics.",
    icon: "helm",
    reward: { xp: 40, glimmer: 80 },
    when: (s) => s.cosmeticsOwned >= 4,
  },
];

export function achievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
