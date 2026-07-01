type Props = { label: string } & React.InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, ...props }: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-content-secondary">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-line bg-bg-inset px-3 py-2 text-sm text-content-primary outline-none transition placeholder:text-content-faint focus:border-accent focus:ring-2 focus:ring-accent/25"
      />
    </label>
  );
}
