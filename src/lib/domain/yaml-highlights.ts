import type { Severity, ValidationFinding } from "./types";

export interface YamlHighlight {
  from: number;
  to: number;
  line: number;
  message: string;
  severity: "error" | "warning";
  fieldPath: string;
  missing: boolean;
}

interface PathSegment {
  key: string;
  index?: number;
}

interface LineInfo {
  text: string;
  from: number;
  to: number;
  indent: number;
  line: number;
}

function parsePathSegments(path: string): PathSegment[] {
  const segments: PathSegment[] = [];
  for (const part of path.split(".")) {
    const match = part.match(/^(\w+)\[(\d+)\]$/);
    if (match) {
      segments.push({ key: match[1], index: Number(match[2]) });
    } else if (part) {
      segments.push({ key: part });
    }
  }
  return segments;
}

function getLines(yaml: string): LineInfo[] {
  const lines = yaml.split("\n");
  let offset = 0;
  return lines.map((text, i) => {
    const info: LineInfo = {
      text,
      from: offset,
      to: offset + text.length,
      indent: text.match(/^(\s*)/)?.[1].length ?? 0,
      line: i + 1,
    };
    offset += text.length + 1;
    return info;
  });
}

function keyLinePattern(key: string): RegExp {
  return new RegExp(`^(\\s*-?\\s*)${key}\\s*:`);
}

function findListItemLine(
  lines: LineInfo[],
  fromIndex: number,
  parentIndent: number,
  itemIndex: number,
): number | null {
  let count = -1;
  for (let i = fromIndex; i < lines.length; i++) {
    const line = lines[i];
    if (line.indent <= parentIndent && i > fromIndex) break;
    if (line.text.trim().startsWith("-")) {
      count++;
      if (count === itemIndex) return i;
    }
  }
  return null;
}

function findLineForPath(
  yaml: string,
  path: string,
): { lineIndex: number; missing: boolean } | null {
  if (!path || !yaml.trim()) return null;

  const lines = getLines(yaml);
  const segments = parsePathSegments(path);
  if (segments.length === 0) return null;

  let searchFrom = 0;
  let parentIndent = -1;

  for (let s = 0; s < segments.length; s++) {
    const segment = segments[s];
    const isLast = s === segments.length - 1;

    let foundIndex: number | null = null;
    for (let i = searchFrom; i < lines.length; i++) {
      const line = lines[i];
      if (parentIndent >= 0 && line.indent <= parentIndent && i > searchFrom) break;
      if (keyLinePattern(segment.key).test(line.text)) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex === null) {
      if (s === 0) return null;
      return { lineIndex: searchFrom, missing: true };
    }

    if (segment.index !== undefined) {
      const listLine = findListItemLine(
        lines,
        foundIndex + 1,
        lines[foundIndex].indent,
        segment.index,
      );
      if (listLine === null) {
        return { lineIndex: foundIndex, missing: true };
      }
      searchFrom = listLine;
      parentIndent = lines[foundIndex].indent;
      continue;
    }

    if (isLast) {
      const line = lines[foundIndex];
      const value = line.text.split(":").slice(1).join(":").trim();
      const empty = value === "" || value === '""' || value === "''";
      return { lineIndex: foundIndex, missing: empty };
    }

    searchFrom = foundIndex;
    parentIndent = lines[foundIndex].indent;
  }

  return null;
}

function findByContainerField(
  yaml: string,
  containerName: string,
  fieldKey: string,
): { lineIndex: number; missing: boolean } | null {
  const lines = getLines(yaml);
  const nameLine = lines.findIndex(
    (l) =>
      new RegExp(`^\\s*-?\\s*name:\\s*${containerName}\\s*$`).test(l.text) ||
      new RegExp(`^\\s*name:\\s*${containerName}\\s*$`).test(l.text),
  );
  if (nameLine < 0) return null;

  const fieldLine = lines.findIndex(
    (l, i) => i > nameLine && keyLinePattern(fieldKey).test(l.text),
  );
  if (fieldLine >= 0) {
    const value = lines[fieldLine].text.split(":").slice(1).join(":").trim();
    return { lineIndex: fieldLine, missing: value === "" };
  }
  return { lineIndex: nameLine, missing: true };
}

