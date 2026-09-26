import { uid } from "@/utils/uid";
import { todayStr } from "@/utils/dates";
import type { Habit, Quest, Reward, Task } from "@/domain/types";

/**
 * Light starter content so the vale never feels empty on day one.
 * Everything here is fully editable/deletable by the user.
 */

function nowIso() {
  return new Date().toISOString();
}

export function starterTasks(): Task[] {
  const t = nowIso();
  const mk = (title: string, priority: 1 | 2 | 3): Task => ({
    id: uid(),
    title,
    kind: "todo",
    priority,
    recurrence: [],
    createdAt: t,
    updatedAt: t,
  });
  return [
    mk("Study for 30 minutes", 2),
    mk("Walk for 20 minutes", 1),
    mk("Read 10 pages", 1),
    mk("Tidy your workspace", 2),
  ];
}

export function starterDailies(): Task[] {
  const t = nowIso();
  return [
    {
      id: uid(),
      title: "Drink water",
      kind: "daily",
      priority: 1,
      recurrence: [],
      createdAt: t,
      updatedAt: t,
    },
  ];
}

export function starterHabits(): Habit[] {
  const t = nowIso();
  return [
    {
      id: uid(),
      title: "Stretch or exercise",
      emoji: "🤸",
      schedule: [],
      completions: [],
      bestStreak: 0,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: uid(),
      title: "Sleep before midnight",
      emoji: "🌙",
      schedule: [],
      completions: [],
      bestStreak: 0,
      createdAt: t,
      updatedAt: t,
    },
  ];
}

export function starterQuests(): Quest[] {
  const t = nowIso();
  return [
    {
      id: uid(),
      title: "Find your footing",
      description: "Learn the rhythm of Embervale by completing small goals.",
      status: "active",
      createdAt: t,
      updatedAt: t,
      steps: [
        { id: uid(), title: "Complete your first task", done: false },
        { id: uid(), title: "Log a habit for the day", done: false },
        { id: uid(), title: "Visit your Hero page", done: false },
        { id: uid(), title: "Plan a reward worth saving for", done: false },
      ],
    },
  ];
}

export function starterRewards(): Reward[] {
  const t = nowIso();
  return [
    {
      id: uid(),
      title: "Watch one episode",
      price: 100,
      icon: "🎬",
      note: "Guilt-free. You earned it.",
      redeemedCount: 0,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: uid(),
      title: "Order favorite food",
      price: 500,
      icon: "🍜",
      note: "A feast for a job well done.",
      redeemedCount: 0,
      createdAt: t,
      updatedAt: t,
    },
  ];
}

export function seedDay(): string {
  return todayStr();
}
