export type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

function tokenizePath(path: string): (string | number)[] {
  const tokens: (string | number)[] = [];
  for (const part of path.split(".")) {
    const bracket = part.match(/^(\w+)\[(\d+)\]$/);
    if (bracket) {
      tokens.push(bracket[1], Number(bracket[2]));
    } else if (/^\[\d+\]$/.test(part)) {
      tokens.push(Number(part.slice(1, -1)));
    } else {
      tokens.push(part);
    }
  }
  return tokens;
}

export function resolvePath(data: JsonValue, path: string): unknown {
  const tokens = tokenizePath(path);
  let current: unknown = data;

  for (const token of tokens) {
    if (current == null) return undefined;
    if (typeof token === "number") {
      if (!Array.isArray(current) || token >= current.length) return undefined;
      current = current[token];
    } else if (typeof current === "object" && !Array.isArray(current)) {
      current = (current as Record<string, unknown>)[token];
    } else {
      return undefined;
    }
  }
  return current;
}

export function resolveInManifest(
  documents: Record<string, unknown>[],
  path: string,
): unknown {
  for (const doc of documents) {
    const value = resolvePath(doc, path);
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

export function getContainers(documents: Record<string, unknown>[]): Record<string, unknown>[] {
  const containers: Record<string, unknown>[] = [];

  for (const doc of documents) {
    const kind = doc.kind as string | undefined;
    if (kind === "Pod") {
      const spec = doc.spec as Record<string, unknown> | undefined;
      if (spec?.containers) containers.push(...asContainerList(spec.containers));
    } else if (
      ["Deployment", "StatefulSet", "DaemonSet", "Job", "CronJob"].includes(kind ?? "")
    ) {
      const template = resolvePath(doc, "spec.template.spec") as Record<string, unknown> | undefined;
      if (template?.containers) containers.push(...asContainerList(template.containers));
    }
  }
  return containers;
}

function asContainerList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null);
}

export function valuesMatch(actual: unknown, expected: unknown): boolean {
  if (actual === undefined || actual === null) return false;
  if (typeof expected === "number") {
    if (typeof actual === "number") return actual === expected;
    if (typeof actual === "string" && actual.trim() !== "" && !Number.isNaN(Number(actual))) {
      return Number(actual) === expected;
    }
    return false;
  }
  if (typeof expected === "string") return String(actual) === expected;
  return actual === expected;
}
