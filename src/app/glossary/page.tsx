import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { GLOSSARY } from "@/lib/glossary";
import { Logo, ThemeToggle } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, definedTermSetLd, SITE_URL } from "@/lib/seo";

const DESCRIPTION =
  "Plain-English definitions of the PowerPC, ABI, and compiler terms you meet " +
  "when decompiling GameCube code: ABI, EABI, GPR, FPR, MWCC, SDA, CSE and more.";

export const metadata: Metadata = {
  title: "Decompilation Glossary — PowerPC, ABI & MWCC Terms",
  description: DESCRIPTION,
  alternates: { canonical: "/glossary" },
  openGraph: {
    type: "article",
    title: "Decompilation Glossary · Decomp Academy",
    description: DESCRIPTION,
    url: `${SITE_URL}/glossary`,
  },
};

// Alphabetical, so the page reads as a reference and #term anchors are easy to find.
const TERMS = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));

export default function GlossaryPage() {
  return (
    <main className="min-h-screen">
      <JsonLd
        data={[
          definedTermSetLd(TERMS),
          breadcrumbLd([
            { name: "Decomp Academy", url: SITE_URL },
            { name: "Glossary", url: `${SITE_URL}/glossary` },
          ]),
        ]}
      />

      <nav className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-bold tracking-tight text-content-primary">Decomp Academy</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-content-secondary transition hover:text-content-primary"
            >
              <IconArrowLeft size={16} /> Back to lessons
            </Link>
          </div>
        </div>
      </nav>

      <header className="border-b border-line">
        <div className="mx-auto max-w-3xl px-5 py-12">
          <h1 className="text-2xl font-bold tracking-tight text-content-bright sm:text-3xl">
            Decompilation glossary
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-content-secondary">
            The PowerPC, ABI, and compiler vocabulary you run into while learning to decompile
            GameCube games. Every term here is also auto-linked, with a hover definition, throughout
            the{" "}
            <Link href="/" className="text-accent hover:underline">
              Decomp Academy lessons
            </Link>
            .
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <dl className="grid gap-px overflow-hidden rounded-xl border border-line bg-line theme-light:border-line-strong theme-light:bg-line-strong">
          {TERMS.map((e) => (
            <div key={e.term} id={e.term} className="scroll-mt-20 bg-bg p-5 theme-light:bg-bg-soft">
              <dt className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="font-mono text-lg font-semibold text-accent">{e.term}</span>
                <span className="text-sm text-content-secondary">{e.full}</span>
              </dt>
              <dd className="mt-1.5 leading-relaxed text-content-muted">{e.desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="border-t border-line bg-bg-soft/40">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-8 text-sm text-content-muted">
          <Logo size={22} />
          <span>
            <span className="font-semibold text-content">Decomp Academy</span> · graded live by the
            real Metrowerks CodeWarrior GC/2.0 compiler.
          </span>
        </div>
      </footer>
    </main>
  );
}
