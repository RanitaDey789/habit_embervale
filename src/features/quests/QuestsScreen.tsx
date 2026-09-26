"use client";

import { useState } from "react";
import { useGame } from "@/state/gameStore";
import { EmptyState, ProgressBar, Btn } from "@/components/ui";
import { QuestSheet } from "@/features/quests/QuestSheet";
import {
  ICheck,
  IChevronDown,
  IMap,
  IPlus,
  IQuill,
  IScroll,
} from "@/components/icons";
import type { Quest } from "@/domain/types";

function QuestCard({
  quest,
  expanded,
  onToggleExpand,
  onEdit,
}: {
  quest: Quest;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
}) {
  const toggleMilestone = useGame((s) => s.toggleMilestone);
  const doneCount = quest.steps.filter((s) => s.done).length;
  const total = quest.steps.length;
  const finished = quest.status === "done";

  return (
    <article
      className={`overflow-hidden rounded-card border ${
        finished ? "border-moss-500/30 bg-ink-850/70" : "border-ink-600/70 bg-ink-800/90"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        className="flex items-center gap-3 px-4 py-3.5 active:bg-ink-700/50"
      >
        <span className={`shrink-0 ${finished ? "text-moss-400" : "text-ember-300"}`}>
          <IScroll size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-parchment">{quest.title}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <ProgressBar
              value={doneCount}
              max={total || 1}
              tone={finished ? "moss" : "xp"}
              height="h-1.5"
              className="flex-1"
              label={`${quest.title} progress`}
            />
            <span className="text-[11.5px] font-bold tabular-nums text-ink-300">
              {doneCount}/{total}
            </span>
          </div>
        </div>
        <span className={`text-ink-300 transition-transform ${expanded ? "rotate-180" : ""}`}>
          <IChevronDown size={18} />
        </span>
      </div>

      {expanded && (
        <div className="border-t border-ink-600/50 px-4 pb-3 pt-1 animate-fade-in">
          {quest.description && (
            <p className="py-2 text-[13px] leading-relaxed text-ink-200">{quest.description}</p>
          )}
          <ul className="space-y-1">
            {quest.steps.map((step) => (
              <li key={step.id}>
                <button
                  type="button"
                  disabled={finished}
                  onClick={() => toggleMilestone(quest.id, step.id)}
                  aria-pressed={step.done}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left active:bg-ink-700/60 disabled:opacity-80"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      step.done
                        ? "border-moss-400 bg-moss-500/90 text-ink-950"
                        : "border-ink-500 text-transparent"
                    }`}
                  >
                    {step.done && <ICheck size={13} strokeWidth={2.8} />}
                  </span>
                  <span
                    className={`text-[14px] font-medium ${
                      step.done ? "text-ink-300 line-through decoration-ink-400" : "text-parchment"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {!finished && (
            <div className="mt-1 flex justify-end">
              <Btn variant="ghost" className="!min-h-10 text-[13px]" onClick={onEdit}>
                <IQuill size={14} /> Edit quest
              </Btn>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function QuestsScreen() {
  const quests = useGame((s) => s.quests);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Quest | null | "new">(null);
  const [sheetKey, setSheetKey] = useState(0);

  const active = quests.filter((q) => q.status === "active");
  const done = quests.filter((q) => q.status === "done");

  const openSheet = (q: Quest | "new") => {
    setSheetKey((k) => k + 1);
    setSheet(q);
  };

  return (
    <div className="px-4 pb-36">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-display text-[22px] text-parchment">Quests</h1>
          <p className="text-[12.5px] text-ink-300">Big goals, broken into brave little steps.</p>
        </div>
        <Btn variant="primary" onClick={() => openSheet("new")} aria-label="Create a new quest">
          <IPlus size={17} /> New
        </Btn>
      </header>

      <button
        type="button"
        onClick={() => openSheet("new")}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-card border-2 border-dashed border-ember-500/45 bg-ember-500/5 px-4 py-3.5 text-[14px] font-bold text-ember-600 active:bg-ember-500/10"
      >
        <IPlus size={17} /> Begin a new quest
      </button>

      {quests.length === 0 ? (
        <EmptyState
          icon={<IMap size={28} />}
          title="Your adventure starts here"
          body="A quest is a bigger goal with milestones — like learning a language or shipping a project."
          action={
            <Btn variant="primary" onClick={() => openSheet("new")}>
              <IPlus size={17} /> Create Quest
            </Btn>
          }
        />
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {active.map((q) => (
              <QuestCard
                key={q.id}
                quest={q}
                expanded={expandedId === q.id}
                onToggleExpand={() => setExpandedId(expandedId === q.id ? null : q.id)}
                onEdit={() => openSheet(q)}
              />
            ))}
          </div>

          {done.length > 0 && (
            <>
              <h2 className="mt-6 px-1 font-display text-[13px] uppercase tracking-[0.14em] text-ink-300">
                Conquered — {done.length}
              </h2>
              <div className="mt-2 space-y-2">
                {done.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 rounded-card border border-moss-500/25 bg-ink-850/70 px-4 py-3"
                  >
                    <span className="text-moss-400">
                      <ICheck size={18} strokeWidth={2.4} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-ink-200">{q.title}</p>
                      <p className="text-[11.5px] text-ink-400">
                        {q.steps.length} milestones
                        {q.completedAt ? ` · ${q.completedAt.slice(0, 10)}` : ""}
                      </p>
                    </div>
                    <Btn
                      variant="ghost"
                      className="!min-h-9 px-2.5 text-[12px]"
                      onClick={() => openSheet(q)}
                    >
                      View
                    </Btn>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <QuestSheet key={sheetKey} quest={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
