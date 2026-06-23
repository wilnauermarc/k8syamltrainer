"use client";

import { Timer } from "lucide-react";

import {
  formatHintPause,
  HINT_PAUSE_MAX_MS,
  HINT_PAUSE_MIN_MS,
  HINT_PAUSE_STEP_MS,
  updateSettings,
} from "@/lib/storage/settings";

interface HintPauseControlProps {
  valueMs: number;
  onChange: (ms: number) => void;
}

export function HintPauseControl({ valueMs, onChange }: HintPauseControlProps) {
  const enabled = valueMs > 0;

  const handleSlider = (raw: number) => {
    const ms = raw <= HINT_PAUSE_MIN_MS / 2 ? 0 : raw;
    onChange(ms);
    updateSettings({ hintPauseMs: ms });
  };

  const handleToggle = () => {
    const ms = enabled ? 0 : 2000;
    onChange(ms);
    updateSettings({ hintPauseMs: ms });
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-2.5 py-1.5">
      <button
        type="button"
        onClick={handleToggle}
        title={enabled ? "Disable inline hints" : "Enable inline hints"}
        className={`rounded p-1 transition ${
          enabled ? "text-sky-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-800"
        }`}
      >
        <Timer className="h-3.5 w-3.5" />
      </button>
      <label className="hidden items-center gap-2 sm:flex">
        <span className="text-xs text-slate-500">Pause</span>
        <input
          type="range"
          min={0}
          max={HINT_PAUSE_MAX_MS}
          step={HINT_PAUSE_STEP_MS}
          value={enabled ? valueMs : HINT_PAUSE_MIN_MS}
          disabled={!enabled}
          onChange={(e) => handleSlider(Number(e.target.value))}
          className="h-1 w-20 cursor-pointer accent-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
        />
        <span className="w-9 text-right text-xs tabular-nums text-slate-400">
          {formatHintPause(valueMs)}
        </span>
      </label>
      <span className="text-xs tabular-nums text-slate-500 sm:hidden">
        {formatHintPause(valueMs)}
      </span>
    </div>
  );
}
