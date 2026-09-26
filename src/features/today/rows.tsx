"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/state/gameStore";
import { taskRewards } from "@/domain/progression";
import { habitCurrentStreak } from "@/domain/streaks";
import { fmtTime, todayStr } from "@/utils/dates";
import { IClock, IFlameFill, IRepeat, ISparkFill, ISprig } from "@/components/icons";
import type { Habit, Task } from "@/domain/types";

const PRIORITY_COLORS: Record<1 | 2 | 3, string> = {
  1: "bg-moss-400",
  2: "bg-glimmer-400",
  3: "bg-blood-400",
};

function Burst() {
  const parts = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const ang = (i / 7) * Math.PI * 2;
        return {
          x: `${Math.round(Math.cos(ang) * (18 + (i % 3) * 6))}px`,
          y: `${Math.round(Math.sin(ang) * (18 + (i % 3) * 6)) - 6}px`,
          gold: i % 2 === 0,
        };
      }),
    []
  );
  return (
    <span className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {parts.map((p, i) => (
        <span
          key={i}
          className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full animate-spark-burst ${
            p.gold ? "bg-glimmer-300" : "bg-ember-300"
          }`}
          style={{ "--burst-x": p.x, "--burst-y": p.y } as React.CSSProperties}
        />
      ))}
    </span>
  );
}

function Floaty({ xp, glimmer }: { xp: number; glimmer: number }) {
  return (
    <span className="pointer-events-none absolute -top-2 left-10 z-10 animate-float-up whitespace-nowrap">
      <span className="text-[13px] font-extrabold text-ember-300 drop-shadow">+{xp} XP</span>
      <span className="ml-2 text-[13px] font-extrabold text-glimmer-300 drop-shadow">
        +{glimmer} ✦
      </span>
    </span>
  );
}

/** Completion checkbox that knows its own rewards for the floaty effect. */
export function RewardCheck({
  done,
  xp,
  glimmer,
  onToggle,
  label,
}: {
  done: boolean;
  xp: number;
  glimmer: number;
  onToggle: () => void;
  label: string;
}) {
  const [burstKey, setBurstKey] = useState(0);
  const [floaty, setFloaty] = useState(false);

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={done}
      onClick={(e) => {
        e.stopPropagation();
        if (!done) {
          setBurstKey((k) => k + 1);
          setFloaty(true);
          window.setTimeout(() => setFloaty(false), 1100);
        }
        onToggle();
      }}
      className="relative -ml-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full active:scale-90 transition-transform"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
          done
            ? "border-moss-400 bg-moss-400 shadow-lift"
            : "border-ink-500 bg-ink-800 shadow-[inset_0_1px_3px_rgb(30_41_34/0.08)]"
        }`}
      >
        {done && (
          <span className="animate-pop text-glimmer-400">
            <ISprig size={16} />
          </span>
        )}
      </span>
      {burstKey > 0 && <Burst key={burstKey} />}
      {floaty && <Floaty xp={xp} glimmer={glimmer} />}
    </button>
  );
}

export function TaskRow({ task, onEdit }: { task: Task; onEdit: (t: Task) => void }) {
  const toggleTask = useGame((s) => s.toggleTask);
  const today = todayStr();
  const done = task.kind === "daily" ? task.lastCompletedDay === today : !!task.completedAt;
  const rewards = taskRewards(task.kind === "daily" ? "daily" : "todo", task.priority);
  const overdue =
    task.kind === "todo" && !task.completedAt && !!task.dueDate && task.dueDate < today;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(task);
        }
      }}
      className={`group flex items-center gap-2 rounded-card border bg-ink-800/90 px-2.5 py-2 transition-colors ${
        done ? "border-ink-700 opacity-60" : "border-ink-600/70 active:bg-ink-700/70"
      }`}
    >
      <RewardCheck
        done={done}
        xp={rewards.xp}
        glimmer={rewards.glimmer}
        onToggle={() => toggleTask(task.id)}
        label={`Mark "${task.title}" ${done ? "incomplete" : "complete"}`}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[15px] font-semibold ${
            done ? "text-ink-300 line-through decoration-ink-400" : "text-parchment"
          }`}
        >
          {task.title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-ink-300">
          <span className="font-bold text-ember-300">+{rewards.xp} XP</span>
          <span className="font-bold text-glimmer-400">+{rewards.glimmer} ✦</span>
          {task.kind === "daily" && (
            <span className="inline-flex items-center gap-1">
              <IRepeat size={12} /> {task.recurrence.length === 0 ? "every day" : "some days"}
            </span>
          )}
          {task.dueTime && (
            <span className="inline-flex items-center gap-1">
              <IClock size={12} /> {fmtTime(task.dueTime)}
            </span>
          )}
          {task.dueDate && !task.dueTime && task.kind === "todo" && (
            <span className={overdue ? "font-bold text-blood-400" : ""}>
              {overdue ? "missed" : task.dueDate === today ? "today" : task.dueDate.slice(5)}
            </span>
          )}
        </p>
      </div>
      <span
        className={`mr-1 h-2 w-2 shrink-0 rounded-full ${PRIORITY_COLORS[task.priority]}`}
        aria-label={task.priority === 3 ? "urgent" : task.priority === 2 ? "steady" : "calm"}
      />
    </div>
  );
}

export function HabitRow({ habit, onEdit }: { habit: Habit; onEdit: (h: Habit) => void }) {
  const toggleHabit = useGame((s) => s.toggleHabit);
  const today = todayStr();
  const done = habit.completions.includes(today);
  const rewards = taskRewards("habit");
  const streak = habitCurrentStreak(habit.completions, habit.schedule, today);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onEdit(habit)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit(habit);
        }
      }}
      className={`flex items-center gap-2 rounded-card border bg-ink-800/90 px-2.5 py-2 transition-colors ${
        done ? "border-moss-500/40" : "border-ink-600/70 active:bg-ink-700/70"
      }`}
    >
      <RewardCheck
        done={done}
        xp={rewards.xp}
        glimmer={rewards.glimmer}
        onToggle={() => toggleHabit(habit.id)}
        label={`Log habit "${habit.title}" ${done ? "off" : "for today"}`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-parchment">
          {habit.emoji && <span className="mr-1.5">{habit.emoji}</span>}
          {habit.title}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-[12px] text-ink-300">
          <span className="font-bold text-ember-300">+{rewards.xp} XP</span>
          <span className="font-bold text-glimmer-400">+{rewards.glimmer} ✦</span>
        </p>
      </div>
      {streak > 0 && (
        <span className="mr-1 inline-flex items-center gap-1 rounded-full bg-ember-500/15 border border-ember-500/30 px-2 py-1 text-[12px] font-bold text-ember-300">
          <IFlameFill size={12} /> {streak}
        </span>
      )}
      <span className="text-glimmer-400">
        <ISparkFill size={13} />
      </span>
    </div>
  );
}
