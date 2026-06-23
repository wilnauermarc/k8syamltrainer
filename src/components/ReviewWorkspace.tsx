"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

import { FeedbackPanel } from "@/components/FeedbackPanel";
import { YamlReadOnly } from "@/components/YamlReadOnly";
import { evaluateReview } from "@/lib/evaluate-review";
import type { Exercise } from "@/lib/domain/types";
import { saveAttempt } from "@/lib/storage/progress";

interface ReviewWorkspaceProps {
  exercises: Exercise[];
}

export function ReviewWorkspace({ exercises }: ReviewWorkspaceProps) {
  const [index, setIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const exercise = exercises[index];
  const brokenYaml = exercise.brokenManifest ?? "";
  const expectedCount = exercise.reviewFindings?.length ?? 0;

  useEffect(() => {
    setExplanation("");
    setSubmitted(false);
    setShowHints(false);
  }, [exercise.id]);

  const result = submitted
    ? evaluateReview(explanation, exercise)
    : null;

  const handleSubmit = useCallback(() => {
    const evalResult = evaluateReview(explanation, exercise);
    setSubmitted(true);
    saveAttempt(
      {
        id: crypto.randomUUID(),
        exerciseId: exercise.id,
        mode: "review",
        difficulty: exercise.difficulty,
        score: evalResult.scoreReport.totalScore,
        maxScore: evalResult.scoreReport.maxScore,
        completedAt: new Date().toISOString(),
      },
      evalResult.missed.map((m) => m.id),
    );
  }, [explanation, exercise]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => index > 0 && setIndex(index - 1)}
            disabled={index === 0}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-slate-400">
            Review {index + 1} of {exercises.length}
          </span>
          <button
            type="button"
            onClick={() => index < exercises.length - 1 && setIndex(index + 1)}
            disabled={index === exercises.length - 1}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
            {exercise.difficulty}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!explanation.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-500 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" />
          Submit analysis
        </button>
      </div>

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="hidden overflow-y-auto border-r border-slate-800 bg-slate-950/50 p-5 lg:block">
          <h2 className="text-lg font-semibold text-slate-100">{exercise.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{exercise.description}</p>

          <p className="mt-4 text-xs text-slate-500">
            Find <span className="font-medium text-amber-400">{expectedCount}</span> issue
            {expectedCount !== 1 ? "s" : ""} and explain them in your own words.
          </p>

          {exercise.hints.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500/80"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                {showHints ? "Hide hints" : "Show hints"}
              </button>
              {showHints && (
                <ul className="mt-2 space-y-1 text-sm text-amber-200/70">
                  {exercise.hints.map((h) => (
                    <li key={h}>→ {h}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto p-4">
          <div className="lg:hidden">
            <h2 className="text-sm font-medium text-slate-200">{exercise.title}</h2>
            <p className="mt-1 text-xs text-slate-500">{exercise.description}</p>
          </div>

          <YamlReadOnly value={brokenYaml} />

          <div className="flex min-h-[160px] flex-1 flex-col">
            <label
              htmlFor="review-explanation"
              className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
              Your analysis
            </label>
            <textarea
              id="review-explanation"
              value={explanation}
              onChange={(e) => {
                setExplanation(e.target.value);
                if (submitted) setSubmitted(false);
              }}
              placeholder="What's wrong with this manifest? Explain each problem and why it matters…"
              className="min-h-[140px] flex-1 resize-none rounded-xl border border-slate-700/80 bg-slate-900/80 p-4 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
          </div>
        </div>

        <div className="border-l border-slate-800 bg-slate-950/50 lg:min-w-0 lg:overflow-hidden">
          {submitted && result ? (
            <FeedbackPanel
              report={result.scoreReport}
              isEmpty={result.isEmpty}
              parseError={null}
              live={false}
              submitted
            />
          ) : (
            <aside className="flex h-full flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-slate-500">
                Read the manifest, write what&apos;s broken and why, then submit.
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Mention selectors, ports, probes, image tags, resources…
              </p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
