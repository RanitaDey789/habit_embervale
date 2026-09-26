import { classById } from "@/config/classes";
import { cosmeticById } from "@/config/cosmetics";
import type { Profile } from "@/domain/types";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Procedurally rendered hero portrait — fully original character art
 * generated from the avatar seed, class palette and equipped cosmetics.
 */
export function Avatar({
  profile,
  size = 64,
  className = "",
}: {
  profile: Pick<Profile, "avatarSeed" | "classId" | "equipped">;
  size?: number;
  className?: string;
}) {
  const { avatarSeed, classId, equipped } = profile;
  const cls = classById(classId);
  const rnd = mulberry32(avatarSeed * 7919 + 13);
  const hood = Math.floor(rnd() * 3); // 0 hood, 1 helm band, 2 bare
  const happy = rnd() > 0.5;
  const pin = rnd() > 0.55;
  const blink = rnd() > 0.6;

  const aura = equipped.aura ? cosmeticById(equipped.aura) : undefined;
  const frame = equipped.frame ? cosmeticById(equipped.frame) : undefined;
  const auraHue = aura?.hue ?? 30;
  const frameHue = frame?.hue ?? 30;

  const gid = `av-${avatarSeed}-${classId}`;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${cls.name} portrait`}
    >
      <defs>
        <radialGradient id={`${gid}-aura`} cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor={`hsl(${auraHue} 85% 62% / ${aura ? 0.5 : 0.16})`} />
          <stop offset="70%" stopColor={`hsl(${auraHue} 80% 50% / ${aura ? 0.22 : 0.06})`} />
          <stop offset="100%" stopColor="hsl(0 0% 0% / 0)" />
        </radialGradient>
        <linearGradient id={`${gid}-cloak`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cls.primary} />
          <stop offset="100%" stopColor={cls.secondary} />
        </linearGradient>
      </defs>

      {/* backdrop + aura */}
      <circle cx="60" cy="60" r="56" fill="var(--color-ink-800)" />
      <circle cx="60" cy="60" r="54" fill={`url(#${gid}-aura)`} className={aura ? "animate-aura-pulse" : ""} />

      {/* cloak body */}
      <path
        d="M60 44c-15 0-24 11-26 27l-3 25h58l-3-25c-2-16-11-27-26-27z"
        fill={`url(#${gid}-cloak)`}
      />
      <path d="M31 96h58l-1.5-9c-17 6-38 6-55 0z" fill="rgb(0 0 0 / 0.22)" />

      {/* emblem */}
      <g transform="translate(60 78)" fill="var(--color-glimmer-400)">
        {cls.emblem === "blade" && <path d="M0 -8l2.5 10L0 8l-2.5-6z" />}
        {cls.emblem === "rune" && (
          <path d="M0 -7l6 4-2 8h-8l-2-8z" fillOpacity="0.9" />
        )}
        {cls.emblem === "arrow" && <path d="M0 -8l5 12-5-3-5 3z" />}
        {cls.emblem === "book" && <path d="M-6 -5h12v10h-12zM-4 -3h8M-4 0h8M-4 3h5" stroke="var(--color-glimmer-400)" strokeWidth="1" fill="none" />}
        {cls.emblem === "flask" && <path d="M-2 -7h4v4l4 7a4 4 0 0 1-3.6 6h-4.8A4 4 0 0 1-6 4l4-7z" />}
      </g>

      {/* head */}
      <circle cx="60" cy="34" r="17" fill="#f2d9b1" />
      {hood === 0 && (
        <path
          d="M60 12c-13 0-21 9-21 21 0 4 1 7 2.5 9.5C40 36 44 25 60 22c16 3 20 14 18.5 20.5C80 40 81 37 81 33c0-12-8-21-21-21z"
          fill={cls.secondary}
        />
      )}
      {hood === 1 && (
        <path d="M43 30a17 17 0 0 1 34 0l-2-8c-4-6-9-9-15-9s-11 3-15 9z" fill={cls.secondary} />
      )}
      {hood === 1 && <rect x="42" y="28" width="36" height="4.5" rx="2" fill="var(--color-glimmer-500)" />}

      {/* face */}
      {blink ? (
        <g stroke="#2b2334" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M50 36q3 2.5 6 0" />
          <path d="M64 36q3 2.5 6 0" />
        </g>
      ) : (
        <g fill="#2b2334">
          <circle cx="53" cy="36" r="2.4" />
          <circle cx="67" cy="36" r="2.4" />
        </g>
      )}
      {happy ? (
        <path d="M55 43q5 4 10 0" stroke="#c47b52" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M56.5 44h7" stroke="#c47b52" strokeWidth="2" strokeLinecap="round" />
      )}
      <circle cx="48" cy="41" r="2.6" fill="#e89a75" opacity="0.5" />
      <circle cx="72" cy="41" r="2.6" fill="#e89a75" opacity="0.5" />

      {/* tiny star pin */}
      {pin && (
        <path
          d="M78 22l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z"
          fill="var(--color-glimmer-300)"
        />
      )}

      {/* frame cosmetics */}
      {frame && (
        <g>
          <circle
            cx="60"
            cy="60"
            r="56.5"
            fill="none"
            stroke={`hsl(${frameHue} 75% 60%)`}
            strokeWidth="2.6"
            strokeDasharray={frame.id === "frame-runebound" ? "6 5" : undefined}
          />
          {frame.id === "frame-gilded" && (
            <circle cx="60" cy="60" r="52" fill="none" stroke={`hsl(${frameHue} 75% 68%)`} strokeWidth="1.2" opacity="0.8" />
          )}
          {frame.id === "frame-verdant" && (
            <g fill={`hsl(${frameHue} 55% 55%)`}>
              <circle cx="60" cy="3.5" r="3" />
              <circle cx="16" cy="22" r="2.4" />
              <circle cx="104" cy="22" r="2.4" />
            </g>
          )}
        </g>
      )}
      {!frame && (
        <circle cx="60" cy="60" r="56.5" fill="none" stroke="var(--color-ink-600)" strokeWidth="2" />
      )}
    </svg>
  );
}
