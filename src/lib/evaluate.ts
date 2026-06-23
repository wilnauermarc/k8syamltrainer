import { evaluateBestPractices } from "./domain/best-practices";
import { YamlParseError, parseManifest } from "./domain/parser";
import { computeScore } from "./domain/scoring";
import type { Exercise, ScoreReport } from "./domain/types";
import {
  validateExpectedValues,
  validateKinds,
  validateMultiDocument,
  validateRequiredFields,
  validateSyntaxError,
} from "./domain/validators";

export interface EvaluationResult {
  scoreReport: ScoreReport;
  parseError: string | null;
  isEmpty: boolean;
}

export function evaluateYaml(yaml: string, exercise: Exercise): EvaluationResult {
  if (!yaml.trim()) {
    return {
      scoreReport: emptyReport(),
      parseError: null,
      isEmpty: true,
    };
  }

  let manifest;
  try {
    manifest = parseManifest(yaml);
  } catch (err) {
    const message = err instanceof YamlParseError ? err.message : String(err);
    const findings = validateSyntaxError(message);
    return {
      scoreReport: computeScore(findings, exercise.scoringWeights),
      parseError: message,
      isEmpty: false,
    };
  }

  const findings = [
    ...validateKinds(manifest, exercise.expectedKinds),
    ...validateRequiredFields(manifest, exercise.requirements.requiredFields),
    ...validateExpectedValues(manifest, exercise.requirements.expectedValues),
    ...validateMultiDocument(manifest, exercise.requirements.multiDocument ?? false),
    ...evaluateBestPractices(manifest, exercise.requirements.requiredBestPractices),
  ];

  return {
    scoreReport: computeScore(findings, exercise.scoringWeights),
    parseError: null,
    isEmpty: false,
  };
}

export function isExerciseComplete(result: EvaluationResult): boolean {
  if (result.isEmpty || result.parseError) return false;
  return !result.scoreReport.findings.some(
    (f) => !f.passed && f.severity !== "hint" && f.severity !== "info",
  );
}

export function getFailedFieldPaths(report: ScoreReport): string[] {
  const paths: string[] = [];
  for (const finding of report.findings) {
    if (finding.passed || finding.severity === "hint" || finding.severity === "info") {
      continue;
    }
    if (finding.fieldPath && !paths.includes(finding.fieldPath)) {
      paths.push(finding.fieldPath);
    }
  }
  return paths;
}

function emptyReport(): ScoreReport {
  return {
    totalScore: 0,
    maxScore: 10,
    categoryScores: {
      correctness: 0,
      completeness: 0,
      best_practice: 0,
      interview_readiness: 0,
    },
    findings: [],
    missingItems: [],
    strengths: [],
    weakAreas: [],
  };
}
