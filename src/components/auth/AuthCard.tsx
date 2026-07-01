"use client";

import Link from "next/link";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { Logo } from "@/components/ui/Logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-bg">
      <div className="border-b border-line/70 bg-bg-soft/60">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-5 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
          >
            <IconArrowLeft size={16} /> Decomp Academy
          </Link>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
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

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
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

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-3 flex items-start gap-2 rounded-lg border border-bad/25 bg-bad/[0.08] px-3 py-2 text-xs text-bad">
      <IconAlertTriangle size={14} className="mt-px shrink-0" />
      <span className="text-content">{message}</span>
    </div>
  );
}
