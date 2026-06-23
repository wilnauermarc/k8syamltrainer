export interface TrainerSettings {
  /** Milliseconds of idle time before showing an inline hint. 0 = disabled. */
  hintPauseMs: number;
}

const STORAGE_KEY = "k8s-trainer-settings";

export const HINT_PAUSE_MIN_MS = 500;
export const HINT_PAUSE_MAX_MS = 10_000;
export const HINT_PAUSE_STEP_MS = 500;
export const DEFAULT_HINT_PAUSE_MS = 2000;

const DEFAULT_SETTINGS: TrainerSettings = {
  hintPauseMs: DEFAULT_HINT_PAUSE_MS,
};

export function loadSettings(): TrainerSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<TrainerSettings>;
    return {
      hintPauseMs: clampHintPause(parsed.hintPauseMs ?? DEFAULT_HINT_PAUSE_MS),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: TrainerSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function updateSettings(partial: Partial<TrainerSettings>): TrainerSettings {
  const current = loadSettings();
  const updated: TrainerSettings = {
    ...current,
    ...partial,
    hintPauseMs:
      partial.hintPauseMs !== undefined
        ? clampHintPause(partial.hintPauseMs)
        : current.hintPauseMs,
  };
  saveSettings(updated);
  return updated;
}

export function clampHintPause(ms: number): number {
  if (ms <= 0) return 0;
  return Math.min(HINT_PAUSE_MAX_MS, Math.max(HINT_PAUSE_MIN_MS, Math.round(ms / HINT_PAUSE_STEP_MS) * HINT_PAUSE_STEP_MS));
}

export function formatHintPause(ms: number): string {
  if (ms <= 0) return "Off";
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  return Number.isInteger(seconds) ? `${seconds}s` : `${seconds.toFixed(1)}s`;
}
