"use client";

import { useState } from "react";
import { useGame } from "@/state/gameStore";
import { Avatar } from "@/components/Avatar";
import { Btn, Field, inputCls } from "@/components/ui";
import { CLASSES } from "@/config/classes";
import { IFlameFill, ISparkFill, IShield, IChevronRight } from "@/components/icons";
import { KEY_ART_ALT, KEY_ART_SRC } from "@/config/branding";
import type { ClassId, Profile } from "@/domain/types";

const SLIDES = [
  {
    title: "Turn real life into an adventure.",
    body: "Embervale is a tiny RPG where the quests are your actual tasks — and the hero is you.",
  },
  {
    title: "Complete tasks. Earn XP. Level up.",
    body: "Every checkmark feeds your hero experience and fills your pouch with Glimmer.",
  },
  {
    title: "Keep the flame lit.",
    body: "Build streaks, unlock deeds, and spend Glimmer on real rewards you set yourself.",
  },
];

export default function Onboarding() {
  const finishOnboarding = useGame((s) => s.finishOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState<ClassId>("vanguard");
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [starting, setStarting] = useState(false);

  const previewProfile = {
    avatarSeed: seed,
    classId,
    equipped: {},
  } as Pick<Profile, "avatarSeed" | "classId" | "equipped">;

  if (step < 3) {
    return (
      <div className="flex min-h-dvh flex-col px-6 pb-10 pt-safe">
        <div className="relative mt-6 overflow-hidden rounded-3xl border border-ink-600/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={KEY_ART_SRC} alt={KEY_ART_ALT} className="h-56 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 rounded-full bg-ink-800/85 px-3 py-1.5 text-ember-600 shadow-lift backdrop-blur-sm">
            <IFlameFill size={15} />
            <span className="font-display text-[13px] font-semibold tracking-[0.2em]">EMBERVALE</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center" aria-live="polite">
          <h1 className="font-display text-[26px] leading-tight text-parchment">
            {SLIDES[step].title}
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-200">{SLIDES[step].body}</p>

          <div className="mt-6 flex items-center gap-3 text-ink-300">
            {step === 1 && (
              <>
                <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-ember-300">
                  <IFlameFill size={14} /> XP
                </span>
                <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-glimmer-300">
                  <ISparkFill size={14} /> Glimmer
                </span>
              </>
            )}
            {step === 2 && (
              <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-arcane-400">
                <IShield size={14} /> Streak shields protect missed days
              </span>
            )}
          </div>
        </div>

        <div className="mb-4 flex justify-center gap-2" aria-hidden>
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-ember-400" : "w-1.5 bg-ink-500"}`}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <Btn variant="ghost" className="flex-1" onClick={() => setStep(3)}>
            Skip
          </Btn>
          <Btn variant="primary" className="flex-[2]" onClick={() => setStep(step + 1)}>
            {step === 2 ? "Create your hero" : "Continue"} <IChevronRight size={16} />
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-5 pb-10 pt-safe">
      <div className="mx-auto max-w-[390px]">
        <p className="mt-6 text-center font-display text-[12px] tracking-[0.3em] text-ember-300">
          CHARACTER CREATION
        </p>
        <h1 className="mt-1 text-center font-display text-[24px] text-parchment">
          Who enters the vale?
        </h1>

        <div className="mt-5 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setSeed(Math.floor(Math.random() * 100000))}
            aria-label="Shuffle portrait"
            className="rounded-full active:scale-95 transition-transform"
          >
            <Avatar profile={previewProfile} size={110} />
          </button>
          <button
            type="button"
            onClick={() => setSeed(Math.floor(Math.random() * 100000))}
            className="mt-1 text-[12px] font-bold text-ink-300 underline decoration-ink-500 underline-offset-2 active:text-parchment"
          >
            Shuffle portrait
          </button>
        </div>

        <div className="mt-5">
          <Field label="Hero name">
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Wanderer"
              maxLength={24}
            />
          </Field>
        </div>

        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-300">
          Calling
        </p>
        <div className="space-y-2" role="radiogroup" aria-label="Choose a calling">
          {CLASSES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={classId === c.id}
              onClick={() => setClassId(c.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                classId === c.id
                  ? "border-ember-400/70 bg-ember-500/10"
                  : "border-ink-600 bg-ink-800/80 active:bg-ink-700"
              }`}
            >
              <span
                className="h-10 w-10 shrink-0 rounded-full border border-white/10"
                style={{ background: `linear-gradient(160deg, ${c.primary}, ${c.secondary})` }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-bold text-parchment">{c.name}</span>
                <span className="block truncate text-[11.5px] text-ink-300">{c.description}</span>
              </span>
              {classId === c.id && <IFlameFill size={16} className="shrink-0 text-ember-300" />}
            </button>
          ))}
        </div>

        <Btn
          variant="primary"
          className="mt-6 w-full !min-h-12 text-[16px]"
          disabled={starting}
          onClick={() => {
            setStarting(true);
            void finishOnboarding({ name, classId, avatarSeed: seed });
          }}
        >
          Begin the journey
        </Btn>
        <p className="mt-3 text-center text-[11px] text-ink-400">
          Everything is stored privately on this device.
        </p>
      </div>
    </div>
  );
}
