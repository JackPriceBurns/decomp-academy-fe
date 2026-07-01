type Props = {
  title: string;
  note?: string;
  children: React.ReactNode;
};

export function HomeFooterCol({ title, note, children }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="text-2xs font-semibold uppercase tracking-wider text-content-faint">
        {title}
      </h3>

      {note && (
        <p className="text-2xs text-content-ghost theme-light:text-content-faint leading-4">
          {note}
        </p>
      )}

      <ul className="space-y-2">
        {children}
      </ul>
    </div>
  );
}
