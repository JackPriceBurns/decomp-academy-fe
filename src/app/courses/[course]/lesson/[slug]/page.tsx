import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adjacentLessons, getLesson, LESSONS } from "@/lib/lessons/registry";
import { getChapter } from "@/curriculum/chapters";
import { COURSE_BY_ID } from "@/curriculum/courses";
import { renderMarkdown, stripMarkdown } from "@/lib/markdown";
import { LessonWorkspace } from "@/components/lesson/LessonWorkspace";
import type { LessonDTO } from "@/components/lesson/types";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, lessonLd, lessonPath, SITE_URL } from "@/lib/seo";

// Pre-render every lesson at build time (the data is fully static, from the
// curriculum registry) so each page ships as crawlable, indexable HTML. The
// route is scoped under its course, so a lesson is reachable at exactly one URL.
export function generateStaticParams() {
  return LESSONS.map((l) => ({ course: l.course, slug: l.slug }));
}

// Per-lesson title + description, so every lesson is distinct to search engines
// instead of inheriting the generic site-wide metadata.
export function generateMetadata({
  params,
}: {
  params: { course: string; slug: string };
}): Metadata {
  const lesson = getLesson(params.course, params.slug);
  if (!lesson) return {};

  const chapter = getChapter(lesson.course, lesson.tier, lesson.chapter);
  const chapterTitle = chapter?.title ?? lesson.chapter;
  const kind = lesson.concept ? "concept" : "exercise";
  const description = stripMarkdown(lesson.brief);
  const path = lessonPath(lesson.course, lesson.slug);
  const url = `${SITE_URL}${path}`;

  return {
    title: `${lesson.title} — ${chapterTitle}`,
    description,
    keywords: lesson.concepts,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: `${lesson.title} — ${chapterTitle} · Decomp Academy`,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${lesson.title} · Decomp Academy`,
      description,
    },
    other: { "decomp:lesson-type": kind },
  };
}

// From the "Reading Signatures" chapter on, exercises ship without a starter
// signature — the learner derives the return type and arguments from the target
// assembly, the way real decompilation works. A lesson opts into this simply by
// omitting its starter block (starter === ""). We then seed the editor with a
// name-only comment: the symbol is the one thing you legitimately know up front
// (it's also shown in the workspace header), so the blank editor has an anchor
// without giving the shape away. Lessons that still want a scaffold (the pre-ABI
// warm-up exercises) keep a non-empty starter block and are passed through as-is.
function editorStarter(starter: string, symbol: string): string {
  if (starter.trim() || !symbol) return starter;
  return `// define ${symbol} to match the target\n`;
}

export default function LessonPage({ params }: { params: { course: string; slug: string } }) {
  // Keyed by (course, slug): a URL whose course/slug pair doesn't exist — a stale
  // or hand-typed link — resolves to nothing and 404s, rather than a wrong page.
  const lesson = getLesson(params.course, params.slug);
  if (!lesson) notFound();

  const course = COURSE_BY_ID.get(lesson.course);
  if (!course) notFound();

  const { prev, next } = adjacentLessons(lesson.course, lesson.slug);
  const chapter = getChapter(lesson.course, lesson.tier, lesson.chapter);
  const chapterTitle = chapter?.title ?? lesson.chapter;

  const dto: LessonDTO = {
    slug: lesson.slug,
    course: lesson.course,
    title: lesson.title,
    chapterId: lesson.chapter,
    chapterTitle,
    difficulty: lesson.difficulty,
    concepts: lesson.concepts,
    briefHtml: renderMarkdown(lesson.brief),
    concept: lesson.concept ?? false,
    symbol: lesson.symbol,
    starter: editorStarter(lesson.starter, lesson.symbol),
    solution: lesson.solution,
    // The struct/type preamble. Shown read-only in a workspace tab, and — for
    // the in-browser agbcc grader — fed to the client-side compile. Withheld
    // (never sent to the browser) when the lesson hides it on purpose.
    context: lesson.context && !lesson.hideContext ? lesson.context : undefined,
    hints: lesson.hints,
    grader: course.grader,
    opt: lesson.opt,
    prev: prev ? { slug: prev.slug, title: prev.title } : null,
    next: next ? { slug: next.slug, title: next.title } : null,
  };

  return (
    <>
      <JsonLd
        data={[
          lessonLd({
            slug: lesson.slug,
            course: lesson.course,
            title: lesson.title,
            description: stripMarkdown(lesson.brief),
            concepts: lesson.concepts,
            difficulty: lesson.difficulty,
            concept: lesson.concept ?? false,
          }),
          breadcrumbLd([
            { name: "Decomp Academy", url: SITE_URL },
            { name: course.title, url: `${SITE_URL}/#curriculum` },
            { name: chapterTitle, url: `${SITE_URL}/#curriculum` },
            { name: lesson.title, url: `${SITE_URL}${lessonPath(lesson.course, lesson.slug)}` },
          ]),
        ]}
      />
      <LessonWorkspace lesson={dto} />
    </>
  );
}
