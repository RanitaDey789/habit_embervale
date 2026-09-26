"use client";

import { useState } from "react";
import { useGame } from "@/state/gameStore";
import { Sheet, Field, inputCls, Segmented, Btn } from "@/components/ui";
import { taskRewards } from "@/domain/progression";
import { PRIORITY_LABELS, WEEKDAYS } from "@/config/gameConfig";
import { ISparkFill } from "@/components/icons";
import type { Habit, Priority, Task, TaskKind } from "@/domain/types";

export type SheetTarget =
  | { kind: "task"; task?: Task }
  | { kind: "habit"; habit?: Habit }
  | null;

const HABIT_EMOJI = ["💧", "🤸", "📚", "🧘", "✍️", "🌙", "🍎", "💤"];

function WeekdayPicker({
  value,
  onChange,
  emptyLabel,
}: {
  value: number[];
  onChange: (v: number[]) => void;
  emptyLabel: string;
}) {
  return (
    <div>
      <div className="flex gap-1.5" role="group" aria-label="Weekdays">
        {WEEKDAYS.map((d, i) => {
          const on = value.includes(i);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              aria-label={d}
              onClick={() =>
                onChange(on ? value.filter((v) => v !== i) : [...value, i].sort())
              }
              className={`h-10 w-10 rounded-full text-[12.5px] font-bold transition-colors ${
                on
                  ? "bg-ember-500 text-ink-950"
                  : "bg-ink-900 border border-ink-600 text-ink-300 active:bg-ink-700"
              }`}
            >
              {d[0]}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-[12px] text-ink-300">
        {value.length === 0 ? emptyLabel : `${value.length} days selected`}
      </p>
    </div>
  );
}

export function TaskSheet({ target, onClose }: { target: SheetTarget; onClose: () => void }) {
  const { addTask, updateTask, deleteTask, addHabit, updateHabit, deleteHabit } = useGame();
  const isHabit = target?.kind === "habit";
  const task = target?.kind === "task" ? target.task : undefined;
  const habit = target?.kind === "habit" ? target.habit : undefined;

  const [title, setTitle] = useState(task?.title ?? habit?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [kind, setKind] = useState<TaskKind>(task?.kind ?? "todo");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 2);
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [dueTime, setDueTime] = useState(task?.dueTime ?? "");
  const [recurrence, setRecurrence] = useState<number[]>(
    task?.recurrence ?? habit?.schedule ?? []
  );
  const [emoji, setEmoji] = useState(habit?.emoji ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rewards = isHabit
    ? taskRewards("habit")
    : taskRewards(kind, priority);

  const save = () => {
    if (!title.trim()) return;
    if (isHabit) {
      if (habit) updateHabit(habit.id, { title, emoji, schedule: recurrence });
      else addHabit({ title, emoji, schedule: recurrence });
    } else if (task) {
      updateTask(task.id, {
        title,
        notes,
        kind,
        priority,
        dueDate: kind === "todo" ? dueDate || undefined : undefined,
        dueTime: kind === "todo" ? dueTime || undefined : undefined,
        recurrence: kind === "daily" ? recurrence : [],
      });
    } else {
      addTask({
        title,
        notes,
        kind,
        priority,
        dueDate: kind === "todo" ? dueDate || undefined : undefined,
        dueTime: kind === "todo" ? dueTime || undefined : undefined,
        recurrence: kind === "daily" ? recurrence : [],
      });
    }
    onClose();
  };

  const remove = () => {
    if (isHabit && habit) deleteHabit(habit.id);
    if (!isHabit && task) deleteTask(task.id);
    onClose();
  };

  const editing = !!task || !!habit;

  const footer = (
    <div className="flex gap-3">
      {editing &&
        (confirmDelete ? (
          <Btn variant="danger" className="flex-1" onClick={remove}>
            Really delete?
          </Btn>
        ) : (
          <Btn variant="ghost" className="flex-1" onClick={() => setConfirmDelete(true)}>
            Delete
          </Btn>
        ))}
      <Btn variant="primary" className="flex-[2]" onClick={save} disabled={!title.trim()}>
        {editing ? "Save changes" : isHabit ? "Add habit" : "Add task"}
      </Btn>
    </div>
  );

  return (
    <Sheet
      open={!!target}
      onClose={onClose}
      title={editing ? (isHabit ? "Edit Habit" : "Edit Task") : isHabit ? "New Habit" : "New Task"}
      footer={footer}
    >
      <Field label={isHabit ? "Habit name" : "Task name"}>
        <input
          className={inputCls}
          value={title}
          autoFocus={!editing}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
          placeholder={isHabit ? "e.g. Read 10 pages" : "e.g. Study for 30 minutes"}
          maxLength={80}
        />
      </Field>

      {!isHabit && (
        <>
          <Field label="Type">
            <Segmented
              ariaLabel="Task type"
              value={kind}
              onChange={setKind}
              options={[
                { value: "todo", label: "One-time" },
                { value: "daily", label: "Daily" },
              ]}
            />
          </Field>
          <Field label="Priority">
            <Segmented
              ariaLabel="Priority"
              value={String(priority) as "1" | "2" | "3"}
              onChange={(v) => setPriority(Number(v) as Priority)}
              options={[
                { value: "1", label: PRIORITY_LABELS[1] },
                { value: "2", label: PRIORITY_LABELS[2] },
                { value: "3", label: PRIORITY_LABELS[3] },
              ]}
            />
          </Field>
          {kind === "todo" ? (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <Field label="Due date">
                <input
                  type="date"
                  className={inputCls}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </Field>
              <Field label="Time (optional)">
                <input
                  type="time"
                  className={inputCls}
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </Field>
            </div>
          ) : (
            <Field label="Repeats on">
              <WeekdayPicker
                value={recurrence}
                onChange={setRecurrence}
                emptyLabel="Every day"
              />
            </Field>
          )}
          <Field label="Notes (optional)">
            <textarea
              className={`${inputCls} min-h-[70px] py-2.5 resize-none`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={240}
            />
          </Field>
        </>
      )}

      {isHabit && (
        <>
          <Field label="Icon">
            <div className="flex flex-wrap gap-1.5">
              {HABIT_EMOJI.map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-pressed={emoji === e}
                  onClick={() => setEmoji(emoji === e ? "" : e)}
                  className={`h-11 w-11 rounded-xl text-[20px] transition-colors ${
                    emoji === e
                      ? "bg-ember-500/25 border-2 border-ember-400"
                      : "bg-ink-900 border border-ink-600 active:bg-ink-700"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Days">
            <WeekdayPicker
              value={recurrence}
              onChange={setRecurrence}
              emptyLabel="Every day"
            />
          </Field>
        </>
      )}

      <div className="mb-5 flex items-center justify-center gap-3 rounded-xl border border-glimmer-500/25 bg-glimmer-500/10 py-2.5 text-[13.5px] font-bold">
        <span className="text-ember-300">+{rewards.xp} XP</span>
        <span className="inline-flex items-center gap-1 text-glimmer-300">
          <ISparkFill size={13} /> +{rewards.glimmer}
        </span>
        <span className="text-[11px] font-semibold text-ink-300">per completion</span>
      </div>

    </Sheet>
  );
}
