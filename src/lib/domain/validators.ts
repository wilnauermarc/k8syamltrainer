import { resolveInManifest, valuesMatch } from "./path-resolver";
import type {
  Exercise,
  FieldRequirement,
  K8sKind,
  Manifest,
  ValidationFinding,
  ValueRequirement,
} from "./types";

export function validateSyntaxError(message: string): ValidationFinding[] {
  return [
    {
      ruleId: "yaml_syntax",
      category: "correctness",
      severity: "error",
      message: `YAML syntax error: ${message}`,
      passed: false,
      explanation: "Fix syntax before Kubernetes validation can run.",
    },
  ];
}

export function validateKinds(manifest: Manifest, expectedKinds: K8sKind[]): ValidationFinding[] {
  const found = new Set(manifest.objects.map((o) => o.kind));
  return expectedKinds.map((expected) => {
    const passed = found.has(expected);
    return {
      ruleId: "kind_check",
      category: "correctness",
      severity: passed ? "info" : "error",
      message: passed ? `kind is ${expected}` : `missing kind ${expected}`,
      passed,
      explanation: passed ? undefined : `A valid manifest must include a ${expected} resource.`,
      recommendation: passed ? undefined : `Add a ${expected} object to your YAML.`,
      fieldPath: "kind",
    };
  });
}

export function validateRequiredFields(
  manifest: Manifest,
  requirements: FieldRequirement[],
): ValidationFinding[] {
  return requirements.map((req) => {
    const actual = resolveInManifest(manifest.documents, req.path);
    const passed = valuesMatch(actual, req.value);
    const label = req.description ?? req.path;
    return {
      ruleId: "required_field",
      category: "correctness",
      severity: passed ? "info" : "error",
      message: passed ? `${label} is correct` : `${label} is incorrect or missing`,
      passed,
      explanation: passed
        ? undefined
        : `Expected ${req.path} to be ${JSON.stringify(req.value)}, got ${JSON.stringify(actual)}.`,
      recommendation: passed ? undefined : `Set ${req.path} to ${JSON.stringify(req.value)}.`,
      fieldPath: req.path,
    };
  });
}

export function validateExpectedValues(
  manifest: Manifest,
  requirements: ValueRequirement[],
): ValidationFinding[] {
  return requirements.map((req) => {
    const actual = resolveInManifest(manifest.documents, req.path);
    let passed = false;
    let expectedRepr = "";

    if (req.equals !== undefined) {
      passed = valuesMatch(actual, req.equals);
      expectedRepr = JSON.stringify(req.equals);
    } else if (req.contains !== undefined) {
      passed = typeof actual === "string" && actual.includes(req.contains);
      expectedRepr = `contains ${JSON.stringify(req.contains)}`;
    }

    const label = req.description ?? req.path;
    return {
      ruleId: "expected_value",
      category: "completeness",
      severity: passed ? "info" : "error",
      message: passed ? `${label} matches expected value` : `${label} does not match`,
      passed,
      explanation: passed
        ? undefined
        : `Expected ${req.path} ${expectedRepr}, got ${JSON.stringify(actual)}.`,
      fieldPath: req.path,
    };
  });
}

export function validateMultiDocument(
  manifest: Manifest,
  required: boolean,
): ValidationFinding[] {
  if (!required) return [];
  const passed = manifest.documents.length > 1;
  return [
    {
      ruleId: "multi_document",
      category: "interview_readiness",
      severity: passed ? "info" : "error",
      message: passed ? "multiple documents provided" : "expected multiple YAML documents",
      passed,
      explanation: "Interview scenarios often require separate manifests separated by ---.",
      recommendation: "Separate resources with --- document separators.",
    },
  ];
}
