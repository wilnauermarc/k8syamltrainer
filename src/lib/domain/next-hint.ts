export interface GhostHint {
  text: string;
  /** Shown in the editor widget; defaults to `text`. */
  displayText?: string;
  position: number;
  kind: "value" | "key-line" | "indent";
}

interface LineInfo {
  text: string;
  from: number;
  to: number;
  line: number;
}

interface StructLine {
  path: string;
  key: string;
  value: string;
  indent: number;
  line: LineInfo;
  solutionLineText: string;
}

function getLines(yaml: string): LineInfo[] {
  const lines = yaml.split("\n");
  let offset = 0;
  return lines.map((text, i) => {
    const info = { text, from: offset, to: offset + text.length, line: i + 1 };
    offset += text.length + 1;
    return info;
  });
}

function parseStructLines(yaml: string): StructLine[] {
  const lines = getLines(yaml);
  const stack: { indent: number; key: string }[] = [];
  const result: StructLine[] = [];

  for (const line of lines) {
    const trimmed = line.text.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = line.text.length - line.text.trimStart().length;
    const listMatch = trimmed.match(/^-\s+(.*)$/);
    const content = listMatch ? listMatch[1] : trimmed;
    const keyMatch = content.match(/^([\w.-]+):\s*(.*)$/);
    if (!keyMatch) continue;

    const key = keyMatch[1];
    const value = keyMatch[2].trim();

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const path = [...stack.map((s) => s.key), key].join(".");
    stack.push({ indent, key });

    result.push({
      path,
      key,
      value,
      indent,
      line,
      solutionLineText: line.text,
    });
  }

  return result;
}

function valueInsertPosition(line: LineInfo): number {
  const colonInLine = line.text.indexOf(":");
  if (colonInLine === -1) return line.to;
  let pos = line.from + colonInLine + 1;
  while (pos < line.to && line.text[pos - line.from] === " ") pos++;
  return pos;
}

function yamlScalarText(value: string): string {
  const v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"') && v.length >= 2) ||
    (v.startsWith("'") && v.endsWith("'") && v.length >= 2)
  ) {
    return v.slice(1, -1);
  }
  return v;
}

function valuesMatch(actual: string, expected: string): boolean {
  if (!actual) return false;
  return yamlScalarText(actual) === yamlScalarText(String(expected));
}

