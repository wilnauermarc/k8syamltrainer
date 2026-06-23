export type Difficulty = "beginner" | "intermediate" | "advanced";
export type TrainingMode = "train" | "review" | "interview" | "wizard";
export type K8sKind =
  | "Pod"
  | "Deployment"
  | "Service"
  | "ConfigMap"
  | "Secret"
  | "Ingress"
  | "PersistentVolumeClaim"
  | "Job"
  | "CronJob"
  | "StatefulSet"
  | "NetworkPolicy"
  | "HorizontalPodAutoscaler"
  | "PodDisruptionBudget";

export type FindingCategory =
  | "correctness"
  | "completeness"
  | "best_practice"
  | "interview_readiness";

export type Severity = "error" | "warning" | "info" | "hint";

export interface FieldRequirement {
  path: string;
  value?: string | number | boolean | null;
  description?: string;
}

export interface ValueRequirement {
  path: string;
  equals?: string | number | boolean | null;
  contains?: string;
  description?: string;
}

export interface ExerciseRequirements {
  requiredFields: FieldRequirement[];
  expectedValues: ValueRequirement[];
  requiredBestPractices: string[];
  multiDocument?: boolean;
}

export interface ScoringWeights {
  correctness: number;
  completeness: number;
  best_practice: number;
  interview_readiness: number;
}

export interface ReviewFinding {
  id: string;
  label: string;
  keywords: string[];
  explanation: string;
  recommendation?: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  mode: TrainingMode;
  difficulty: Difficulty;
  expectedKinds: K8sKind[];
  requirements: ExerciseRequirements;
  scoringWeights: ScoringWeights;
  hints: string[];
  learningObjectives: string[];
  tags: string[];
  /** Canonical solution for train mode; empty for review-only exercises. */
  solutionYaml: string;
  /** Broken manifest shown in review mode. */
  brokenManifest?: string;
  /** Issues the user should identify in review mode. */
  reviewFindings?: ReviewFinding[];
}

export interface K8sObject {
  apiVersion: string;
  kind: string;
  metadata: Record<string, unknown>;
  spec: Record<string, unknown>;
  raw: Record<string, unknown>;
}

export interface Manifest {
  rawYaml: string;
  documents: Record<string, unknown>[];
  objects: K8sObject[];
}

export interface ValidationFinding {
  ruleId: string;
  category: FindingCategory;
  severity: Severity;
  message: string;
  passed: boolean;
  explanation?: string;
  recommendation?: string;
  fieldPath?: string;
}

export interface ScoreReport {
  totalScore: number;
  maxScore: number;
  categoryScores: Record<FindingCategory, number>;
  findings: ValidationFinding[];
  missingItems: string[];
  strengths: string[];
  weakAreas: string[];
}

export interface AttemptRecord {
  id: string;
  exerciseId: string;
  mode: TrainingMode;
  difficulty: Difficulty;
  score: number;
  maxScore: number;
  completedAt: string;
}

export interface UserProgress {
  attempts: AttemptRecord[];
  streak: { current: number; longest: number; lastActivityDate?: string };
  weaknesses: Record<string, number>;
}
