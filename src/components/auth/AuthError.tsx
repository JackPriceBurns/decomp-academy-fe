import { IconAlertTriangle } from "@tabler/icons-react";

type Props = {
  message: string | null;
};

export function AuthError({ message }: Props) {
  if (!message) return null;
  return (
    <div className="mb-3 flex items-start gap-2 rounded-lg border border-bad/25 bg-bad/[0.08] px-3 py-2 text-xs text-bad">
      <IconAlertTriangle size={14} className="mt-px shrink-0" />
      <span className="text-content">{message}</span>
    </div>
  );
}
