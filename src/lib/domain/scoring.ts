import type { FindingCategory, ScoreReport, ScoringWeights, Severity, ValidationFinding } from "./types";

const SEVERITY_DEDUCTIONS: Record<Severity, number> = {
  error: 2.0,
  warning: 1.0,
  info: 0.25,
  hint: 0.0,
};

const MAX_CATEGORY_POINTS = 10.0;

const CATEGORIES: FindingCategory[] = [
  "correctness",
  "completeness",
  "best_practice",
  "interview_readiness",
];

export function computeScore(
  findings: ValidationFinding[],
  weights: ScoringWeights | Record<string, number>,
  maxScore = 10,
): ScoreReport {
  const categoryFindings = Object.fromEntries(
    CATEGORIES.map((c) => [c, findings.filter((f) => f.category === c)]),
  ) as Record<FindingCategory, ValidationFinding[]>;

  const categoryScores = {} as Record<FindingCategory, number>;
  for (const category of CATEGORIES) {
    const deductions = categoryFindings[category]
      .filter((f) => !f.passed)
      .reduce((sum, f) => sum + SEVERITY_DEDUCTIONS[f.severity], 0);
    categoryScores[category] = Math.max(0, MAX_CATEGORY_POINTS - deductions);
  }

  const weightedTotal = CATEGORIES.reduce(
    (sum, cat) => sum + categoryScores[cat] * (weights[cat] ?? 0),
    0,
  );
  const totalScore = Math.round(Math.min(weightedTotal, maxScore) * 10) / 10;

  const missingItems = findings
    .filter((f) => !f.passed && f.severity !== "hint")
    .map((f) => f.message);

  const strengths = findings
    .filter((f) => f.passed && f.severity !== "hint")
    .map((f) => f.message);

  const weakAreas = [
    ...new Set(
      findings
        .filter((f) => !f.passed && f.category === "best_practice")
        .map((f) => f.ruleId),
    ),
  ];

  return {
    totalScore,
    maxScore,
    categoryScores,
    findings,
    missingItems,
    strengths,
    weakAreas,
  };
}