function formatHintValue(raw: string): string {
  if (!raw) return raw;
  const trimmed = raw.trim();
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) return raw;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(trimmed)) return raw;
  if (trimmed === "true" || trimmed === "false" || trimmed === "null" || trimmed === "~") {
    return raw;
  }
  if (/^[{[]/.test(trimmed)) return raw;
  const escaped = trimmed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function valueFromSolutionLine(sol: StructLine): string {
  const colon = sol.solutionLineText.indexOf(":");
  if (colon === -1) return formatHintValue(sol.value);
  const raw = sol.solutionLineText.slice(colon + 1).trimStart();
  return formatHintValue(raw);
}

function remainingValueHint(userValue: string, expected: string): string {
  if (!expected) return "";
  if (!userValue) return expected;
  if (expected.startsWith(userValue)) return expected.slice(userValue.length);

  const unquotedExpected = yamlScalarText(expected);
  if (unquotedExpected.startsWith(yamlScalarText(userValue))) {
    const rest = unquotedExpected.slice(yamlScalarText(userValue).length);
    if (expected.startsWith('"')) return `${rest}"`;
    if (expected.startsWith("'")) return `${rest}'`;
    return rest;
  }

  return expected;
}

function visibleIndent(spaces: string): string {
  return spaces.replace(/ /g, "·");
}

function withDisplay(hint: GhostHint): GhostHint {
  if (hint.displayText !== undefined) return hint;
  if (hint.kind === "indent") {
    return { ...hint, displayText: visibleIndent(hint.text) };
  }
  return hint;
}

function findUserLineForPath(
  userLines: StructLine[],
  path: string,
  key: string,
): StructLine | undefined {
  const exact = userLines.find((u) => u.path === path);
  if (exact) return exact;

  const suffix = `.${key}`;
  const candidates = userLines.filter((u) => u.path.endsWith(suffix) || u.path === key);
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) {
    return candidates[0].path === path ? candidates[0] : undefined;
  }

  const pathParts = path.split(".");
  return candidates.find((c) => {
    const cParts = c.path.split(".");
    return pathParts.slice(-2).join(".") === cParts.slice(-2).join(".");
  });
}

function findFirstMissingAncestor(
  sol: StructLine,
  solutionStruct: StructLine[],
  userStruct: StructLine[],
): StructLine | undefined {
  const parts = sol.path.split(".");
  for (let i = 1; i <= parts.length; i++) {
    const ancestorPath = parts.slice(0, i).join(".");
    const ancestorSol = solutionStruct.find((s) => s.path === ancestorPath);
    if (!ancestorSol) continue;
    if (!userStruct.some((u) => u.path === ancestorPath)) {
      return ancestorSol;
    }
  }
  return undefined;
}

function findInsertPosition(
  solutionStruct: StructLine[],
  userStruct: StructLine[],
  sol: StructLine,
  userYaml: string,
): number {
  const solIndex = solutionStruct.indexOf(sol);

  for (let i = solIndex - 1; i >= 0; i--) {
    const prev = solutionStruct[i];
    const userPrev = userStruct.find((u) => u.path === prev.path);
    if (userPrev) return userPrev.line.to;
  }

  const parentPath = sol.path.includes(".") ? sol.path.slice(0, sol.path.lastIndexOf(".")) : null;
  if (parentPath) {
    const parent = userStruct.find((u) => u.path === parentPath);
    if (parent) return parent.line.to;
  }

  return userYaml.length;
}

function getMissingAncestorChain(
  sol: StructLine,
  solutionStruct: StructLine[],
  userStruct: StructLine[],
): StructLine[] {
  const parts = sol.path.split(".");
  const chain: StructLine[] = [];

  for (let i = 1; i <= parts.length; i++) {
    const path = parts.slice(0, i).join(".");
    const ancestor = solutionStruct.find((s) => s.path === path);
    if (!ancestor) continue;
    if (!userStruct.some((u) => u.path === path)) {
      chain.push(ancestor);
    }
  }

  return chain;
}

function hintTextForStructLine(sol: StructLine): string {
  if (sol.solutionLineText.trim().startsWith("-")) {
    return sol.solutionLineText;
  }
  const leading = sol.solutionLineText.match(/^(\s*)/)?.[1] ?? "";
  const value = valueFromSolutionLine(sol);
  return value ? `${leading}${sol.key}: ${value}` : `${leading}${sol.key}:`;
}

function hintForMissingChain(
  chain: StructLine[],
  solutionStruct: StructLine[],
  userStruct: StructLine[],
  userYaml: string,
): GhostHint {
  const first = chain[0];
  return withDisplay({
    text: chain.map(hintTextForStructLine).join("\n"),
    position: findInsertPosition(solutionStruct, userStruct, first, userYaml),
    kind: "key-line",
  });
}
function hintForMissingLine(
  sol: StructLine,
  solutionStruct: StructLine[],
  userStruct: StructLine[],
  userYaml: string,
): GhostHint {
  return withDisplay({
    text: hintTextForStructLine(sol),
    position: findInsertPosition(solutionStruct, userStruct, sol, userYaml),
    kind: "key-line",
  });
}

function findSolutionLineForFieldPath(
  solutionStruct: StructLine[],
  fieldPath: string,
): StructLine | undefined {
  const normalized = fieldPath.replace(/\[[^\]]*\]/g, "");
  const exact = solutionStruct.find((s) => s.path === normalized);
  if (exact) return exact;

  const segments = normalized.split(".").filter(Boolean);
  for (let len = segments.length; len > 0; len--) {
    const suffix = segments.slice(-len).join(".");
    const matches = solutionStruct.filter(
      (s) => s.path === suffix || s.path.endsWith(`.${suffix}`),
    );
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) {
      return matches.sort((a, b) => b.path.length - a.path.length)[0];
    }
  }
  return undefined;
}

