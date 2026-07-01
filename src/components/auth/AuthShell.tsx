"use client";

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

type Props = {
  children: React.ReactNode;
};

export function AuthShell({ children }: Props) {
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
