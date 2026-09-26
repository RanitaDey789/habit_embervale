"use client";

import { useState } from "react";
import { useGame } from "@/state/gameStore";
import { Avatar } from "@/components/Avatar";
import { Btn, Field, inputCls, ProgressRing, Sheet, StatTile } from "@/components/ui";
import { SettingsSheet } from "@/features/hero/SettingsSheet";
import { CLASSES } from "@/config/classes";
import { COSMETICS } from "@/config/cosmetics";
import { ACHIEVEMENTS } from "@/config/achievements";
import { KEY_ART_SRC } from "@/config/branding";
import { xpNeededFor } from "@/domain/progression";
import { stat } from "@/state/snapshot";
import {
  achievementIcon,
  IGear,
  IGem,
  IFlameFill,
  ILock,
  IQuill,
  IScroll,
  ISparkFill,
  ITrophy,
  IX,
} from "@/components/icons";
import type { CosmeticSlot, Profile } from "@/domain/types";

const SLOT_LABELS: Record<CosmeticSlot, string> = {
  frame: "Frame",
  aura: "Aura",
  title: "Title",
};

function EquipmentPicker({
  slot,
  profile,
  onClose,
}: {
  slot: CosmeticSlot | null;
  profile: Profile;
  onClose: () => void;
}) {
  const { buyCosmetic, equipCosmetic } = useGame();
  const items = slot ? COSMETICS.filter((c) => c.slot === slot) : [];
  return (
    <Sheet open={!!slot} onClose={onClose} title={slot ? `${SLOT_LABELS[slot]}s` : ""}>
      <div className="space-y-2 pb-2">
        {slot && (
          <button
            type="button"
            onClick={() => {
              equipCosmetic(slot, "");
              onClose();
            }}
            className="flex w-full items-center justify-between rounded-xl border border-ink-600 bg-ink-900 px-4 py-3.5 text-[14px] font-bold text-ink-200 active:bg-ink-700"
          >
            <span className="inline-flex items-center gap-2">
              <IX size={15} /> None
            </span>
            {!profile.equipped[slot] && <span className="text-[11px] text-moss-400">current</span>}
          </button>
        )}
        {items.map((c) => {
          const owned = profile.owned.includes(c.id);
          const equipped = profile.equipped[slot ?? "frame"] === c.id;
          return (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-800 px-4 py-3"
            >
              <span
                className="h-8 w-8 shrink-0 rounded-full border border-ink-500"
                style={{ background: `radial-gradient(circle, hsl(${c.hue} 80% 60% / .8), hsl(${c.hue} 70% 30% / .4))` }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-parchment">{c.name}</p>
                <p className="truncate text-[11.5px] text-ink-300">{c.flavor}</p>
              </div>
              {equipped ? (
                <span className="text-[12px] font-bold text-moss-400">Equipped</span>
              ) : owned ? (
                <Btn
                  variant="soft"
                  className="!min-h-9 px-3 text-[12.5px]"
                  onClick={() => {
                    if (slot) equipCosmetic(slot, c.id);
                    onClose();
                  }}
                >
                  Equip
                </Btn>
              ) : (
                <Btn
                  variant="gold"
                  className="!min-h-9 px-3 text-[12.5px]"
                  onClick={() => buyCosmetic(c.id)}
                  disabled={profile.glimmer < c.price}
                >
                  {c.price} ✦
                </Btn>
              )}
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

export default function HeroScreen() {
  const profile = useGame((s) => s.profile);
  const unlocks = useGame((s) => s.unlocks);
  const updateProfile = useGame((s) => s.updateProfile);
  const setTab = useGame((s) => s.setTab);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [slot, setSlot] = useState<CosmeticSlot | null>(null);
  const [classOpen, setClassOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  if (!profile) return null;
  const needed = xpNeededFor(profile.level);
  const unlockedSet = new Set(unlocks.map((u) => u.id));
  const cls = CLASSES.find((c) => c.id === profile.classId) ?? CLASSES[0];
  const completions = stat(profile, "tasks") + stat(profile, "dailies") + stat(profile, "habits");

  const equippedName = (s: CosmeticSlot) => {
    const id = profile.equipped[s];
    return id ? (COSMETICS.find((c) => c.id === id)?.name ?? "—") : "None";
  };

  return (
    <div className="pb-36">
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={KEY_ART_SRC}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-950/20 to-ink-950" />
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950/60 text-parchment backdrop-blur-sm active:bg-ink-800"
        >
          <IGear size={20} />
        </button>
      </div>

      {/* Identity */}
      <div className="relative z-10 -mt-14 flex flex-col items-center px-4">
        <div className="rounded-full shadow-lift-lg ring-4 ring-ink-850">
          <Avatar profile={profile} size={104} />
        </div>
        <button
          type="button"
          onClick={() => {
            setNameDraft(profile.name);
            setNameOpen(true);
          }}
          className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 active:bg-ink-800"
          aria-label="Change hero name"
        >
          <span className="font-display text-[21px] text-parchment">{profile.name}</span>
          <IQuill size={14} className="text-ink-300" />
        </button>
        <button
          type="button"
          onClick={() => setClassOpen(true)}
          className="mt-0.5 rounded-full border border-ink-600 bg-ink-800 px-3 py-1 text-[12px] font-bold text-ink-100 active:bg-ink-700"
          style={{ color: cls.primary }}
        >
          {cls.name} · {cls.title}
        </button>
        <p className="mt-1 text-[11.5px] italic text-ink-300">“{cls.creed}”</p>
      </div>

      {/* Level */}
      <div className="mt-5 px-4">
        <div className="flex items-center gap-4 rounded-card border border-ink-600/70 bg-ink-800/90 p-4">
          <ProgressRing value={profile.xp} max={needed} size={92} stroke={7}>
            <div className="text-center">
              <p className="font-display text-[24px] font-bold leading-none text-parchment">
                {profile.level}
              </p>
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-ink-300">level</p>
            </div>
          </ProgressRing>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-[13px] font-bold">
              <span className="text-ember-300">{profile.totalXp} total XP</span>
              <span className="text-ink-300 tabular-nums">
                {profile.xp}/{needed}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[13px] font-bold">
              <span className="inline-flex items-center gap-1 text-glimmer-300">
                <ISparkFill size={14} /> {profile.glimmer}
              </span>
              <span className="inline-flex items-center gap-1 text-ember-300">
                <IFlameFill size={14} /> {profile.streak.current}
                <span className="text-ink-400 font-semibold">/ best {profile.streak.best}</span>
              </span>
            </div>
            <p className="text-[11.5px] text-ink-300">
              {profile.streak.shields > 0
                ? `${profile.streak.shields} streak shield${profile.streak.shields > 1 ? "s" : ""} ready`
                : "No streak shields — earn one every 7 active days"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 px-4 sm:grid-cols-4">
        <StatTile icon={<ISparkFill size={12} />} label="Completions" value={String(completions)} />
        <StatTile icon={<IScroll size={12} />} label="Quests done" value={String(stat(profile, "quests"))} />
        <StatTile
          icon={<ITrophy size={12} />}
          label="Milestones"
          value={String(stat(profile, "milestones"))}
        />
        <StatTile
          icon={<IGem size={12} />}
          label="Glimmer spent"
          value={String(stat(profile, "glimmerSpent"))}
        />
      </div>

      {/* Equipment */}
      <h2 className="mt-7 px-5 font-display text-[13px] uppercase tracking-[0.14em] text-ink-200">
        Equipment
      </h2>
      <div className="mt-2 grid grid-cols-3 gap-2.5 px-4">
        {(Object.keys(SLOT_LABELS) as CosmeticSlot[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlot(s)}
            className="rounded-card border border-ink-600/70 bg-ink-800/90 px-3 py-3 text-left active:bg-ink-700"
          >
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-ink-300">
              {SLOT_LABELS[s]}
            </p>
            <p className="mt-1 truncate text-[12.5px] font-bold text-parchment">{equippedName(s)}</p>
          </button>
        ))}
      </div>

      {/* Achievements */}
      <div className="mt-7 flex items-baseline justify-between px-5">
        <h2 className="font-display text-[13px] uppercase tracking-[0.14em] text-ink-200">
          Deeds & Honors
        </h2>
        <span className="text-[12px] font-bold text-ink-300">
          {unlocks.length}/{ACHIEVEMENTS.length}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2.5 px-4">
        {ACHIEVEMENTS.map((a) => {
          const got = unlockedSet.has(a.id);
          return (
            <div
              key={a.id}
              className={`rounded-card border p-3 ${
                got
                  ? "border-glimmer-500/40 bg-gradient-to-b from-glimmer-500/10 to-ink-800"
                  : "border-ink-600/60 bg-ink-850/70"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    got ? "bg-glimmer-500/20 text-glimmer-300" : "bg-ink-800 text-ink-400"
                  }`}
                >
                  {got ? achievementIcon(a.icon, 19) : <ILock size={16} />}
                </span>
                <p className={`text-[12.5px] font-bold leading-tight ${got ? "text-parchment" : "text-ink-200"}`}>
                  {a.name}
                </p>
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-ink-300">{a.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 px-4">
        <Btn variant="soft" className="w-full" onClick={() => setTab("stats")}>
          View your chronicle →
        </Btn>
      </div>

      {/* Sheets */}
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <EquipmentPicker slot={slot} profile={profile} onClose={() => setSlot(null)} />

      <Sheet open={classOpen} onClose={() => setClassOpen(false)} title="Choose your calling">
        <div className="space-y-2 pb-2">
          {CLASSES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                updateProfile({ classId: c.id });
                setClassOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left active:bg-ink-700 ${
                c.id === profile.classId ? "border-ember-400/60 bg-ember-500/10" : "border-ink-600 bg-ink-800"
              }`}
            >
              <span
                className="h-9 w-9 shrink-0 rounded-full"
                style={{ background: `linear-gradient(160deg, ${c.primary}, ${c.secondary})` }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-parchment">{c.name}</span>
                <span className="block truncate text-[11.5px] text-ink-300">{c.description}</span>
              </span>
              {c.id === profile.classId && <span className="text-[11px] font-bold text-ember-300">current</span>}
            </button>
          ))}
          <p className="px-1 pt-1 text-[11px] text-ink-400">
            Callings are cosmetic — every hero earns the same rewards.
          </p>
        </div>
      </Sheet>

      <Sheet open={nameOpen} onClose={() => setNameOpen(false)} title="Hero name">
        <Field label="Name">
          <input
            className={inputCls}
            value={nameDraft}
            maxLength={24}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && nameDraft.trim()) {
                updateProfile({ name: nameDraft });
                setNameOpen(false);
              }
            }}
          />
        </Field>
        <Btn
          variant="primary"
          className="w-full"
          disabled={!nameDraft.trim()}
          onClick={() => {
            updateProfile({ name: nameDraft });
            setNameOpen(false);
          }}
        >
          Save name
        </Btn>
      </Sheet>
    </div>
  );
}

