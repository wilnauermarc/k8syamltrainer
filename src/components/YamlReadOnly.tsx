"use client";

import { yaml } from "@codemirror/lang-yaml";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

interface YamlReadOnlyProps {
  value: string;
  minHeight?: string;
}

export function YamlReadOnly({ value, minHeight = "280px" }: YamlReadOnlyProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-amber-500/20 bg-[#0d1117] shadow-inner">
      <div className="border-b border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs font-medium text-amber-400/90">
        Broken manifest — read only
      </div>
      <CodeMirror
        value={value}
        minHeight={minHeight}
        theme={oneDark}
        extensions={[yaml(), EditorView.lineWrapping, EditorView.editable.of(false)]}
        editable={false}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          tabSize: 2,
        }}
        className="text-sm [&_.cm-editor]:max-w-full [&_.cm-scroller]:font-mono [&_.cm-cursor]:hidden"
      />
    </div>
  );
}
