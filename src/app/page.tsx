import Link from "next/link";
import { IconBrandGithub } from "@tabler/icons-react";
import { chaptersWithLessons, COURSES, LESSONS, TIERS } from "@/lib/lessons/registry";
import { CurriculumBrowser, CourseView } from "@/components/CurriculumBrowser";
import { Hero } from "@/components/Hero";
import { Logo, ThemeToggle } from "@/components/ui";
import { AccountMenu } from "@/components/AccountMenu";
import { JsonLd } from "@/components/JsonLd";
import { courseLd, lessonPath } from "@/lib/seo";

export default function Home() {
  // Slim the payload: the map only needs lesson metadata, never briefs/solutions.
  // Built per course so the selector can switch between tracks client-side.
  const courses: CourseView[] = COURSES.map((course) => {
    const chapters = chaptersWithLessons(course.id)
      .filter((c) => c.lessons.length > 0)
      .map((c) => ({
        id: c.id,
        title: c.title,
        blurb: c.blurb,
        order: c.order,
        tier: c.tier,
        lessons: c.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          order: l.order,
          difficulty: l.difficulty,
          concepts: l.concepts,
          concept: l.concept ?? false,
        })),
      }));
    const heatLessons = chapters.flatMap((c) =>
      c.lessons.map((l) => ({ id: l.id, title: l.title, difficulty: l.difficulty, concept: l.concept })),
    );
    return {
      id: course.id,
      title: course.title,
      blurb: course.blurb,
      firstLessonId: chapters[0]?.lessons[0]?.id,
      tiers: TIERS.filter((t) => t.course === course.id),
      chapters,
      heatLessons,
    };
  }).filter((c) => c.chapters.length > 0);

  const total = LESSONS.length;
  const firstLesson = LESSONS[0];

  return (
    <main className="min-h-screen">
      <JsonLd data={courseLd()} />
      <nav className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-5 py-3">
          <Logo size={28} className="shrink-0" />
          {/* Below ~360px (iPhone SE) the wordmark is dropped — the {dA} logo
              still carries the brand — so the bar never overflows. */}
          <span className="hidden shrink-0 whitespace-nowrap font-bold tracking-tight text-content-primary min-[360px]:inline">
            Decomp Academy
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-3 text-sm sm:gap-4">
            {/* Secondary links live in the footer too, so drop them from the bar on
                phones rather than overflow the row. */}
            <Link href="/playground" className="hidden text-content-secondary transition hover:text-content-primary sm:block">
              Playground
            </Link>

            <Link href="#curriculum" className="hidden text-content-secondary transition hover:text-content-primary sm:block">
              Curriculum
            </Link>

            <ThemeToggle />
            <AccountMenu />
          </div>
        </div>
      </nav>
      <Hero
        total={total}
        firstLesson={firstLesson ? { id: firstLesson.id, course: firstLesson.course } : undefined}
      />

      <section id="curriculum" className="mx-auto max-w-5xl scroll-mt-16 px-5 pb-24 pt-14">
        <CurriculumBrowser courses={courses} />
      </section>
      <footer className="border-t border-line bg-bg-soft/40">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2">
                <Logo size={24} />
                <span className="font-bold tracking-tight text-content-primary">Decomp Academy</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-content-muted">
                Learn matching decompilation of retro games — turn the original assembly back into
                byte-matching C, graded live by the real compilers.
              </p>
              <div className="mt-4 flex flex-col gap-1.5">
                <a
                  href="https://github.com/JackPriceBurns/decomp-academy-fe"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-content-muted transition hover:text-content"
                >
                  <IconBrandGithub size={15} /> Frontend on GitHub
                </a>
                <a
                  href="https://github.com/JackPriceBurns/decomp-academy-be"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-content-muted transition hover:text-content"
                >
                  <IconBrandGithub size={15} /> Backend on GitHub
                </a>
              </div>
            </div>

            {/* Learn */}
            <FooterCol title="Learn">
              <FooterLink href={firstLesson ? lessonPath(firstLesson.course, firstLesson.id) : "/"}>Start training</FooterLink>
              <FooterLink href="/playground">Playground</FooterLink>
              <FooterLink href="/glossary">Glossary</FooterLink>
              <FooterLink href="/#curriculum">Curriculum · {total} lessons</FooterLink>
            </FooterCol>

            {/* Open-source decomp projects the lessons draw from */}
            <FooterCol
              title="Decomp projects"
              note="Lessons draw on real functions from open-source retro-game decompilations:"
            >
              <FooterLink href="https://github.com/zcanann/SFA-Decomp" external>Star Fox Adventures</FooterLink>
              <FooterLink href="https://github.com/projectPiki/pikmin2" external>Pikmin 2</FooterLink>
              <FooterLink href="https://github.com/PrimeDecomp/prime" external>Metroid Prime</FooterLink>
              <FooterLink href="https://github.com/macabeus/kl-eod-decomp" external>Klonoa: Empire of Dreams</FooterLink>
            </FooterCol>

            {/* Community */}
            <FooterCol title="Community">
              <FooterLink href="https://decomp.me" external>decomp.me</FooterLink>
              <FooterLink href="https://decomp.dev" external>decomp.dev</FooterLink>
              <FooterLink href="https://wiki.decomp.dev" external>Decomp wiki</FooterLink>
            </FooterCol>
          </div>

          <div className="mt-10 border-t border-line/60 pt-5 text-2xs leading-relaxed text-content-ghost">
            Not affiliated with Nintendo, Rare, Retro Studios, or Bandai Namco. Star Fox Adventures,
            Pikmin, Metroid Prime, and Klonoa are trademarks of their respective owners. Linked
            decompilation projects are independent and community-run.
          </div>
        </div>
      </footer>
    </main>
  );
}

function FooterCol({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-2xs font-semibold uppercase tracking-wider text-content-faint">{title}</h3>
      {note && <p className="mt-2 text-2xs leading-relaxed text-content-ghost">{note}</p>}
      <ul className="mt-3 space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className = "text-content-muted transition hover:text-content";
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noreferrer" className={className}>
          {children}
        </a>
      ) : (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    </li>
  );
}
