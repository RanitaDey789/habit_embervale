/** Local-time date helpers. Days are YYYY-MM-DD strings in local time. */

export function toDayStr(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDayStr(new Date());
}

export function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDaysStr(day: string, n: number): string {
  const d = parseDay(day);
  d.setDate(d.getDate() + n);
  return toDayStr(d);
}

/** Whole days from a -> b (positive when b is later). */
export function daysBetween(a: string, b: string): number {
  const ms = parseDay(b).getTime() - parseDay(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function weekdayOf(day: string): number {
  return parseDay(day).getDay();
}

export function formatDayLong(day: string): string {
  return parseDay(day).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatDayShort(day: string): string {
  return parseDay(day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function weekdayLetter(day: string): string {
  return ["S", "M", "T", "W", "T", "F", "S"][weekdayOf(day)];
}

export function isSameDay(aIso: string | undefined, day: string): boolean {
  if (!aIso) return false;
  return aIso.slice(0, 10) === day;
}

export function hourOf(ts: number): number {
  return new Date(ts).getHours();
}

export function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
