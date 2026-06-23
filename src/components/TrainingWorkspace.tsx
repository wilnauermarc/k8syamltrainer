"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, HelpCircle, RotateCcw, Sparkles } from "lucide-react";

import { HintPauseControl } from "@/components/HintPauseControl";
import { ExercisePanel } from "@/components/ExercisePanel";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import type { YamlEditorHandle } from "@/components/YamlEditor";
import { evaluateYaml, getFailedFieldPaths, isExerciseComplete } from "@/lib/evaluate";
import { celebrateSuccess } from "@/lib/celebrate";
import type { Exercise } from "@/lib/domain/types";
import {
  applyGhostHint,
  describeGhostHint,
  getGhostHintForFieldPath,
  getNextGhostHint,
  type GhostHint,
} from "@/lib/domain/next-hint";
import { computeHighlights, type YamlHighlight } from "@/lib/domain/yaml-highlights";
import { saveAttempt } from "@/lib/storage/progress";
import { DEFAULT_HINT_PAUSE_MS, loadSettings } from "@/lib/storage/settings";

const YamlEditor = dynamic(
  () => import("@/components/YamlEditor").then((m) => m.YamlEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-slate-700/80 bg-[#0d1117] text-sm text-slate-500">
        Loading editor…
      </div>
    ),
  },
);