function ghostHintForStructLine(
  sol: StructLine,
  solutionStruct: StructLine[],
  userStruct: StructLine[],
  userYaml: string,
  preferAncestor: boolean,
): GhostHint | null {
  const user = findUserLineForPath(userStruct, sol.path, sol.key);

  if (!user) {
    if (preferAncestor) {
      const missingAncestor = findFirstMissingAncestor(sol, solutionStruct, userStruct);
      if (missingAncestor) {
        return hintForMissingLine(missingAncestor, solutionStruct, userStruct, userYaml);
      }
    } else {
      const chain = getMissingAncestorChain(sol, solutionStruct, userStruct);
      if (chain.length > 0) {
        return hintForMissingChain(chain, solutionStruct, userStruct, userYaml);
      }
    }
    return hintForMissingLine(sol, solutionStruct, userStruct, userYaml);
  }

  if (user.path !== sol.path && sol.value) {
    return hintForMissingLine(sol, solutionStruct, userStruct, userYaml);
  }

  if (user.indent !== sol.indent && sol.value) {
    const needed = sol.indent - user.indent;
    if (needed > 0) {
      const spaces = " ".repeat(needed);
      const expected = valueFromSolutionLine(sol);
      const valueHint = user.value ? remainingValueHint(user.value, expected) : expected;
      const text = valueHint ? `${spaces}${valueHint}` : spaces;
      return withDisplay({
        text,
        displayText: valueHint ? `${visibleIndent(spaces)}${valueHint}` : visibleIndent(spaces),
        position: user.line.from,
        kind: "indent",
      });
    }
    return hintForMissingLine(sol, solutionStruct, userStruct, userYaml);
  }

  if (!sol.value) return null;

  const expected = valueFromSolutionLine(sol);

  if (!user.value) {
    return withDisplay({
      text: expected,
      position: valueInsertPosition(user.line),
      kind: "value",
    });
  }

  if (!valuesMatch(user.value, sol.value) && expected.startsWith(user.value)) {
    const hint = remainingValueHint(user.value, expected);
    if (hint) {
      return withDisplay({
        text: hint,
        position: user.line.to,
        kind: "value",
      });
    }
  }

  if (!valuesMatch(user.value, sol.value)) {
    return withDisplay({
      text: expected,
      position: valueInsertPosition(user.line),
      kind: "value",
    });
  }

  return null;
}

export function getGhostHintForFieldPath(
  userYaml: string,
  solutionYaml: string,
  fieldPath: string,
): GhostHint | null {
  if (!solutionYaml || !fieldPath || !userYaml.trim()) return null;

  const solutionStruct = parseStructLines(solutionYaml);
  const userStruct = parseStructLines(userYaml);
  const sol = findSolutionLineForFieldPath(solutionStruct, fieldPath);
  if (!sol) return null;

  return ghostHintForStructLine(sol, solutionStruct, userStruct, userYaml, false);
}

export function getNextGhostHint(
  userYaml: string,
  solutionYaml: string,
  failedFieldPaths: string[] = [],
): GhostHint | null {
  if (!solutionYaml || !userYaml.trim()) return null;

  if (failedFieldPaths.length > 0) {
    for (const path of failedFieldPaths) {
      const hint = getGhostHintForFieldPath(userYaml, solutionYaml, path);
      if (hint) return hint;
    }
    return null;
  }

  const solutionStruct = parseStructLines(solutionYaml);
  const userStruct = parseStructLines(userYaml);

  for (const sol of solutionStruct) {
    const hint = ghostHintForStructLine(sol, solutionStruct, userStruct, userYaml, true);
    if (hint) return hint;
  }

  return null;
}

export function applyGhostHint(yaml: string, hint: GhostHint): string {
  const pos = Math.min(Math.max(0, hint.position), yaml.length);

  if (hint.kind === "indent" || hint.kind === "value") {
    return yaml.slice(0, pos) + hint.text + yaml.slice(pos);
  }

  const before = yaml.slice(0, pos);
  const after = yaml.slice(pos);
  const needsNewline = before.length > 0 && !before.endsWith("\n");
  return before + (needsNewline ? "\n" : "") + hint.text + after;
}

export function describeGhostHint(hint: GhostHint): string {
  const shown = (hint.displayText ?? hint.text).trim();
  switch (hint.kind) {
    case "indent":
      return `Added ${hint.text.length} space${hint.text.length === 1 ? "" : "s"} of indentation`;
    case "value":
      return `Inserted “${shown}”`;
    case "key-line":
      if (shown.endsWith(":") && !shown.includes(": ")) {
        return `Added section: ${shown.slice(0, -1)}`;
      }
      return `Added line: ${shown}`;
  }
}

export function isCorrectPrefix(
  userYaml: string,
  solutionYaml: string,
  failedFieldPaths: string[] = [],
): boolean {
  if (failedFieldPaths.length === 0) {
    return userYaml.trim() === solutionYaml.trim() || getNextGhostHint(userYaml, solutionYaml) === null;
  }
  return getNextGhostHint(userYaml, solutionYaml, failedFieldPaths) === null;
}
