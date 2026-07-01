"use client";

import Editor, { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useEffect, useRef } from "react";
import { palette, paletteLight } from "@/lib/theme";
import { useTheme, type Theme } from "@/lib/theme-context";

const hx = (c: string) => c.replace("#", "");

function defineThemes(monaco: Monaco) {
  const build = (
    name: string,
    base: "vs" | "vs-dark",
    pal: typeof palette,
    chrome: { lineHighlight: string; selection: string },
  ) => {
    const s = pal.syntax;
    monaco.editor.defineTheme(name, {
      base,
      inherit: true,
      rules: [
        { token: "comment", foreground: hx(s.comment), fontStyle: "italic" },
        { token: "keyword", foreground: hx(s.keyword) },
        { token: "type", foreground: hx(s.reg) },
        { token: "number", foreground: hx(s.num) },
        { token: "string", foreground: hx(s.str) },
        { token: "identifier", foreground: hx(s.ident) },
      ],
      colors: {
        "editor.background": pal.bg.soft,
        "editor.lineHighlightBackground": chrome.lineHighlight,
        "editorLineNumber.foreground": pal.content.ghost,
        "editorLineNumber.activeForeground": pal.accent.DEFAULT,
        "editor.selectionBackground": chrome.selection,
        "editorCursor.foreground": pal.accent.DEFAULT,
        "editorIndentGuide.background1": pal.line.faint,
      },
    });
  };

  build("decomp-dark", "vs-dark", palette, { lineHighlight: "#12171f", selection: "#2b3960" });
  build("decomp-light", "vs", paletteLight, { lineHighlight: "#efedf9", selection: "#d8d0f3" });
}

const themeName = (t: Theme) => (t === "light" ? "decomp-light" : "decomp-dark");

type Props = {
  value: string;
  onChange?: (v: string) => void;
  onRun?: () => void;
  readOnly?: boolean;
};

export function CodeEditor({ value, onChange, onRun, readOnly = false }: Props) {
  const { theme } = useTheme();
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    monacoRef.current?.editor.setTheme(themeName(theme));
  }, [theme]);

  function handleMount(ed: editor.IStandaloneCodeEditor, monaco: Monaco) {
    monacoRef.current = monaco;
    defineThemes(monaco);
    monaco.editor.setTheme(themeName(theme));
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRunRef.current?.());
  }

  return (
    <Editor
      height="100%"
      language="c"
      theme={themeName(theme)}
      value={value}
      onChange={(v) => onChange?.(v ?? "")}
      onMount={handleMount}
      options={{
        readOnly,
        domReadOnly: readOnly,
        fontSize: 13,
        fontFamily: "var(--font-mono)",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 14, bottom: 14 },
        lineNumbersMinChars: 3,
        renderLineHighlight: readOnly ? "none" : "line",
        smoothScrolling: true,
        cursorBlinking: "smooth",
        tabSize: 4,
        automaticLayout: true,
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
        overviewRulerLanes: 0,
        bracketPairColorization: { enabled: true },
      }}
    />
  );
}
