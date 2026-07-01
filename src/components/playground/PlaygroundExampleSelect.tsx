import { EXAMPLES, type ExampleCategory } from "@/lib/playground/examples";

const CATEGORY_ORDER: ExampleCategory[] = [
  "Math",
  "Vector",
  "Matrix",
  "Bits",
  "Random",
  "Game",
  "Sorting",
  "Memory",
];

type Props = {
  value: string;
  onPick: (id: string) => void;
};

export function PlaygroundExampleSelect({ value, onPick }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onPick(e.target.value)}
      title="Load a real function from an open GameCube decomp project"
      className="max-w-[13rem] cursor-pointer rounded-md border border-line bg-bg-softer px-2 py-1.5 text-xs text-content-secondary transition hover:text-content-primary focus:outline-none focus:ring-1 focus:ring-accent"
    >
      <option value="">Load example…</option>
      {CATEGORY_ORDER.map((cat) => {
        const items = EXAMPLES.filter((e) => e.category === cat);
        if (!items.length) return null;
        return (
          <optgroup key={cat} label={cat}>
            {items.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label} · {e.game}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
