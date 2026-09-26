"use client";

import { useState } from "react";
import { useGame } from "@/state/gameStore";
import { Btn, EmptyState, Field, inputCls, Sheet } from "@/components/ui";
import { COSMETICS } from "@/config/cosmetics";
import { IGem, ILock, IPlus, ISparkFill } from "@/components/icons";
import type { CosmeticSlot, Reward } from "@/domain/types";

const TREAT_ICONS = ["🎬", "🎮", "🍜", "☕", "🧋", "🍰", "🛁", "📖", "🎧", "🎁", "🏖️", "🍫"];
const SLOT_NAMES: Record<CosmeticSlot, string> = {
  frame: "Frames",
  aura: "Auras",
  title: "Titles",
};

function RewardSheet({
  reward,
  open,
  onClose,
}: {
  reward: Reward | null | "new";
  open: boolean;
  onClose: () => void;
}) {
  const { addReward, updateReward, deleteReward } = useGame();
  const editing = reward !== null && reward !== "new" ? reward : null;
  const [title, setTitle] = useState(editing?.title ?? "");
  const [price, setPrice] = useState(editing ? String(editing.price) : "100");
  const [icon, setIcon] = useState(editing?.icon ?? "🎁");
  const [note, setNote] = useState(editing?.note ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    const p = Math.round(Number(price));
    if (!title.trim() || !Number.isFinite(p) || p < 1) return;
    if (editing) updateReward(editing.id, { title, price: p, icon, note });
    else addReward({ title, price: p, icon, note });
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
              deleteReward(editing.id);
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
        {editing ? "Save changes" : "Add treat"}
      </Btn>
    </div>
  );

  return (
  <Sheet
    open={open}
    onClose={onClose}
    title={editing ? "Edit Treat" : "New Treat"}
    footer={footer}
  >
    <div className="max-h-[calc(100dvh-180px)] overflow-y-auto pr-1 pb-4">
      <Field label="Treat name">
        <input
          className={inputCls}
          value={title}
          autoFocus={!editing}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. One hour of gaming"
          maxLength={60}
        />
      </Field>

      <Field label="Icon">
        <div className="flex flex-wrap gap-1.5">
          {TREAT_ICONS.map((e) => (
            <button
              key={e}
              type="button"
              aria-pressed={icon === e}
              onClick={() => setIcon(e)}
              className={`h-11 w-11 rounded-xl text-[20px] ${
                icon === e
                  ? "bg-glimmer-500/25 border-2 border-glimmer-400"
                  : "bg-ink-900 border border-ink-600 active:bg-ink-700"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Price (Glimmer)">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            className={inputCls}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Field>

        <Field label="Note (optional)">
          <input
            className={inputCls}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={60}
          />
        </Field>
      </div>
    </div>
  </Sheet>
);

}

export default function RewardsScreen() {
  const { profile, rewards, redeemReward, buyCosmetic, equipCosmetic } = useGame();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetReward, setSheetReward] = useState<Reward | null | "new">(null);
  const [sheetKey, setSheetKey] = useState(0);

  if (!profile) return null;

  const openSheet = (r: Reward | "new") => {
    setSheetKey((k) => k + 1);
    setSheetReward(r);
    setSheetOpen(true);
  };

  return (
    <div className="px-4 pb-36">
      <header className="pt-2">
        <h1 className="font-display text-[22px] text-parchment">Rewards</h1>
        <p className="text-[12.5px] text-ink-300">Earn Glimmer in the field. Spend it on joy.</p>
      </header>

      <div className="mt-3 flex items-center gap-3 rounded-card border border-glimmer-500/30 bg-gradient-to-br from-glimmer-500/15 to-ink-800 px-4 py-3.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-glimmer-500/20 text-glimmer-300">
          <ISparkFill size={22} />
        </span>
        <div>
          <p className="text-[22px] font-extrabold leading-none text-glimmer-300 tabular-nums">
            {profile.glimmer}
          </p>
          <p className="text-[11.5px] font-semibold text-ink-300">Glimmer in your pouch</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between px-1">
        <h2 className="font-display text-[13px] uppercase tracking-[0.14em] text-ink-200">
          Real-life treats
        </h2>
        <button
          type="button"
          onClick={() => openSheet("new")}
          className="flex h-10 items-center gap-1 rounded-full bg-ink-700 border border-ink-600 px-3.5 text-[12.5px] font-bold text-parchment active:bg-ink-600"
        >
          <IPlus size={14} /> New treat
        </button>
      </div>

      <button
        type="button"
        onClick={() => openSheet("new")}
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-card border-2 border-dashed border-glimmer-500/55 bg-glimmer-500/5 px-4 py-3.5 text-[14px] font-bold text-glimmer-600 active:bg-glimmer-500/10"
      >
        <IPlus size={16} /> Create a treat
      </button>

      {rewards.length === 0 ? (
        <EmptyState
          icon={<IGem size={26} />}
          title="Nothing to buy yet"
          body="Create your first reward — real treats you only allow yourself after earning them."
          action={
            <Btn variant="primary" onClick={() => openSheet("new")}>
              <IPlus size={16} /> Create your first reward
            </Btn>
          }
        />
      ) : (
        <div className="mt-2 space-y-2.5">
          {rewards.map((r) => {
            const affordable = profile.glimmer >= r.price;
            return (
              <div
                key={r.id}
                role="button"
                tabIndex={0}
                onClick={() => openSheet(r)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") openSheet(r);
                }}
                className="flex items-center gap-3 rounded-card border border-ink-600/70 bg-ink-800/90 px-3.5 py-3 active:bg-ink-700/70"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 border border-ink-600 text-[22px]">
                  {r.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-bold text-parchment">{r.title}</p>
                  <p className="text-[11.5px] text-ink-300">
                    {r.note ?? "A well-earned indulgence"}
                    {r.redeemedCount > 0 ? ` · claimed ×${r.redeemedCount}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    redeemReward(r.id);
                  }}
                  className={`shrink-0 rounded-xl px-3 py-2.5 text-[13px] font-extrabold min-h-11 ${
                    affordable
                      ? "bg-gradient-to-b from-glimmer-300 to-glimmer-500 text-ink-950 active:brightness-90"
                      : "bg-ink-900 border border-ink-600 text-ink-300"
                  }`}
                  aria-label={`Redeem ${r.title} for ${r.price} glimmer`}
                >
                  {r.price} ✦
                </button>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mt-7 px-1 font-display text-[13px] uppercase tracking-[0.14em] text-ink-200">
        The Armory — cosmetics
      </h2>
      {(Object.keys(SLOT_NAMES) as CosmeticSlot[]).map((slot) => {
        const items = COSMETICS.filter((c) => c.slot === slot);
        return (
          <div key={slot} className="mt-2.5">
            <p className="px-1 pb-1.5 text-[11.5px] font-bold uppercase tracking-widest text-ink-300">
              {SLOT_NAMES[slot]}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {items.map((c) => {
                const owned = profile.owned.includes(c.id);
                const equipped = profile.equipped[slot] === c.id;
                return (
                  <div
                    key={c.id}
                    className="rounded-card border border-ink-600/70 bg-ink-800/90 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-7 w-7 shrink-0 rounded-full border border-ink-500"
                        style={{
                          background: `radial-gradient(circle, hsl(${c.hue} 80% 62% / .85), hsl(${c.hue} 70% 30% / .5))`,
                        }}
                        aria-hidden
                      />
                      <p className="truncate text-[12.5px] font-bold text-parchment">{c.name}</p>
                    </div>
                    <p className="mt-1 line-clamp-2 min-h-[26px] text-[10.5px] leading-snug text-ink-300">
                      {c.flavor}
                    </p>
                    {equipped ? (
                      <span className="mt-2 inline-block text-[11.5px] font-bold text-moss-400">
                        ✓ Equipped
                      </span>
                    ) : owned ? (
                      <button
                        type="button"
                        onClick={() => equipCosmetic(slot, c.id)}
                        className="mt-2 w-full rounded-lg bg-ink-700 border border-ink-500 py-2 text-[12px] font-bold text-parchment active:bg-ink-600"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => buyCosmetic(c.id)}
                        className={`mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-[12px] font-extrabold ${
                          profile.glimmer >= c.price
                            ? "bg-gradient-to-b from-glimmer-300 to-glimmer-500 text-ink-950 active:brightness-90"
                            : "bg-ink-900 border border-ink-600 text-ink-300"
                        }`}
                      >
                        {profile.glimmer < c.price && <ILock size={12} />}
                        {c.price} ✦
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <RewardSheet
        key={sheetKey}
        reward={sheetReward}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
