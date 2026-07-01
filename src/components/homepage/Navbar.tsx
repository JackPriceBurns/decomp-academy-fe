import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AccountMenu } from "@/components/AccountMenu";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md flex justify-center">
      <div className="flex justify-between items-center w-full max-w-5xl px-4 py-3">
        <div className="flex items-center space-x-2">
          <Logo size={28} className="shrink-0" />

          <span className="hidden shrink-0 whitespace-nowrap font-bold tracking-tight text-content-primary min-[360px]:inline">
            Decomp Academy
          </span>
        </div>

        <div className="flex shrink-0 items-center space-x-3 sm:space-x-4 text-sm">
          <Link
            href="/playground"
            className="hidden text-content-secondary transition hover:text-content-primary sm:block"
          >
            Playground
          </Link>

          <Link
            href="#curriculum"
            className="hidden text-content-secondary transition hover:text-content-primary sm:block"
          >
            Curriculum
          </Link>

          <ThemeToggle />
          <AccountMenu />
        </div>
      </div>
    </nav>
  );
}
