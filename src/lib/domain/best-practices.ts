import { getContainers } from "./path-resolver";
import type { Manifest, ValidationFinding } from "./types";

type Rule = { id: string; evaluate: (manifest: Manifest) => ValidationFinding[] };

const imageLatest: Rule = {
  id: "image_latest",
  evaluate(manifest) {
    return getContainers(manifest.documents).map((container) => {
      const image = String(container.image ?? "");
      const passed = !(image.endsWith(":latest") || !image.includes(":"));
      return {
        ruleId: "image_latest",
        category: "best_practice" as const,
        severity: passed ? "info" : "warning",
        message: passed ? "image tag is pinned" : `image uses mutable tag: ${image}`,
        passed,
        explanation: "Using :latest or unpinned tags hurts reproducibility.",
        recommendation: "Pin images to a specific version, e.g. nginx:1.27.",
        fieldPath: "spec.template.spec.containers[].image",
      };
    });
  },
};

const readinessProbe: Rule = {
  id: "readiness_probe_present",
  evaluate(manifest) {
    return getContainers(manifest.documents).map((container) => {
      const name = String(container.name ?? "container");
      const passed = "readinessProbe" in container;
      return {
        ruleId: "readiness_probe_present",
        category: "best_practice" as const,
        severity: passed ? "info" : "warning",
        message: passed
          ? `readinessProbe present on ${name}`
          : `readinessProbe missing on ${name}`,
        passed,
        explanation: "Readiness probes prevent traffic from reaching unready pods.",
        recommendation: "Add a readinessProbe (HTTP, TCP, or exec).",
        fieldPath: `containers[${name}].readinessProbe`,
      };
    });
  },
};

const resourceRequests: Rule = {
  id: "resource_requests_present",
  evaluate(manifest) {
    return getContainers(manifest.documents).map((container) => {
      const name = String(container.name ?? "container");
      const resources = container.resources as Record<string, unknown> | undefined;
      const requests = resources?.requests as Record<string, unknown> | undefined;
      const passed = Boolean(requests?.cpu && requests?.memory);
      return {
        ruleId: "resource_requests_present",
        category: "best_practice" as const,
        severity: passed ? "info" : "warning",
        message: passed
          ? `resource requests set on ${name}`
          : `resource requests missing on ${name}`,
        passed,
        explanation: "Requests help scheduling and are required for HPA.",
        recommendation: "Set resources.requests.cpu and resources.requests.memory.",
        fieldPath: `containers[${name}].resources.requests`,
      };
    });
  },
};

const labelSelectorMismatch: Rule = {
  id: "label_selector_mismatch",
  evaluate(manifest) {
    const findings: ValidationFinding[] = [];
    for (const doc of manifest.documents) {
      if (doc.kind !== "Deployment") continue;
      const spec = doc.spec as Record<string, unknown> | undefined;
      if (!spec) continue;
      const selector = spec.selector as Record<string, unknown> | undefined;
      const matchLabels = selector?.matchLabels as Record<string, unknown> | undefined;
      const template = spec.template as Record<string, unknown> | undefined;
      const podLabels = (template?.metadata as Record<string, unknown> | undefined)
        ?.labels as Record<string, unknown> | undefined;
      if (!matchLabels || !podLabels) continue;
      const passed = Object.entries(matchLabels).every(
        ([k, v]) => podLabels[k] === v,
      );
      findings.push({
        ruleId: "label_selector_mismatch",
        category: "correctness",
        severity: passed ? "info" : "error",
        message: passed
          ? "selector matches template labels"
          : "selector/template label mismatch",
        passed,
        explanation: "Deployment selectors must match pod template labels.",
        recommendation: "Ensure spec.selector.matchLabels equals spec.template.metadata.labels.",
        fieldPath: "spec.selector.matchLabels",
      });
    }
    return findings;
  },
};

const ALL_RULES: Rule[] = [
  imageLatest,
  readinessProbe,
  resourceRequests,
  labelSelectorMismatch,
];

export function evaluateBestPractices(
  manifest: Manifest,
  requiredRuleIds: string[] = [],
): ValidationFinding[] {
  if (requiredRuleIds.length === 0) return [];

  const rules = ALL_RULES.filter((r) => requiredRuleIds.includes(r.id));

  const findings: ValidationFinding[] = [];
  const seen = new Set<string>();

  for (const rule of rules) {
    for (const finding of rule.evaluate(manifest)) {
      const key = `${finding.ruleId}:${finding.fieldPath}:${finding.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        findings.push(finding);
      }
    }
  }
  return findings;
}
