import { Logo } from "@/components/ui/Logo";

type Props = {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: Props) {
  return (
    <div className="animate-slide-up-fade rounded-2xl border border-line bg-bg-soft/50 px-6 py-7 sm:px-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <Logo size={36} />
        <div>
          <h1 className="text-lg font-bold text-content-bright">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-content-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
