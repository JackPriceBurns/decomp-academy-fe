type Props = {
  text: string;
  isErr: boolean;
};

export function WorkspaceConsolePre({ text, isErr }: Props) {
  return (
    <pre
      className={`flex-1 whitespace-pre-wrap px-4 py-3 font-mono text-xs leading-relaxed h-full ${
        isErr ? "text-bad-text" : "text-content-muted"
      }`}
    >
      {text}
    </pre>
  );
}
