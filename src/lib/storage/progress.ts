import type { AttemptRecord, UserProgress } from "../domain/types";

const STORAGE_KEY = "k8s-trainer-progress";

export const DEFAULT_PROGRESS: UserProgress = {
  attempts: [],
  streak: { current: 0, longest: 0 },
  weaknesses: {},
};

function normalizeProgress(data: unknown): UserProgress {
  if (!data || typeof data !== "object") return DEFAULT_PROGRESS;

  const parsed = data as Partial<UserProgress>;
  const streak =
    parsed.streak && typeof parsed.streak === "object"
      ? {
          current: Number(parsed.streak.current ?? 0),
          longest: Number(parsed.streak.longest ?? 0),
          lastActivityDate:
            typeof parsed.streak.lastActivityDate === "string"
              ? parsed.streak.lastActivityDate
              : undefined,
        }
      : DEFAULT_PROGRESS.streak;

  return {
    attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
    streak,
    weaknesses:
      parsed.weaknesses && typeof parsed.weaknesses === "object"
        ? parsed.weaknesses
        : {},
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveAttempt(attempt: AttemptRecord, weakRuleIds: string[]): UserProgress {
  const current = loadProgress();
  const today = new Date().toISOString().slice(0, 10);
  const last = current.streak.lastActivityDate;

  let streakCurrent = current.streak.current;
  if (last !== today) {
    if (last) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      streakCurrent = last === yesterdayStr ? streakCurrent + 1 : 1;
    } else {
      streakCurrent = 1;
    }
  }

  const weaknesses = { ...current.weaknesses };
  for (const ruleId of weakRuleIds) {
    weaknesses[ruleId] = (weaknesses[ruleId] ?? 0) + 1;
  }

  const updated: UserProgress = {
    attempts: [...current.attempts, attempt],
    streak: {
      current: streakCurrent,
      longest: Math.max(current.streak.longest, streakCurrent),
      lastActivityDate: today,
    },
    weaknesses,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
