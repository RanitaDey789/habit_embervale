"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IX } from "@/components/icons";

/* ---------- Buttons (hand-glazed ceramic pebbles) ---------- */

type BtnVariant = "primary" | "soft" | "ghost" | "danger" | "gold";

export function Btn({
  variant = "soft",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
}) {
  const styles: Record<BtnVariant, string> = {
    primary:
      "bg-gradient-to-b from-ember-400 to-ember-600 text-[#fffdf9] font-bold " +
      "shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_4px_14px_-4px_rgb(148_69_31/0.45)] " +
      "active:translate-y-px active:brightness-95",

    gold:
      "bg-gradient-to-b from-glimmer-400 to-glimmer-600 text-[#fffdf9] font-bold " +
      "shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_4px_14px_-4px_rgb(169_110_18/0.45)] " +
      "active:translate-y-px active:brightness-95",

    soft:
      "bg-ink-700 text-parchment border border-ink-600 active:bg-ink-600/70",

    ghost:
      "bg-transparent text-ink-300 active:bg-ink-700",

    danger:
      "bg-[#ffdad6] text-[#93000a] border border-[#e5b0a8] active:brightness-95",
  };

  return (
    <button
      type="button"
      className={`min-h-11 inline-flex items-center justify-center gap-2 rounded-full px-5 text-[15px] transition-[filter,background-color,transform] select-none disabled:opacity-40 disabled:pointer-events-none ${styles[variant]} ${className}`}
      {...rest}
    />
  );
}

/* ---------- Progress track (stream / vine) ---------- */

export function ProgressBar({
  value,
  max,
  tone = "xp",
  height = "h-2.5",
  className = "",
  label,
}: {
  value: number;
  max: number;
  tone?: "xp" | "gold" | "moss" | "arcane" | "blood";
  height?: string;
  className?: string;
  label?: string;
}) {
  const pct =
    max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

  const tones = {
    xp: "from-ember-400 to-glimmer-400",
    gold: "from-glimmer-400 to-glimmer-500",
    moss: "from-moss-300 to-moss-400",
    arcane: "from-arcane-300 to-arcane-400",
    blood: "from-blood-400 to-blood-500",
  } as const;

  return (
    <div
      className={`w-full ${height} rounded-full bg-ink-900 border border-ink-600/80 shadow-[inset_0_1px_3px_rgb(30_41_34/0.08)] overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-label={label ?? "progress"}
    >
      <div
        className={`relative h-full rounded-full bg-gradient-to-r ${tones[tone]} transition-[width] duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      >
        {pct > 6 && (
          <span
            className="absolute right-0.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-glimmer-200 shadow-[0_0_6px_rgb(244_178_75/0.9)]"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Bottom sheet ---------- */

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[rgba(30,41,34,0.45)] backdrop-blur-[4px] animate-fade-in"
        onClick={onClose}
        tabIndex={-1}
      />

      {/* Sheet */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative flex w-full max-w-[430px] max-h-[88dvh] min-h-0 flex-col rounded-t-3xl bg-ink-850 border-t border-x border-ink-600 shadow-lift-lg animate-sheet-up outline-none"
      >
        {/* Header */}
        <div className="relative flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
          {/* Drag handle */}
          <div
            className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink-500"
            aria-hidden
          />

          <h2 className="pt-2 font-display text-[18px] font-semibold tracking-wide text-parchment">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-300 active:bg-ink-700"
          >
            <IX size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-4">
          {children}
        </div>

        {/* Fixed footer */}
        {footer && (
          <div className="shrink-0 border-t border-ink-600/80 bg-ink-850 px-5 pb-5 pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Form fields (quill fields) ---------- */

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.08em] text-ink-300">
        {label}
      </span>

      {children}
    </label>
  );
}

export const inputCls =
  "w-full min-h-11 rounded-xl bg-ink-900 border border-transparent px-3.5 text-[15px] text-parchment " +
  "placeholder:text-ink-400/80 shadow-[inset_0_2px_4px_rgb(30_41_34/0.05)] " +
  "focus:border-ember-500 focus:ring-2 focus:ring-ember-500/25 focus:outline-none";

/* ---------- Segmented control ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex gap-1 rounded-full bg-ink-900 border border-ink-600 p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-10 flex-1 rounded-full px-2 text-[13.5px] font-semibold transition-colors ${
            value === o.value
              ? "bg-ink-800 text-parchment border border-ink-600 shadow-lift"
              : "text-ink-400 active:bg-ink-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Small pieces ---------- */

export function Chip({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-ink-600 bg-ink-800 px-2.5 py-1 text-[12px] font-semibold text-ink-200 ${className}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex animate-fade-in flex-col items-center px-6 py-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ink-800 border border-ink-600 text-ember-500 shadow-lift">
        {icon}
      </div>

      <p className="font-display text-[19px] font-semibold text-parchment">
        {title}
      </p>

      <p className="mt-1.5 max-w-[270px] text-[13.5px] leading-relaxed text-ink-300">
        {body}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatTile({
  icon,
  label,
  value,
  accent = "text-parchment",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-card bg-ink-800 border border-ink-600 px-3.5 py-3 shadow-lift">
      <div className="flex items-center gap-1.5 text-ink-400 text-[11.5px] font-bold uppercase tracking-[0.07em]">
        {icon}
        <span>{label}</span>
      </div>

      <p
        className={`mt-1 text-[19px] font-extrabold tabular-nums ${accent}`}
      >
        {value}
      </p>
    </div>
  );
}

export function SectionHeader({
  icon,
  title,
  meta,
}: {
  icon: ReactNode;
  title: string;
  meta?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-1 pb-2 pt-5">
      <span className="text-ember-500">{icon}</span>

      <h3 className="font-display text-[13px] font-semibold tracking-[0.14em] uppercase text-ink-300">
        {title}
      </h3>

      {meta && (
        <span className="ml-auto text-[12px] font-bold text-ink-400">
          {meta}
        </span>
      )}
    </div>
  );
}

/* ---------- Progress ring ---------- */

export function ProgressRing({
  value,
  max,
  size = 88,
  stroke = 6,
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-ink-600)"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />

        <defs>
          <linearGradient
            id="ringGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="var(--color-ember-500)"
            />
            <stop
              offset="100%"
              stopColor="var(--color-glimmer-400)"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
