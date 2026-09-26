"use client";

import { useRef, useState } from "react";
import { useGame } from "@/state/gameStore";
import { Sheet, Btn } from "@/components/ui";
import { IDownload, IUpload, IFlameFill } from "@/components/icons";
import { APP_NAME, DATA_VERSION } from "@/config/gameConfig";
import { todayStr } from "@/utils/dates";

function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left active:bg-ink-700/50"
    >
      <div className="flex-1">
        <p className="text-[14.5px] font-bold text-parchment">{label}</p>
        <p className="text-[12px] text-ink-300">{sub}</p>
      </div>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${
          checked ? "bg-ember-500 border-ember-400" : "bg-ink-900 border-ink-500"
        }`}
      >
        <span
          className={`absolute top-0.5 h-[22px] w-[22px] rounded-full bg-parchment transition-[left] ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, updateSettings, exportBackup, importBackup, resetAll, pushToast } = useGame();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  const doExport = async () => {
    setBusy(true);
    try {
      const json = await exportBackup();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `embervale-backup-${todayStr()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      pushToast({ title: "Backup saved", sub: "Keep it somewhere safe.", tone: "xp" });
    } catch {
      pushToast({ title: "Export failed", sub: "Please try again.", tone: "danger" });
    } finally {
      setBusy(false);
    }
  };

  const doImport = async (file: File) => {
    setBusy(true);
    try {
      const text = await file.text();
      const res = await importBackup(text);
      if (!res.ok) {
        pushToast({ title: "Import failed", sub: res.error, tone: "danger" });
      }
    } catch {
      pushToast({ title: "Import failed", sub: "Couldn't read that file.", tone: "danger" });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Settings">
      <div className="space-y-1">
        <ToggleRow
          label="Sound effects"
          sub="Little chimes when you succeed"
          checked={settings.sound}
          onChange={(v) => updateSettings({ sound: v })}
        />
        <ToggleRow
          label="Reduce motion"
          sub="Calms animations across the app"
          checked={settings.reducedMotion}
          onChange={(v) => updateSettings({ reducedMotion: v })}
        />
      </div>

      <h3 className="mt-5 mb-2 px-1 font-display text-[12px] uppercase tracking-[0.14em] text-ink-300">
        Backup
      </h3>
      <p className="mb-3 px-1 text-[12.5px] leading-relaxed text-ink-300">
        Everything lives on this device only. Export a copy so a cleared browser doesn&apos;t end
        your saga.
      </p>
      <div className="flex gap-3">
        <Btn variant="soft" className="flex-1" onClick={doExport} disabled={busy}>
          <IDownload size={17} /> Export data
        </Btn>
        <Btn variant="soft" className="flex-1" onClick={() => fileRef.current?.click()} disabled={busy}>
          <IUpload size={17} /> Import
        </Btn>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Import backup file"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void doImport(f);
        }}
      />

      <h3 className="mt-6 mb-2 px-1 font-display text-[12px] uppercase tracking-[0.14em] text-ink-300">
        Danger
      </h3>
      {confirmReset ? (
        <div className="flex gap-3">
          <Btn variant="ghost" className="flex-1" onClick={() => setConfirmReset(false)}>
            Keep my data
          </Btn>
          <Btn variant="danger" className="flex-1" onClick={() => void resetAll()}>
            Erase everything
          </Btn>
        </div>
      ) : (
        <Btn variant="danger" className="w-full" onClick={() => setConfirmReset(true)}>
          Reset the vale
        </Btn>
      )}

      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-400">
        <IFlameFill size={12} /> {APP_NAME} · data v{DATA_VERSION} · private by design — nothing
        leaves this device
      </p>
    </Sheet>
  );
}