function findByLeafKey(
  yaml: string,
  path: string,
): { lineIndex: number; missing: boolean } | null {
  const segments = parsePathSegments(path);
  if (segments.length === 0) return null;

  const lines = getLines(yaml);
  const leafKey = segments[segments.length - 1].key;
  const parentKeys = segments.slice(0, -1).map((s) => s.key);

  const leafMatches = lines
    .map((l, i) => ({ line: l, index: i }))
    .filter(({ line }) => keyLinePattern(leafKey).test(line.text));

  if (leafMatches.length === 1) {
    const { line, index } = leafMatches[0];
    const value = line.text.split(":").slice(1).join(":").trim();
    return { lineIndex: index, missing: value === "" };
  }

  if (leafMatches.length > 1) {
    for (const parentKey of [...parentKeys].reverse()) {
      const parentIdx = lines.findIndex((l) => keyLinePattern(parentKey).test(l.text));
      if (parentIdx < 0) continue;
      const parentIndent = lines[parentIdx].indent;
      const candidate = leafMatches.find(({ line }) => line.indent > parentIndent);
      if (candidate) {
        const value = candidate.line.text.split(":").slice(1).join(":").trim();
        return { lineIndex: candidate.index, missing: value === "" };
      }
    }
    return { lineIndex: leafMatches[0].index, missing: true };
  }

  for (const parentKey of [...parentKeys].reverse()) {
    const parentIdx = lines.findIndex((l) => keyLinePattern(parentKey).test(l.text));
    if (parentIdx >= 0) return { lineIndex: parentIdx, missing: true };
  }

  const anchors = ["spec", "metadata", "template", "containers", "kind"];
  for (const anchor of anchors) {
    const idx = lines.findIndex((l) => keyLinePattern(anchor).test(l.text));
    if (idx >= 0) return { lineIndex: idx, missing: true };
  }

  return lines.length > 0 ? { lineIndex: 0, missing: true } : null;
}

function severityLevel(severity: Severity): "error" | "warning" {
  return severity === "error" ? "error" : "warning";
}

export function computeHighlights(
  yaml: string,
  findings: ValidationFinding[],
): YamlHighlight[] {
  const failed = findings.filter(
    (f) => !f.passed && f.severity !== "hint" && f.severity !== "info",
  );
  const highlights: YamlHighlight[] = [];
  const seen = new Set<string>();

  for (const finding of failed) {
    const path = finding.fieldPath ?? "";
    let located: { lineIndex: number; missing: boolean } | null = null;

    if (path) {
      located = findLineForPath(yaml, path);
    }

    if (!located && path) {
      const containerMatch = path.match(/^containers\[([^\]]+)\]\.(.+)$/);
      if (containerMatch) {
        located = findByContainerField(yaml, containerMatch[1], containerMatch[2]);
      }
    }

    if (!located && path) {
      const segments = parsePathSegments(path);
      if (segments.length > 1) {
        const parentPath = segments
          .slice(0, -1)
          .map((s) => (s.index !== undefined ? `${s.key}[${s.index}]` : s.key))
          .join(".");
        located = findLineForPath(yaml, parentPath);
        if (located) located = { ...located, missing: true };
      }
    }

    if (!located && path) {
      located = findByLeafKey(yaml, path);
    }

    if (!located && finding.ruleId === "kind_check") {
      const lines = getLines(yaml);
      const kindLine = lines.findIndex((l) => keyLinePattern("kind").test(l.text));
      located =
        kindLine >= 0 ? { lineIndex: kindLine, missing: false } : { lineIndex: 0, missing: true };
    }

    if (!located) continue;

    const lines = getLines(yaml);
    const lineInfo = lines[located.lineIndex];
    if (!lineInfo) continue;

    const key = `${lineInfo.line}:${finding.ruleId}:${path}`;
    if (seen.has(key)) continue;
    seen.add(key);

    highlights.push({
      from: lineInfo.from,
      to: lineInfo.to,
      line: lineInfo.line,
      message: finding.message,
      severity: severityLevel(finding.severity),
      fieldPath: path,
      missing: located.missing,
    });
  }

  return highlights.sort((a, b) => a.line - b.line);
}

export function getMissingFindings(findings: ValidationFinding[]): ValidationFinding[] {
  return findings.filter((f) => !f.passed && f.severity !== "hint" && f.severity !== "info");
}

export function findHighlightForPath(
  yaml: string,
  path: string,
  findings: ValidationFinding[],
): YamlHighlight | undefined {
  return computeHighlights(
    yaml,
    findings.filter((f) => f.fieldPath === path),
  )[0];
}
