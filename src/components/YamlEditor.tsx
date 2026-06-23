"use client";

import { yaml } from "@codemirror/lang-yaml";
import { oneDark } from "@codemirror/theme-one-dark";
import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, forwardRef } from "react";

import type { GhostHint } from "@/lib/domain/next-hint";
import type { YamlHighlight } from "@/lib/domain/yaml-highlights";

const setHighlightsEffect = StateEffect.define<YamlHighlight[]>();
const setActiveLineEffect = StateEffect.define<number | null>();
const setHighlightPeekEffect = StateEffect.define<boolean>();
const setGhostHintEffect = StateEffect.define<GhostHint | null>();

class GhostHintWidget extends WidgetType {
  constructor(
    readonly text: string,
    readonly kind: GhostHint["kind"],
    readonly displayText?: string,
  ) {
    super();
  }

  toDOM() {
    const shown = this.displayText ?? this.text;
    const el = document.createElement(this.text.includes("\n") ? "div" : "span");
    el.textContent = shown;
    el.className =
      this.kind === "indent"
        ? "cm-ghost-hint cm-ghost-hint-indent"
        : this.kind === "key-line"
          ? "cm-ghost-hint cm-ghost-hint-line"
          : "cm-ghost-hint";
    return el;
  }

  ignoreEvent() {
    return true;
  }
}

function buildGhostDecoration(
  doc: EditorView["state"]["doc"],
  ghost: GhostHint | null,
): DecorationSet {
  if (!ghost?.text) return Decoration.none;
  const pos = Math.min(Math.max(0, ghost.position), doc.length);
  return Decoration.set([
    Decoration.widget({
      widget: new GhostHintWidget(ghost.text, ghost.kind, ghost.displayText),
      side: ghost.kind === "key-line" ? 1 : 1,
    }).range(pos),
  ]);
}

const ghostHintField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(deco, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setGhostHintEffect)) {
        return buildGhostDecoration(tr.state.doc, effect.value);
      }
    }
    return deco.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

function buildDecorations(
  doc: EditorView["state"]["doc"],
  highlights: YamlHighlight[],
  activeLine: number | null,
  peek: boolean,
): DecorationSet {
  const decorations = highlights.map((h) => {
    const line = doc.lineAt(h.from);
    const isActive = activeLine === h.line;
    const base =
      h.severity === "error"
        ? h.missing
          ? "cm-field-missing-error"
          : "cm-field-error"
        : h.missing
          ? "cm-field-missing-warning"
          : "cm-field-warning";

    const classes = [base];
    if (isActive) classes.push("cm-field-active");
    if (isActive && peek) classes.push("cm-field-peek");

    return Decoration.line({
      class: classes.join(" "),
      attributes: { "data-field": h.fieldPath, "data-line": String(h.line) },
    }).range(line.from);
  });

  return Decoration.set(decorations, true);
}

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(deco, tr) {
    let highlights: YamlHighlight[] | null = null;
    let activeLine: number | null | undefined;
    let peek: boolean | undefined;

    for (const effect of tr.effects) {
      if (effect.is(setHighlightsEffect)) highlights = effect.value;
      if (effect.is(setActiveLineEffect)) activeLine = effect.value;
      if (effect.is(setHighlightPeekEffect)) peek = effect.value;
    }

    if (highlights !== null || activeLine !== undefined || peek !== undefined) {
      const currentHighlights =
        highlights ??
        tr.startState.field(highlightFieldMeta) ??
        [];
      const currentActive =
        activeLine !== undefined
          ? activeLine
          : tr.startState.field(activeLineField);
      const currentPeek =
        peek !== undefined ? peek : tr.startState.field(highlightPeekField);
      return buildDecorations(tr.state.doc, currentHighlights, currentActive, currentPeek);
    }

    return deco.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

const highlightFieldMeta = StateField.define<YamlHighlight[]>({
  create: () => [],
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHighlightsEffect)) return effect.value;
    }
    return value;
  },
});

const activeLineField = StateField.define<number | null>({
  create: () => null,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setActiveLineEffect)) return effect.value;
    }
    return value;
  },
});

const highlightPeekField = StateField.define<boolean>({
  create: () => false,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setHighlightPeekEffect)) return effect.value;
    }
    return value;
  },
});

