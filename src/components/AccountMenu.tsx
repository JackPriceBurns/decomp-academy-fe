"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  IconUserCircle,
  IconLogout,
  IconChevronDown,
  IconChartBar,
} from "@tabler/icons-react";
import { useAuth } from "@/lib/auth/AuthContext";

export function AccountMenu() {
  const { status, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Until auth resolves (and whenever signed out) just show Sign in — avoids a
  // placeholder circle flashing in and then swapping to the button.
  if (status !== "authed" || !user) {
    return (
      <Link
        href="/login"
        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent transition hover:bg-accent/20"
      >
        <IconUserCircle size={16} /> Sign in
      </Link>
    );
  }

  const label = user.email;
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex max-w-[10rem] items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
      >
        <IconUserCircle size={18} className="shrink-0 text-accent" />
        <span className="hidden truncate sm:inline">{label}</span>
        <IconChevronDown
          size={14}
          className={`shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-56 overflow-hidden rounded-lg border border-line bg-bg-soft shadow-xl shadow-black/30">
          <div className="border-b border-line px-3 py-2.5">
            <div className="text-2xs uppercase tracking-wide text-content-faint">Signed in as</div>
            <div className="truncate text-sm text-content-primary">{label}</div>
          </div>
          {user.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 border-b border-line px-3 py-2.5 text-left text-sm text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
            >
              <IconChartBar size={15} /> Admin
            </Link>
          )}
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-content-secondary transition hover:bg-bg-softer hover:text-content-primary"
          >
            <IconLogout size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
