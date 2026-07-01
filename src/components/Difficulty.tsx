type Props = {
  level: number;
};

export function Difficulty({ level }: Props) {
  return (
    <div
      className="flex items-center gap-0.5"
      title={`Difficulty ${level}/5`}
      role="img"
      aria-label={`Difficulty ${level} of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i <= level ? "bg-accent/80" : "bg-line-strong theme-light:bg-line-faint"}`}
        />
      ))}
    </div>
  );
}