const STARTER_TEMPLATES: Record<string, string> = {
  Deployment: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: 
spec:
  replicas: 
  selector:
    matchLabels:
      app: 
  template:
    metadata:
      labels:
        app: 
    spec:
      containers:
        - name: 
          image: 
          ports:
            - containerPort: 
`,
  Pod: `apiVersion: v1
kind: Pod
metadata:
  name: 
spec:
  containers:
    - name: 
      image: 
`,
  Service: `apiVersion: v1
kind: Service
metadata:
  name: 
spec:
  type: ClusterIP
  selector:
    app: 
  ports:
    - port: 
      targetPort: 
`,
  ConfigMap: `apiVersion: v1
kind: ConfigMap
metadata:
  name: 
data:
  LOG_LEVEL: 
`,
  Secret: `apiVersion: v1
kind: Secret
metadata:
  name: 
type: Opaque
stringData:
  password: 
`,
  Job: `apiVersion: batch/v1
kind: Job
metadata:
  name: 
spec:
  completions: 1
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: 
          image: 
`,
  Ingress: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: 
spec:
  rules:
    - host: 
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: 
                port:
                  number: 
`,
  PersistentVolumeClaim: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: 
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 
`,
  StatefulSet: `apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: 
spec:
  serviceName: 
  replicas: 
  selector:
    matchLabels:
      app: 
  template:
    metadata:
      labels:
        app: 
    spec:
      containers:
        - name: 
          image: 
          ports:
            - containerPort: 
`,
  CronJob: `apiVersion: batch/v1
kind: CronJob
metadata:
  name: 
spec:
  schedule: 
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: 
              image: 
`,
};

const GHOST_HINT_VISIBLE_MS = 1500;
const FINDING_PEEK_MS = 1200;
const SUCCESS_ADVANCE_MS = 1800;

interface TrainingWorkspaceProps {
  exercises: Exercise[];
  initialExerciseId?: string;
}

export function TrainingWorkspace({ exercises, initialExerciseId }: TrainingWorkspaceProps) {
  const initialIndex = Math.max(
    0,
    exercises.findIndex((e) => e.id === initialExerciseId),
  );

  const [index, setIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [yaml, setYaml] = useState("");
  const [debouncedYaml, setDebouncedYaml] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitHighlights, setSubmitHighlights] = useState<YamlHighlight[]>([]);
  const [activeHighlightLine, setActiveHighlightLine] = useState<number | null>(null);
  const [activeFindingPath, setActiveFindingPath] = useState<string | null>(null);
  const [ghostHint, setGhostHint] = useState<GhostHint | null>(null);
  const [helpMessage, setHelpMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hintPauseMs, setHintPauseMs] = useState(DEFAULT_HINT_PAUSE_MS);
  const editorRef = useRef<YamlEditorHandle>(null);
  const findingGhostTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setHintPauseMs(loadSettings().hintPauseMs);
  }, []);

  const exercise = exercises[index];

  const starterYaml = useMemo(() => {
    const kind = exercise.expectedKinds[0];
    return STARTER_TEMPLATES[kind] ?? "apiVersion: v1\nkind: \nmetadata:\n  name: \n";
  }, [exercise]);

  useEffect(() => {
    setYaml("");
    setDebouncedYaml("");
    setSubmitted(false);
    setShowHints(false);
    setSubmitHighlights([]);
    setActiveHighlightLine(null);
    setActiveFindingPath(null);
    setGhostHint(null);
    setHelpMessage(null);
    setSuccessMessage(null);
    if (findingGhostTimerRef.current) clearTimeout(findingGhostTimerRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, [exercise.id]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedYaml(yaml), 350);
    return () => clearTimeout(timer);
  }, [yaml]);

  const liveResult = useMemo(
    () => evaluateYaml(debouncedYaml, exercise),
    [debouncedYaml, exercise],
  );

  useEffect(() => {
    setGhostHint(null);
    if (submitted || !yaml.trim() || hintPauseMs <= 0) return;

    const preview = evaluateYaml(yaml, exercise);
    if (isExerciseComplete(preview)) return;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const idleTimer = setTimeout(() => {
      const result = evaluateYaml(yaml, exercise);
      if (result.parseError || isExerciseComplete(result)) return;

      const paths = getFailedFieldPaths(result.scoreReport);
      const hint = getNextGhostHint(yaml, exercise.solutionYaml, paths);
      if (!hint) return;

      setGhostHint(hint);
      hideTimer = setTimeout(() => setGhostHint(null), GHOST_HINT_VISIBLE_MS);
    }, hintPauseMs);

    return () => {
      clearTimeout(idleTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [yaml, exercise, submitted, hintPauseMs]);

  const handleYamlChange = useCallback(
    (value: string) => {
      setYaml(value);
      setGhostHint(null);
      setActiveFindingPath(null);
      if (findingGhostTimerRef.current) clearTimeout(findingGhostTimerRef.current);
      if (submitted) {
        setSubmitted(false);
        setSubmitHighlights([]);
        setActiveHighlightLine(null);
      }
    },
    [submitted],
  );

  const handleHelp = useCallback(() => {
    if (submitted) return;

    const result = evaluateYaml(yaml, exercise);
    if (result.parseError) {
      setHelpMessage("Fix YAML syntax errors first.");
      return;
    }

    if (isExerciseComplete(result)) {
      setHelpMessage("Exercise complete — submit to save your progress.");
      return;
    }

    const paths = getFailedFieldPaths(result.scoreReport);
    const hint = getNextGhostHint(yaml, exercise.solutionYaml, paths);
    if (!hint) {
      setHelpMessage("Nothing to fix here — keep going or submit.");
      return;
    }

    handleYamlChange(applyGhostHint(yaml, hint));
    setHelpMessage(describeGhostHint(hint));
  }, [yaml, exercise, submitted, handleYamlChange]);

  useEffect(() => {
    if (!helpMessage) return;
    const timer = setTimeout(() => setHelpMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [helpMessage]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "F1") return;
      e.preventDefault();
      handleHelp();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleHelp]);

  const handleSubmit = useCallback(() => {
    const result = evaluateYaml(yaml, exercise);
    const complete = isExerciseComplete(result);
    const failed = result.scoreReport.findings.filter(
      (f) => !f.passed && f.severity !== "hint" && f.severity !== "info",
    );
    const highlights = computeHighlights(yaml, failed);
    setSubmitHighlights(highlights);
    setActiveHighlightLine(highlights[0]?.line ?? null);
    setSubmitted(true);
    saveAttempt(
      {
        id: crypto.randomUUID(),
        exerciseId: exercise.id,
        mode: exercise.mode,
        difficulty: exercise.difficulty,
        score: result.scoreReport.totalScore,
        maxScore: result.scoreReport.maxScore,
        completedAt: new Date().toISOString(),
      },
      result.scoreReport.weakAreas,
    );

    if (complete) {
      celebrateSuccess();
      const hasNext = index < exercises.length - 1;
      setSuccessMessage(
        hasNext ? "Perfect! Next exercise…" : "All exercises complete — great work!",
      );
      if (hasNext) {
        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(() => {
          setIndex((i) => i + 1);
          advanceTimerRef.current = undefined;
        }, SUCCESS_ADVANCE_MS);
      }
    } else {
      setSuccessMessage(null);
    }
  }, [yaml, exercise, index, exercises.length]);

  const handleNext = () => {
    if (index < exercises.length - 1) setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const displayResult = submitted ? evaluateYaml(yaml, exercise) : liveResult;
  const isComplete = isExerciseComplete(displayResult);

  const highlightByPath = useMemo(() => {
    const failed = displayResult.scoreReport.findings.filter(
      (f) => !f.passed && f.severity !== "hint" && f.severity !== "info",
    );
    return Object.fromEntries(computeHighlights(yaml, failed).map((h) => [h.fieldPath, h.line]));
  }, [yaml, displayResult]);

  const handleSelectFinding = useCallback(
    (fieldPath: string) => {
      if (!fieldPath) return;

      const hint = getGhostHintForFieldPath(yaml, exercise.solutionYaml, fieldPath);
      if (!hint) return;

      setGhostHint(hint);
      setActiveFindingPath(fieldPath);
      editorRef.current?.scrollToPosition(hint.position);

      if (findingGhostTimerRef.current) clearTimeout(findingGhostTimerRef.current);
      findingGhostTimerRef.current = setTimeout(() => {
        setGhostHint(null);
        setActiveFindingPath(null);
        findingGhostTimerRef.current = undefined;
      }, FINDING_PEEK_MS);
    },
    [yaml, exercise.solutionYaml],
  );

  useEffect(() => {
    return () => {
      if (findingGhostTimerRef.current) clearTimeout(findingGhostTimerRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={index === 0}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm text-slate-400">
            Exercise {index + 1} of {exercises.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={index === exercises.length - 1}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <HintPauseControl valueMs={hintPauseMs} onChange={setHintPauseMs} />
          <button
            type="button"
            onClick={handleHelp}
            disabled={submitted || !yaml.trim()}
            title="Fix current expression (indent, value, or key) — F1"
            className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20 disabled:opacity-40"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Help
          </button>
          <button
            type="button"
            onClick={() => setYaml(starterYaml)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-sky-600 hover:text-sky-300"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Scaffold
          </button>
          <button
            type="button"
            onClick={() => {
              setYaml("");
              setSubmitted(false);
              setSubmitHighlights([]);
              setActiveHighlightLine(null);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!yaml.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500 disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
            Submit
          </button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <div className="hidden border-r border-slate-800 bg-slate-950/50 lg:block">
          <ExercisePanel
            exercise={exercise}
            showHints={showHints}
            onToggleHints={() => setShowHints(!showHints)}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden p-4">
          <div className="mb-2 flex items-center justify-between lg:hidden">
            <h2 className="text-sm font-medium text-slate-200">{exercise.title}</h2>
          </div>
          <div className="min-h-0 flex-1">
            <YamlEditor
              ref={editorRef}
              value={yaml}
              onChange={handleYamlChange}
              highlights={submitted ? submitHighlights : []}
              activeLine={activeHighlightLine}
              ghostHint={ghostHint}
              placeholder="# Type your Kubernetes manifest here…"
            />
          </div>
          <p className="mt-2 text-center text-xs text-slate-600">
            Live validation · Help (F1) fixes indent &amp; values · Adjustable hint pause in toolbar
          </p>
          {helpMessage && (
            <p className="mt-1 text-center text-xs text-violet-300/90" role="status">
              {helpMessage}
            </p>
          )}
          {successMessage && (
            <p className="mt-1 text-center text-xs font-medium text-emerald-400" role="status">
              {successMessage}
            </p>
          )}
        </div>

        <div className="border-l border-slate-800 bg-slate-950/50 lg:min-w-0 lg:overflow-hidden">
          <FeedbackPanel
            report={displayResult.scoreReport}
            isEmpty={displayResult.isEmpty}
            parseError={displayResult.parseError}
            live={!submitted}
            submitted={submitted}
            isComplete={isComplete}
            highlightedLines={submitHighlights.map((h) => h.line)}
            highlightByPath={highlightByPath}
            activeFindingPath={activeFindingPath}
            onSelectFinding={handleSelectFinding}
          />
        </div>
      </div>
    </div>
  );
}
