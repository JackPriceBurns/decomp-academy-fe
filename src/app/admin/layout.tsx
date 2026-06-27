"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { IconChartBar, IconArrowLeft, IconMessage } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth/AuthContext";

const NAV = [
  { href: "/admin", label: "Lesson stats", icon: IconChartBar },
  { href: "/admin/feedback", label: "Feedback", icon: IconMessage },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = status === "authed" && user?.isAdmin;

  useEffect(() => {
    if (status !== "loading" && !allowed) router.replace("/");
  }, [status, allowed, router]);

  if (!allowed) {
    return (
      <div className="grid min-h-screen place-items-center text-content-faint">
        {status === "loading" ? "Loading…" : "Redirecting…"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-content-primary">
      <header className="border-b border-line bg-bg-soft">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-content-secondary transition hover:text-content-primary"
          >
            <IconArrowLeft size={15} /> Site
          </Link>
          <span className="text-sm font-semibold">Admin</span>
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-content-secondary hover:bg-bg-softer hover:text-content-primary"
                  }`}
                >
                  <Icon size={15} /> {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
