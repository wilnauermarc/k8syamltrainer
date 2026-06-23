"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Flame, Target, TrendingUp } from "lucide-react";

import { loadProgress } from "@/lib/storage/progress";
import type { UserProgress } from "@/lib/domain/types";

export function ProgressDashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  const recent = [...progress.attempts].reverse().slice(0, 10);
  const weakAreas = Object.entries(progress.weaknesses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const avgScore =
    progress.attempts.length > 0
      ? progress.attempts.reduce((s, a) => s + a.score, 0) / progress.attempts.length
      : 0;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold text-slate-100">Your Progress</h1>
      <p className="mt-1 text-sm text-slate-500">Stored locally in your browser</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Target className="h-5 w-5 text-sky-400" />}
          label="Attempts"
          value={String(progress.attempts.length)}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-amber-400" />}
          label="Current streak"
          value={`${progress.streak.current} days`}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
          label="Average score"
          value={avgScore > 0 ? avgScore.toFixed(1) : "—"}
        />
      </div>

      {weakAreas.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Weak areas
          </h2>
          <ul className="mt-3 space-y-2">
            {weakAreas.map(([rule, count]) => (
              <li
                key={rule}
                className="flex justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm"
              >
                <span className="font-mono text-slate-300">{rule}</span>
                <span className="text-slate-500">{count}× missed</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Recent attempts
          </h2>
          <ul className="mt-3 space-y-2">
            {recent.map((attempt) => (
              <li
                key={attempt.id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm"
              >
                <span className="truncate text-slate-300">{attempt.exerciseId}</span>
                <span
                  className={`font-semibold tabular-nums ${
                    attempt.score >= 7
                      ? "text-emerald-400"
                      : attempt.score >= 5
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {attempt.score}/{attempt.maxScore}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {progress.attempts.length === 0 && (
        <p className="mt-12 text-center text-slate-500">
          No attempts yet. Head to Train and complete your first exercise.
        </p>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="mb-2">{icon}</div>
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-100">{value}</p>
    </div>
  );
}
