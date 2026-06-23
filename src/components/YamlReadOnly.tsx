"use client";

import { yaml } from "@codemirror/lang-yaml";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

interface YamlReadOnlyProps {
  value: string;
  minHeight?: string;
}

export function YamlReadOnly({ value, minHeight = "200px" }: YamlReadOnlyProps) {
  return (
    <div className="h-full min-h-0 overflow-hidden">
      <CodeMirror
        value={value}
        height="100%"
        minHeight={minHeight}
        theme={oneDark}
        extensions={[yaml(), EditorView.lineWrapping, EditorView.editable.of(false)]}
        editable={false}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          tabSize: 2,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
        className="h-full text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:font-mono"
      />
    </div>
  );
}
