"use client";

import { useState } from "react";
import { useGame } from "@/state/gameStore";
import { Sheet, Field, inputCls, Btn } from "@/components/ui";
import { GAME_CONFIG } from "@/config/gameConfig";
import { taskRewards } from "@/domain/progression";
import type { Quest } from "@/domain/types";

export function QuestSheet({ quest, onClose }: { quest: Quest | null | "new"; onClose: () => void }) {
  const { addQuest, updateQuest, deleteQuest } = useGame();
  const editing = quest !== null && quest !== "new" ? quest : null;

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [stepsText, setStepsText] = useState(
    editing ? editing.steps.map((s) => `${s.done ? "[x] " : ""}${s.title}`).join("\n") : ""
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const milestone = taskRewards("milestone");
  const bonus = GAME_CONFIG.rewards.questCompletionBonus;

  const save = () => {
    if (!title.trim()) return;
    const steps = stepsText
      .split("\n")
      .map((l) => l.replace(/^\[x\]\s*/i, "").trim())
      .filter(Boolean);
    if (editing) updateQuest(editing.id, { title, description, steps });
    else addQuest({ title, description, steps });
    onClose();
  };

  const footer = (
    <div className="flex gap-3">
      {editing &&
        (confirmDelete ? (
          <Btn
            variant="danger"
            className="flex-1"
            onClick={() => {
              deleteQuest(editing.id);
              onClose();
            }}
          >
            Really delete?
          </Btn>
        ) : (
          <Btn variant="ghost" className="flex-1" onClick={() => setConfirmDelete(true)}>
            Delete
          </Btn>
        ))}
      <Btn variant="primary" className="flex-[2]" onClick={save} disabled={!title.trim()}>
        {editing ? "Save changes" : "Add quest"}
      </Btn>
    </div>
  );

  return (
    <Sheet open={!!quest} onClose={onClose} title={editing ? "Edit Quest" : "New Quest"} footer={footer}>
      <Field label="Quest name">
        <input
          className={inputCls}
          value={title}
          autoFocus={!editing}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Master Python fundamentals"
          maxLength={80}
        />
      </Field>
      <Field label="Why it matters (optional)">
        <textarea
          className={`${inputCls} min-h-[60px] py-2.5 resize-none`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />
      </Field>
      <Field label="Milestones — one per line">
        <textarea
          className={`${inputCls} min-h-[130px] py-2.5 font-mono text-[13px] leading-6 resize-none`}
          value={stepsText}
          onChange={(e) => setStepsText(e.target.value)}
          placeholder={"Study variables\nStudy functions\nPractice loops\nBuild a mini project"}
        />
      </Field>

      <div className="mb-5 rounded-xl border border-ember-500/25 bg-ember-500/10 px-4 py-3 text-[12.5px] leading-relaxed text-ink-100">
        <p>
          Each milestone: <b className="text-ember-300">+{milestone.xp} XP</b>{" "}
          <b className="text-glimmer-300">+{milestone.glimmer} ✦</b>
        </p>
        <p>
          Quest complete: <b className="text-ember-300">+{bonus.xp} XP</b>{" "}
          <b className="text-glimmer-300">+{bonus.glimmer} ✦</b>
        </p>
      </div>

    </Sheet>
  );
}
