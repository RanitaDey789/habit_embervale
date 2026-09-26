/**
 * Central game-balance configuration.
 * Every reward, curve and streak rule lives here so tuning never
 * requires touching feature code.
 */

export const DATA_VERSION = 1;
export const APP_NAME = "Embervale";

export const GAME_CONFIG = {
  level: {
    /** XP needed for level 1 -> 2 */
    base: 100,
    /** Exponential growth per level */
    growth: 1.18,
    /** Round requirements to a multiple of this */
    roundTo: 5,
    maxLevel: 60,
  },

  rewards: {
    xp: {
      todo: 25,
      daily: 20,
      habit: 15,
      milestone: 30,
    },
    glimmer: {
      todo: 12,
      daily: 10,
      habit: 8,
      milestone: 18,
    },
    /** Multiplier applied by priority (1 calm, 2 steady, 3 urgent) */
    priorityMultiplier: {
      1: 1,
      2: 1.3,
      3: 1.7,
    } as Record<1 | 2 | 3, number>,
    questCompletionBonus: {
      xp: 120,
      glimmer: 80,
    },
  },

  streak: {
    /** Missed scheduled habit days tolerated before a habit streak breaks */
    habitGrace: 1,
    /** Earn one shield every N consecutive active days */
    shieldsEvery: 7,
    maxShields: 3,
    /** Bonus glimmer granted on top of normal rewards for every active day */
    dailyGlimmerBonus: 2,
  },

  limits: {
    /** Habit completion history kept per habit */
    habitHistory: 800,
    /** Log entries kept in total */
    logEntries: 4000,
  },
} as const;

export const PRIORITY_LABELS: Record<1 | 2 | 3, string> = {
  1: "Calm",
  2: "Steady",
  3: "Urgent",
};

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
