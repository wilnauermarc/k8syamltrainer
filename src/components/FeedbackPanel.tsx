import type { ScoreReport } from "@/lib/domain/types";
import { AlertCircle, CheckCircle2, Circle, MapPin } from "lucide-react";

interface FeedbackPanelProps {
  report: ScoreReport | null;
  isEmpty: boolean;
  parseError: string | null;
  live: boolean;
  submitted?: boolean;
  isComplete?: boolean;
  highlightedLines?: number[];
  highlightByPath?: Record<string, number>;
  activeFindingPath?: string | null;
  onSelectFinding?: (fieldPath: string) => void;
}

export function FeedbackPanel({
  report,
  isEmpty,
  parseError,
  live,
  submitted = false,
  isComplete = false,
  highlightedLines = [],
  highlightByPath = {},
  activeFindingPath = null,
  onSelectFinding,
}: FeedbackPanelProps) {
  if (isEmpty && !parseError) {
    return (
      <aside className="flex h-full flex-col items-center justify-center p-6 text-center">
        <Circle className="mb-3 h-8 w-8 text-slate-600" />
        <p className="text-sm text-slate-500">
          Start typing in the editor — feedback updates live.
        </p>
      </aside>
    );
  }

  if (parseError && !report) {
    return (
      <aside className="p-5">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {parseError}
        </div>
      </aside>
    );
  }

  if (!report) return null;

  const failed = report.findings.filter(
    (f) => !f.passed && f.severity !== "hint" && f.severity !== "info",
  );
  const passed = report.findings.filter(
    (f) => f.passed && f.severity !== "hint" && f.severity !== "info",
  );
  const orderedFindings = submitted ? [...failed, ...passed] : report.findings;

  const scoreColor =
    report.totalScore >= 7
      ? "text-emerald-400"
      : report.totalScore >= 5
        ? "text-amber-400"
        : "text-red-400";

  return (
    <aside className="flex h-full flex-col overflow-y-auto p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            {live ? "Live score" : "Final score"}
          </p>
          <p className={`text-3xl font-bold tabular-nums ${scoreColor}`}>
            {report.totalScore}
            <span className="text-lg text-slate-500">/{report.maxScore}</span>
          </p>
        </div>
        {isComplete && (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
            Complete
          </span>
        )}
        {!isComplete && report.totalScore >= 8 && failed.length === 0 && (
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
            Great job!
          </span>
        )}
      </div>

      {isComplete && submitted && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          All requirements met — well done!
        </div>
      )}

      {isComplete && live && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          All requirements met. Submit to save your progress.
        </div>
      )}

      {failed.length > 0 && onSelectFinding && (
        <p className="mb-3 text-xs text-slate-600">
          Click a finding to preview the expected expression in the editor.
        </p>
      )}

      {submitted && failed.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
            Still missing ({failed.length})
          </p>
          <ul className="mt-2 space-y-1.5">
            {failed.map((finding, i) => {
              const path = finding.fieldPath ?? "";
              const line = highlightByPath[path];
              return (
                <li key={`missing-${finding.ruleId}-${i}`}>
                  <button
                    type="button"
                    onClick={() => onSelectFinding?.(path)}
                    disabled={!path}
                    className={`flex w-full items-start gap-2 rounded-md px-1 py-1 text-left text-sm text-red-200 transition hover:bg-red-500/10 disabled:cursor-default ${
                      activeFindingPath === path ? "bg-red-500/15 ring-1 ring-red-400/40" : ""
                    }`}
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                    <span>
                      {finding.message}
                      {path && (
                        <span className="mt-0.5 block break-all font-mono text-xs text-red-400/70">
                          {path}
                          {line ? ` · line ${line}` : ""}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {highlightedLines.length > 0 && (
            <p className="mt-2 text-xs text-red-300/70">
              Highlighted in editor: line{highlightedLines.length > 1 ? "s" : ""}{" "}
              {highlightedLines.join(", ")}
            </p>
          )}
        </div>
      )}

      <ul className="space-y-2">
        {orderedFindings.map((finding, i) => {
          const path = finding.fieldPath ?? "";
          const clickable = !finding.passed && Boolean(path) && Boolean(onSelectFinding);
          const content = (
            <>
              <div className="flex items-start gap-2">
                {finding.passed ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      finding.severity === "error" ? "text-red-400" : "text-amber-400"
                    }`}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className={finding.passed ? "text-emerald-200/90" : "text-slate-200"}>
                    {finding.message}
                  </p>
                  {!finding.passed && finding.explanation && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {finding.explanation}
                    </p>
                  )}
                  {!finding.passed && finding.recommendation && (
                    <p className="mt-1 text-xs text-sky-400/80">{finding.recommendation}</p>
                  )}
                  {clickable && highlightByPath[path] && (
                    <p className="mt-1 font-mono text-xs text-slate-600">
                      line {highlightByPath[path]}
                    </p>
                  )}
                </div>
              </div>
            </>
          );

          return (
            <li key={`${finding.ruleId}-${finding.fieldPath}-${i}`}>
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onSelectFinding?.(path)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition hover:brightness-110 ${
                    finding.severity === "error"
                      ? "border-red-500/20 bg-red-500/5"
                      : "border-amber-500/20 bg-amber-500/5"
                  } ${activeFindingPath === path ? "ring-1 ring-sky-400/50" : ""}`}
                >
                  {content}
                </button>
              ) : (
                <div
                  className={`rounded-lg border px-3 py-2.5 text-sm ${
                    finding.passed
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : finding.severity === "error"
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-amber-500/20 bg-amber-500/5"
                  }`}
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
