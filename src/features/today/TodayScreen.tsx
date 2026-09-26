"use client";

import { useMemo, useState } from "react";
import { useGame } from "@/state/gameStore";
import { isScheduledOn } from "@/domain/streaks";
import { formatDayLong, todayStr, weekdayOf } from "@/utils/dates";
import { Hud } from "@/features/today/Hud";
import { HabitRow, TaskRow } from "@/features/today/rows";
import { TaskSheet, type SheetTarget } from "@/features/today/TaskSheet";
import { EmptyState, SectionHeader, Btn } from "@/components/ui";
import {
  ICheck,
  IFlameFill,
  IMoon,
  IPlus,
  IRepeat,
  ISpark,
} from "@/components/icons";
import type { Habit, Task } from "@/domain/types";

export default function TodayScreen() {
  const tasks = useGame((s) => s.tasks);
  const habits = useGame((s) => s.habits);
  const profile = useGame((s) => s.profile);
  const [sheet, setSheet] = useState<SheetTarget>(null);
  const [sheetKey, setSheetKey] = useState(0);

  const today = todayStr();
  const weekday = weekdayOf(today);

  const open = (target: SheetTarget) => {
    setSheetKey((k) => k + 1);
    setSheet(target);
  };

  const groups = useMemo(() => {
    const scheduledDaily = tasks.filter(
      (t) => t.kind === "daily" && isScheduledOn(t.recurrence, today)
    );
    const todos = tasks.filter((t) => t.kind === "todo");
    const openTodos = todos.filter((t) => !t.completedAt);
    const overdue = openTodos.filter((t) => t.dueDate && t.dueDate < today);
    const urgent = openTodos.filter(
      (t) => t.priority === 3 && !(t.dueDate && t.dueDate < today)
    );
    const rest = openTodos.filter(
      (t) => t.priority < 3 && !(t.dueDate && t.dueDate < today)
    );
    const habitsToday = habits.filter((h) => isScheduledOn(h.schedule, today));
    const doneToday = [
      ...todos.filter((t) => t.completedAt && t.completedAt.slice(0, 10) === today),
    ];
    return { scheduledDaily, overdue, urgent, rest, habitsToday, doneToday };
  }, [tasks, habits, today]);

  const scheduledCount =
    groups.scheduledDaily.length + groups.habitsToday.length + tasks.filter((t) => t.kind === "todo" && !t.completedAt).length;
  const doneCount =
    groups.scheduledDaily.filter((t) => t.lastCompletedDay === today).length +
    groups.habitsToday.filter((h) => h.completions.includes(today)).length +
    groups.doneToday.length;

  if (!profile) return null;

  const empty =
    groups.scheduledDaily.length === 0 &&
    groups.habitsToday.length === 0 &&
    groups.overdue.length === 0 &&
    groups.urgent.length === 0 &&
    groups.rest.length === 0;

  return (
    <div className="px-4 pb-36">
      <Hud profile={profile} dayLabel={formatDayLong(today)} />

      {empty ? (
        <EmptyState
          icon={<IMoon size={28} />}
          title="Looks like a peaceful day"
          body="Nothing is due in the vale. Add a task, or rest — even heroes recover."
          action={
            <Btn variant="primary" onClick={() => open({ kind: "task" })}>
              <IPlus size={17} /> Add Task
            </Btn>
          }
        />
      ) : (
        <p className="mt-4 px-1 text-[12.5px] font-bold uppercase tracking-[0.12em] text-ink-300">
          Today&apos;s pace — {doneCount} of {scheduledCount + doneCount} done
        </p>
      )}

      {groups.overdue.length > 0 && (
        <section aria-label="Overdue tasks">
          <SectionHeader icon={<IMoon size={15} />} title="Still open" meta="no rush" />
          <div className="space-y-2">
            {groups.overdue.map((t) => (
              <TaskRow key={t.id} task={t} onEdit={(task: Task) => open({ kind: "task", task })} />
            ))}
          </div>
        </section>
      )}

      {groups.urgent.length > 0 && (
        <section aria-label="Urgent tasks">
          <SectionHeader icon={<IFlameFill size={15} />} title="Urgent" />
          <div className="space-y-2">
            {groups.urgent.map((t) => (
              <TaskRow key={t.id} task={t} onEdit={(task: Task) => open({ kind: "task", task })} />
            ))}
          </div>
        </section>
      )}

      {groups.scheduledDaily.length > 0 && (
        <section aria-label="Daily tasks">
          <SectionHeader icon={<IRepeat size={15} />} title="Dailies" />
          <div className="space-y-2">
            {groups.scheduledDaily.map((t) => (
              <TaskRow key={t.id} task={t} onEdit={(task: Task) => open({ kind: "task", task })} />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Habits">
        <SectionHeader
          icon={<ISpark size={15} />}
          title="Habits"
          meta={groups.habitsToday.length > 0 ? undefined : ""}
        />
        {groups.habitsToday.length === 0 ? (
          <button
            type="button"
            onClick={() => open({ kind: "habit" })}
            className="w-full rounded-card border border-dashed border-ink-500 px-4 py-3.5 text-left text-[13.5px] font-semibold text-ink-300 active:bg-ink-800"
          >
            + Build a habit — small, repeatable, rewarding
          </button>
        ) : (
          <div className="space-y-2">
            {groups.habitsToday.map((h) => (
              <HabitRow key={h.id} habit={h} onEdit={(habit: Habit) => open({ kind: "habit", habit })} />
            ))}
            <button
              type="button"
              onClick={() => open({ kind: "habit" })}
              className="w-full rounded-card border border-dashed border-ink-600 px-4 py-2.5 text-left text-[12.5px] font-semibold text-ink-400 active:bg-ink-800"
              aria-label="Add another habit"
            >
              + Another habit
            </button>
          </div>
        )}
      </section>

      {groups.rest.length > 0 && (
        <section aria-label="To-do tasks">
          <SectionHeader icon={<ICheck size={15} />} title="To-do" />
          <div className="space-y-2">
            {groups.rest.map((t) => (
              <TaskRow key={t.id} task={t} onEdit={(task: Task) => open({ kind: "task", task })} />
            ))}
          </div>
        </section>
      )}

      {groups.doneToday.length > 0 && (
        <section aria-label="Completed today">
          <SectionHeader
            icon={<ICheck size={15} />}
            title="Done today"
            meta={`${groups.doneToday.length}`}
          />
          <div className="space-y-2">
            {groups.doneToday.map((t) => (
              <TaskRow key={t.id} task={t} onEdit={(task: Task) => open({ kind: "task", task })} />
            ))}
          </div>
        </section>
      )}

      {/* Floating add button */}
      <button
        type="button"
        onClick={() => open({ kind: "task" })}
        aria-label="Add a new task"
        className="fixed bottom-[88px] right-[max(1rem,calc(50vw-199px))] z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-ember-400 to-ember-600 text-ink-950 shadow-glow-ember active:scale-95 transition-transform"
      >
        <IPlus size={26} strokeWidth={2.4} />
      </button>

      <TaskSheet key={sheetKey} target={sheet} onClose={() => setSheet(null)} />
      <span className="sr-only">weekday {weekday}</span>
    </div>
  );
}
