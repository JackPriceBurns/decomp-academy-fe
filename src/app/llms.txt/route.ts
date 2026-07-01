import { chaptersWithLessons, COURSES, LESSONS, TIERS } from "@/lib/lessons/registry";
import { lessonPath, SITE_URL } from "@/lib/seo";

// Served at /llms.txt — a plain-text, AI-friendly map of the whole site, built
// from the live curriculum so it never drifts. Follows the llms.txt convention:
// an H1 title, a blockquote summary, prose, then linked sections.
export const dynamic = "force-static";

export function GET() {
  const first = LESSONS[0];
  const lines: string[] = [];

  lines.push("# Decomp Academy", "");
  lines.push(
    "> Decomp Academy is a free, interactive course that teaches matching " +
      "decompilation of retro games: read the original assembly, write C, and the " +
      "real period compiler grades it byte for byte. Courses cover GameCube " +
      "(PowerPC, Metrowerks CodeWarrior) and Game Boy Advance (ARM/Thumb, agbcc).",
    "",
  );
  lines.push(
    'Decomp Academy teaches "matching decompilation": you read the assembly the ' +
      "retail compiler produced, write C, and the original compiler compiles and " +
      "diffs your code against the target instruction by instruction. When every " +
      "byte matches, the function is solved. The curriculum takes you from never " +
      "having read a register to matching real functions from games like Star Fox " +
      "Adventures and Klonoa: Empire of Dreams.",
    "",
  );
  lines.push(
    "- Audience: programmers learning reverse engineering and decompilation, " +
      "contributors to retro-game decompilation projects, and anyone curious how " +
      "C compiles down to machine code.",
    `- Format: ${LESSONS.length} hands-on lessons across ${COURSES.length} course${COURSES.length === 1 ? "" : "s"}, ` +
      "in the browser, free, with no signup required to start.",
    "- Topics: PowerPC and ARM/Thumb assembly, application binary interfaces, " +
      "compiler code generation, integer/float/bitwise idioms, stack frames, " +
      "globals, the optimizer, and complete real-game functions.",
    "",
  );

  lines.push("## Key pages");
  if (first) {
    lines.push(
      `- [Start the course](${SITE_URL}${lessonPath(first.course, first.id)}): the first lesson, from zero.`,
    );
  }
  lines.push(
    `- [Playground](${SITE_URL}/playground): compile arbitrary C with MWCC GC/2.0 and inspect the assembly it produces.`,
    `- [Glossary](${SITE_URL}/glossary): definitions of the PowerPC, ABI, and compiler terms used throughout.`,
    "",
  );

  lines.push("## Curriculum");
  // Tier and chapter ids restart per course, so everything below is scoped by
  // course — filtering chapters by `c.tier === t.id` alone would cross-join
  // same-id tiers/chapters across courses.
  for (const course of COURSES) {
    const courseChapters = chaptersWithLessons(course.id).filter((c) => c.lessons.length > 0);
    if (!courseChapters.length) continue;
    const courseTiers = TIERS.filter((t) => t.course === course.id).sort(
      (a, b) => a.order - b.order,
    );

    lines.push("", `### ${course.title} — ${course.blurb}`);
    for (const t of courseTiers) {
      const tierChapters = courseChapters
        .filter((c) => c.tier === t.id)
        .sort((a, b) => a.order - b.order);
      if (!tierChapters.length) continue;
      lines.push("", `#### ${t.title} — ${t.blurb}`);
      for (const c of tierChapters) {
        lines.push("", `##### ${c.title} — ${c.blurb}`);
        for (const l of c.lessons) {
          const tag = l.concepts?.length ? ` — ${l.concepts.join(", ")}` : "";
          lines.push(`- [${l.title}](${SITE_URL}${lessonPath(l.course, l.id)})${tag}`);
        }
      }
    }
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