function createEditorExtensions() {
  return [
    highlightField,
    highlightFieldMeta,
    activeLineField,
    highlightPeekField,
    ghostHintField,
    EditorView.baseTheme({
      ".cm-field-error": {
        backgroundColor: "rgba(239, 68, 68, 0.18)",
        borderLeft: "3px solid #ef4444",
      },
      ".cm-field-missing-error": {
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        borderLeft: "3px solid #ef4444",
        boxShadow: "inset 0 0 0 1px rgba(239, 68, 68, 0.35)",
      },
      ".cm-field-warning": {
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        borderLeft: "3px solid #f59e0b",
      },
      ".cm-field-missing-warning": {
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderLeft: "3px solid #f59e0b",
        boxShadow: "inset 0 0 0 1px rgba(245, 158, 11, 0.3)",
      },
      ".cm-field-active": {
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)",
      },
      ".cm-field-peek": {
        animation: "cm-field-peek 1.1s ease-in-out",
      },
      ".cm-editor": {
        maxWidth: "100%",
      },
      ".cm-scroller": {
        overflow: "auto",
      },
      ".cm-content": {
        wordBreak: "break-word",
      },
      ".cm-ghost-hint": {
        color: "rgba(125, 211, 252, 0.55)",
        fontStyle: "italic",
        pointerEvents: "none",
        backgroundColor: "rgba(125, 211, 252, 0.08)",
        borderRadius: "2px",
        padding: "0 2px",
        whiteSpace: "pre",
      },
      ".cm-ghost-hint-indent": {
        color: "rgba(251, 191, 36, 0.6)",
        backgroundColor: "rgba(251, 191, 36, 0.1)",
      },
      ".cm-ghost-hint-line": {
        color: "rgba(167, 139, 250, 0.65)",
        display: "block",
        whiteSpace: "pre",
      },
    }),
  ];
}

export interface YamlEditorHandle {
  scrollToLine: (line: number) => void;
  scrollToPosition: (position: number) => void;
}

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  highlights?: YamlHighlight[];
  activeLine?: number | null;
  highlightPeek?: boolean;
  ghostHint?: GhostHint | null;
}

export const YamlEditor = forwardRef<YamlEditorHandle, YamlEditorProps>(function YamlEditor(
  {
    value,
    onChange,
    placeholder,
    highlights = [],
    activeLine = null,
    highlightPeek = false,
    ghostHint = null,
  },
  ref,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const viewRef = useRef<EditorView | null>(null);

  const handleChange = useCallback((val: string) => {
    onChangeRef.current(val);
  }, []);

  const highlightExtension = useMemo(() => createEditorExtensions(), []);

  const dispatchHighlights = useCallback((h: YamlHighlight[], active: number | null, peek: boolean) => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: [
        setHighlightsEffect.of(h),
        setActiveLineEffect.of(active),
        setHighlightPeekEffect.of(peek),
      ],
    });
  }, []);

  const dispatchGhostHint = useCallback((hint: GhostHint | null) => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: setGhostHintEffect.of(hint) });
  }, []);

  useImperativeHandle(ref, () => ({
    scrollToLine(line: number) {
      const view = viewRef.current;
      if (!view) return;
      const docLine = view.state.doc.line(Math.min(line, view.state.doc.lines));
      view.dispatch({
        effects: [
          setActiveLineEffect.of(line),
          EditorView.scrollIntoView(docLine.from, { y: "center" }),
        ],
      });
    },
    scrollToPosition(position: number) {
      const view = viewRef.current;
      if (!view) return;
      const pos = Math.min(Math.max(0, position), view.state.doc.length);
      view.dispatch({
        effects: EditorView.scrollIntoView(pos, { y: "center" }),
      });
    },
  }));

  useEffect(() => {
    dispatchHighlights(highlights, activeLine, highlightPeek);
  }, [highlights, activeLine, highlightPeek, dispatchHighlights]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      dispatchGhostHint(ghostHint);
    });
    return () => cancelAnimationFrame(frame);
  }, [ghostHint, dispatchGhostHint]);

  useEffect(() => {
    if (highlights.length === 0) return;
    const view = viewRef.current;
    if (!view) return;
    const target = highlights.find((h) => h.line === activeLine) ?? highlights[0];
    view.dispatch({
      effects: EditorView.scrollIntoView(target.from, { y: "center" }),
    });
  }, [highlights, activeLine]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="h-full min-h-[420px] min-w-0 overflow-hidden rounded-xl border border-slate-700/80 bg-[#0d1117] shadow-inner">
      <CodeMirror
        value={value}
        height="100%"
        minHeight="420px"
        theme={oneDark}
        extensions={[yaml(), EditorView.lineWrapping, highlightExtension]}
        onChange={handleChange}
        onCreateEditor={(view) => {
          viewRef.current = view;
          if (highlights.length > 0) {
            dispatchHighlights(highlights, activeLine, highlightPeek);
          }
          if (ghostHint) {
            dispatchGhostHint(ghostHint);
          }
        }}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          indentOnInput: true,
          bracketMatching: true,
          autocompletion: true,
          tabSize: 2,
        }}
        className="h-full max-w-full text-sm [&_.cm-editor]:h-full [&_.cm-editor]:max-w-full [&_.cm-scroller]:font-mono"
      />
    </div>
  );
});
