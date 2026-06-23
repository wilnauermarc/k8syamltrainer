import { computeScore } from "./domain/scoring";
import type { Exercise, ReviewFinding, ScoreReport, ValidationFinding } from "./domain/types";

export interface ReviewEvaluationResult {
  scoreReport: ScoreReport;
  matched: ReviewFinding[];
  missed: ReviewFinding[];
  isEmpty: boolean;
}

function textMatchesFinding(text: string, finding: ReviewFinding): boolean {
  const lower = text.toLowerCase();
  return finding.keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

export function evaluateReview(
  explanation: string,
  exercise: Exercise,
): ReviewEvaluationResult {
  const expected = exercise.reviewFindings ?? [];

  if (!explanation.trim()) {
    return {
      scoreReport: emptyReviewReport(expected),
      matched: [],
      missed: expected,
      isEmpty: true,
    };
  }

  const matched = expected.filter((f) => textMatchesFinding(explanation, f));
  const missed = expected.filter((f) => !textMatchesFinding(explanation, f));

  const findings: ValidationFinding[] = expected.map((f) => {
    const found = matched.includes(f);
    return {
      ruleId: f.id,
      category: "correctness",
      severity: found ? "info" : "error",
      message: found ? `✓ Identified: ${f.label}` : `✗ Missed: ${f.label}`,
      passed: found,
      explanation: f.explanation,
      recommendation: f.recommendation,
    };
  });

  const scoreReport = computeScore(findings, exercise.scoringWeights);
  scoreReport.weakAreas = missed.map((m) => m.id);

  return { scoreReport, matched, missed, isEmpty: false };
}

function emptyReviewReport(expected: ReviewFinding[]): ScoreReport {
  return {
    totalScore: 0,
    maxScore: 10,
    categoryScores: {
      correctness: 0,
      completeness: 0,
      best_practice: 0,
      interview_readiness: 0,
    },
    findings: expected.map((f) => ({
      ruleId: f.id,
      category: "correctness",
      severity: "error",
      message: `Missed: ${f.label}`,
      passed: false,
      explanation: f.explanation,
      recommendation: f.recommendation,
    })),
    missingItems: expected.map((f) => f.label),
    strengths: [],
    weakAreas: expected.map((f) => f.id),
  };
}
