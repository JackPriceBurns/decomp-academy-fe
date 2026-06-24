import Link from "next/link";
import {
  IconBrandGithub,
  IconBinaryTree,
  IconCode,
  IconCircleCheck,
} from "@tabler/icons-react";
import { chaptersWithLessons, LESSONS } from "@/lib/lessons/registry";
import { CurriculumMap } from "@/components/CurriculumMap";
import { MatchLog } from "@/components/MatchLog";
import { Hero } from "@/components/Hero";
import { Logo } from "@/components/ui";

export default function Home() {
  // Slim the payload: the map only needs lesson metadata, never briefs/solutions.
  const chapters = chaptersWithLessons()
    .filter((c) => c.lessons.length > 0)
    .map((c) => ({
      id: c.id,
      title: c.title,
      blurb: c.blurb,
      order: c.order,
      lessons: c.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        order: l.order,
        difficulty: l.difficulty,
        concepts: l.concepts,
        concept: l.concept ?? false,
      })),
    }));
  const total = LESSONS.length;
  const firstLesson = LESSONS[0];
  const heatLessons = chapters.flatMap((c) =>
    c.lessons.map((l) => ({ id: l.id, title: l.title, difficulty: l.difficulty, concept: l.concept })),
  );

  return (
    <main className="min-h-screen">
      <nav className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-5 py-3">
          <Logo size={28} />
          <span className="font-bold tracking-tight text-content-primary">Decomp Academy</span>
          <span className="ml-1 hidden rounded bg-bg-softer px-1.5 py-0.5 font-mono text-2xs font-medium text-content-muted sm:inline">
            MWCC GC/2.0
          </span>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <a
              href="https://github.com/JackPriceBurns/decomp-academy-fe"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 text-content-secondary transition hover:text-content-primary sm:inline-flex"
            >
              <IconBrandGithub size={16} /> GitHub
            </a>
            <Link href="#curriculum" className="text-content-secondary transition hover:text-content-primary">
              Curriculum
            </Link>
            {firstLesson && (
              <Link
                href={`/lesson/${firstLesson.id}`}
                className="rounded-md bg-accent/10 px-3 py-1.5 font-medium text-accent transition hover:bg-accent/20"
              >
                Start
              </Link>
            )}
          </div>
        </div>
      </nav>
      <Hero total={total} firstLessonId={firstLesson?.id} />

      {/* How it works — the loop, in three beats. */}
      <section className="bg-bg-soft/30">
        <div className="mx-auto grid max-w-5xl gap-4 px-5 py-10 sm:grid-cols-3">
          <HowStep
            n={1}
            icon={<IconBinaryTree size={18} className="text-accent" />}
            title="Read the assembly"
            body="Study the target PowerPC the retail compiler produced, instruction by instruction."
          />
          <HowStep
            n={2}
            icon={<IconCode size={18} className="text-accent" />}
            title="Write the C"
            body="Reconstruct the original source. Hints and a reference solution are a click away."
          />
          <HowStep
            n={3}
            icon={<IconCircleCheck size={18} className="text-good" />}
            title="The compiler grades it"
            body="The real MWCC GC/2.0 compiles your code and diffs it — match every byte to win."
          />
        </div>
      </section>

      <section id="curriculum" className="mx-auto max-w-5xl scroll-mt-16 px-5 pb-24 pt-14">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-bold text-content-bright">The Curriculum</h2>
            <p className="mt-1 text-sm text-content-muted">
              Read the asm · write the C · the compiler grades it byte-for-byte.
            </p>
          </div>
          <Link
            href={firstLesson ? `/lesson/${firstLesson.id}` : "#"}
            className="shrink-0 text-sm text-accent transition hover:text-accent-hover hover:underline"
          >
            Jump back in →
          </Link>
        </div>
        <div className="mb-8">
          <MatchLog lessons={heatLessons} />
        </div>
        <CurriculumMap chapters={chapters} />
      </section>
      <footer className="border-t border-line bg-bg-soft/40">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 text-sm text-content-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Logo size={22} />
            <span>
              <span className="font-semibold text-content">Decomp Academy</span> · graded live by the
              real Metrowerks CodeWarrior GC/2.0 compiler.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>{total} lessons</span>
            <a
              href="https://decomp.dev/zcanann/SFA-Decomp"
              className="inline-flex items-center gap-1.5 transition hover:text-content"
              target="_blank"
              rel="noreferrer"
            >
              <IconBrandGithub size={15} /> SFA-Decomp
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-5 pb-6 text-2xs text-content-ghost">
          Not affiliated with Nintendo or Rare. Star Fox Adventures is a trademark of its respective owners.
        </div>
      </footer>
    </main>
  );
}

function HowStep({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div
      className="relative animate-slide-up-fade rounded-xl bg-bg-soft/50 p-5"
      style={{ animationDelay: `${(n - 1) * 90}ms` }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-inset">
          {icon}
        </span>
        <span className="font-mono text-2xs text-content-faint">STEP {n}</span>
      </div>
      <div className="font-semibold text-content-primary">{title}</div>
      <p className="mt-1 text-sm leading-relaxed text-content-muted">{body}</p>
    </div>
  );
}
