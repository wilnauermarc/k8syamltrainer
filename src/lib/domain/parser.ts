import { parseAllDocuments } from "yaml";

import type { K8sObject, Manifest } from "./types";

export class YamlParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "YamlParseError";
  }
}

export function parseManifest(rawYaml: string): Manifest {
  if (!rawYaml.trim()) {
    return { rawYaml, documents: [], objects: [] };
  }

  let docs;
  try {
    docs = parseAllDocuments(rawYaml, { strict: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new YamlParseError(`YAML syntax error: ${msg}`);
  }

  const parsedDocs: Record<string, unknown>[] = [];
  const objects: K8sObject[] = [];

  for (const doc of docs) {
    if (doc.errors.length > 0) {
      throw new YamlParseError(doc.errors[0]?.message ?? "YAML parse error");
    }
    const json = doc.toJSON();
    if (json == null) continue;
    if (typeof json !== "object" || Array.isArray(json)) {
      throw new YamlParseError("Each YAML document must be a mapping");
    }

    const record = json as Record<string, unknown>;
    parsedDocs.push(record);

    if (typeof record.kind === "string") {
      objects.push({
        apiVersion: String(record.apiVersion ?? ""),
        kind: record.kind,
        metadata: (record.metadata as Record<string, unknown>) ?? {},
        spec: (record.spec as Record<string, unknown>) ?? {},
        raw: record,
      });
    }
  }

  return { rawYaml, documents: parsedDocs, objects };
}
