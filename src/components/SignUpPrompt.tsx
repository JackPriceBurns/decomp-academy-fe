"use client";

import Link from "next/link";
import { IconDeviceFloppy, IconUserPlus } from "@tabler/icons-react";
import { Logo, ButtonLink, Modal } from "@/components/ui";
import { totalSolved } from "@/lib/progress";

// Shown once to an anonymous learner who has built up some progress, nudging
// them to create an account before that browser-only progress can be lost.
export function SignUpPrompt({ onClose }: { onClose: () => void }) {
  const solved = totalSolved();
  return (
    <Modal onClose={onClose} labelledBy="signup-prompt-title">
      <div className="mb-5 flex flex-col items-center gap-3 text-center">
        <Logo size={36} />
        <div>
          <h2 id="signup-prompt-title" className="text-lg font-bold text-content-bright">
            Save your progress
          </h2>
          <p className="mt-1.5 text-sm text-content-muted">
            You&apos;ve completed{" "}
            <span className="font-semibold text-content-primary">
              {solved} lesson{solved === 1 ? "" : "s"}
            </span>
            . Create a free account to keep your progress and continue on any device.
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-bg-inset px-3 py-2.5 text-xs text-content-muted">
        <IconDeviceFloppy size={15} className="shrink-0 text-accent" />
        Right now it lives only in this browser — clearing your data would lose it.
      </div>

      <ButtonLink href="/register" onClick={onClose} className="w-full">
        <IconUserPlus size={15} /> Create free account
      </ButtonLink>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Link
          href="/login"
          onClick={onClose}
          className="text-xs text-accent transition hover:text-accent-hover hover:underline"
        >
          Already have an account? Sign in
        </Link>
        <button
          onClick={onClose}
          className="text-xs text-content-faint transition hover:text-content-muted"
        >
          Maybe later
        </button>
      </div>
    </Modal>
  );
}
