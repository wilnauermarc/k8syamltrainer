import type { Exercise } from "@/lib/domain/types";
import { BookOpen, Lightbulb, Target } from "lucide-react";

interface ExercisePanelProps {
  exercise: Exercise;
  showHints: boolean;
  onToggleHints: () => void;
}

export function ExercisePanel({ exercise, showHints, onToggleHints }: ExercisePanelProps) {
  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      <div>
        <span className="inline-block rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-sky-400">
          {exercise.difficulty}
        </span>
        <h2 className="mt-2 text-lg font-semibold text-slate-100">{exercise.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{exercise.description}</p>
      </div>

      {exercise.learningObjectives.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Target className="h-3.5 w-3.5" />
            Objectives
          </h3>
          <ul className="space-y-1.5 text-sm text-slate-300">
            {exercise.learningObjectives.map((obj) => (
              <li key={obj} className="flex gap-2">
                <span className="text-sky-500">•</span>
                {obj}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <BookOpen className="h-3.5 w-3.5" />
          Requirements
        </h3>
        <ul className="space-y-2 text-sm">
          {exercise.requirements.requiredFields.map((field) => (
            <li
              key={field.path}
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
            >
              <span className="text-slate-400">{field.description ?? field.path}</span>
              <span className="mt-0.5 block break-all font-mono text-xs text-sky-300">
                {JSON.stringify(field.value)}
              </span>
            </li>
          ))}
          {exercise.requirements.expectedValues.map((field) => (
            <li
              key={field.path}
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
            >
              <span className="text-slate-400">{field.description ?? field.path}</span>
              <span className="mt-0.5 block break-all font-mono text-xs text-sky-300">
                {field.equals !== undefined
                  ? JSON.stringify(field.equals)
                  : `contains ${field.contains}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {exercise.hints.length > 0 && (
        <section>
          <button
            type="button"
            onClick={onToggleHints}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500/80 transition hover:text-amber-400"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {showHints ? "Hide hints" : "Show hints"}
          </button>
          {showHints && (
            <ul className="mt-2 space-y-1.5 text-sm text-amber-200/70">
              {exercise.hints.map((hint) => (
                <li key={hint}>→ {hint}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </aside>
  );
}
