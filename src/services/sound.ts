/** Tiny WebAudio chiptune-style effects. No audio assets needed. */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSfxEnabled(on: boolean) {
  enabled = on;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  freq: number;
  end?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  at?: number;
}

function tone({ freq, end, dur, type = "triangle", gain = 0.08, at = 0 }: ToneOpts) {
  const c = ensureCtx();
  if (!c || !enabled) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (end) osc.frequency.exponentialRampToValueAtTime(end, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  complete() {
    tone({ freq: 660, end: 990, dur: 0.09, gain: 0.07 });
    tone({ freq: 990, end: 1320, dur: 0.12, at: 0.07, gain: 0.06 });
  },
  levelUp() {
    tone({ freq: 523, dur: 0.1, gain: 0.08 });
    tone({ freq: 659, dur: 0.1, at: 0.09, gain: 0.08 });
    tone({ freq: 784, dur: 0.12, at: 0.18, gain: 0.08 });
    tone({ freq: 1046, dur: 0.22, at: 0.28, gain: 0.09 });
  },
  unlock() {
    tone({ freq: 880, dur: 0.1, type: "sine", gain: 0.07 });
    tone({ freq: 1174, dur: 0.18, at: 0.1, type: "sine", gain: 0.07 });
  },
  spend() {
    tone({ freq: 1320, end: 880, dur: 0.12, type: "sine", gain: 0.06 });
  },
  error() {
    tone({ freq: 220, end: 160, dur: 0.16, type: "square", gain: 0.035 });
  },
};

export function vibrate(ms = 14) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* not supported */
    }
  }
}
