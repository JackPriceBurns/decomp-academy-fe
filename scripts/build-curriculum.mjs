// Build-time loader: reads the Markdown curriculum tree under src/curriculum/
// and emits importable JSON artifacts under src/curriculum/generated/. Runs from
// npm "predev"/"prebuild" so the JSON is always fresh before Next builds.
//
// The tree is four levels of folder-and-file, each level ordered by its
// "<NN>-" filename prefix:
//
//   <NN>-<course>/              _course.md    (e.g. 01-gamecube-c)
//     <NN>-<tier>/              _tier.md      (e.g. 03-real-abi)
//       <NN>-<chapter>/         _chapter.md   (e.g. 11-abi)
//         <NNN>-<slug>.md       a lesson      (e.g. 001-arg-registers.md)
//
// Courses are independent ladders (a learner picks one). Tiers group chapters
// into the curriculum-map "acts" within a course; grouping and order come
// entirely from the folder names, so there is no hardcoded map to keep in sync.
//
// Why JSON and not runtime fs: the client navigation list (registry.client.ts)
// runs in the browser where fs is unavailable, and Next won't reliably bundle
// arbitrary fs-read .md files into the Amplify SSR output. Compiling to JSON at
// build time makes the data a normal import — and lets us ship a slim,
// solution-free list to the browser.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  lessonSlug,
  parseChapterFile,
  parseCourseFile,
  parseLessonFile,
  parseTierFile,
} from "./curriculum-format.mjs";

// Stable backend identity for a lesson: a deterministic UUIDv5 of its
// "<course>/<tier>/<chapter>/<slug>" path. We key server + local progress by
// this rather than the human slug so the wire format is an opaque, collision-free
// id (and a lesson keeps the same id across cosmetic title tweaks).
// Renaming/moving a lesson's course/tier/chapter/slug intentionally mints a new id.
//
// (The pre-course progressIds that existing data migrates *from* are a frozen
// one-time snapshot in src/lib/lessons/legacy-progress-ids.json — no longer
// recomputed here. See src/lib/progress.ts.)
const PROGRESS_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";
function uuidv5(name) {
  const ns = Buffer.from(PROGRESS_NAMESPACE.replace(/-/g, ""), "hex");
  const bytes = createHash("sha1").update(ns).update(name, "utf8").digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const h = bytes.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "src", "curriculum");
const outDir = join(root, "generated");

const ORDER_PREFIX = /^([0-9.]+)-/;
// Tier/chapter folders are "<order>-<id>" (e.g. 03-real-abi, 02-globals); the id
// is what data references. A folder prefix orders siblings *within* its parent
// only — chapter folders restart at 01 inside each tier. The global chapter
// number shown on the site (e.g. mastery = 17) is the running position across
// tiers, computed below, so contributors never hand-maintain global numbers.
const DIR_RE = /^(\d+)-(.+)$/;

const courses = [];
const tiers = [];
const chapters = [];
const lessons = [];

// Sorted dir listing so a numeric prefix collision surfaces deterministically.
const subdirs = (dir) =>
  readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

for (const courseEntry of subdirs(root)) {
  if (courseEntry.name === "generated") continue;
  const courseDir = join(root, courseEntry.name);
  if (!readdirSync(courseDir).includes("_course.md")) continue; // not a course folder

  const com = courseEntry.name.match(DIR_RE);
  if (!com) throw new Error(`Course folder missing "<order>-" prefix: ${courseEntry.name}`);
  const courseId = com[2];
  courses.push(
    parseCourseFile(readFileSync(join(courseDir, "_course.md"), "utf8"), {
      id: courseId,
      order: parseInt(com[1], 10),
    }),
  );

  // Chapter numbering (the "1, 2, 3…" shown on the map) restarts per course, so
  // the running counter is scoped here rather than spanning the whole tree.
  let globalChapterOrder = 0;

  for (const tierEntry of subdirs(courseDir)) {
    const tierDir = join(courseDir, tierEntry.name);
    if (!readdirSync(tierDir).includes("_tier.md")) continue; // not a tier folder

    const tm = tierEntry.name.match(DIR_RE);
    if (!tm)
      throw new Error(
        `Tier folder missing "<order>-" prefix: ${courseEntry.name}/${tierEntry.name}`,
      );
    const tierId = tm[2];
    tiers.push(
      parseTierFile(readFileSync(join(tierDir, "_tier.md"), "utf8"), {
        id: tierId,
        order: parseInt(tm[1], 10),
        course: courseId,
      }),
    );

    for (const chEntry of subdirs(tierDir)) {
      const dir = join(tierDir, chEntry.name);
      const files = readdirSync(dir);
      if (!files.includes("_chapter.md")) continue;

      const cm = chEntry.name.match(DIR_RE);
      if (!cm)
        throw new Error(
          `Chapter folder missing "<order>-" prefix: ${tierEntry.name}/${chEntry.name}`,
        );
      const chId = cm[2];
      // Tiers and chapters are walked in sorted-prefix order, so a running counter
      // yields the global (per-course) chapter number; the local folder prefix
      // only sequences chapters within their tier.
      const chOrder = ++globalChapterOrder;

      chapters.push(
        parseChapterFile(readFileSync(join(dir, "_chapter.md"), "utf8"), {
          id: chId,
          order: chOrder,
          tier: tierId,
          course: courseId,
        }),
      );

      for (const file of files) {
        if (file === "_chapter.md" || !file.endsWith(".md")) continue;
        const m = file.match(ORDER_PREFIX);
        if (!m) throw new Error(`Lesson file missing "<order>-" prefix: ${chEntry.name}/${file}`);
        const lesson = parseLessonFile(readFileSync(join(dir, file), "utf8"), {
          chapter: chId,
          order: parseFloat(m[1]),
        });
        lesson.course = courseId;
        // The enclosing tier. Chapter ids are only unique within a tier (e.g.
        // two "finale" chapters in different tiers), so a lesson is bound to its
        // chapter by (course, tier, chapter) — `chapter` alone is ambiguous.
        lesson.tier = tierId;
        const slug = lessonSlug(lesson.id, chId);
        // Stable key a learner's progress is filed under. `lessonSlug` strips the
        // numeric order prefix, so pure RENUMBERING is safe (the key is unchanged).
        // But the course slug, tier slug, chapter slug, and the lesson's
        // frontmatter `id` all feed the hash — renaming any of those folders,
        // moving a lesson between chapters, or editing `id` mints a NEW progressId.
        lesson.progressId = uuidv5(`${courseId}/${tierId}/${chId}/${slug}`);
        lessons.push(lesson);
      }
    }
  }
}

// A lesson is addressed by (course, id) — in URLs, getLesson, and static params
// — so a slug only needs to be unique within its course. Two courses may reuse
// the same slug; a collision *within* one course is the breaking case.
const seenKeys = new Set();
for (const l of lessons) {
  const key = `${l.course}/${l.id}`;
  if (seenKeys.has(key)) {
    throw new Error(
      `Duplicate lesson id "${l.id}" within course "${l.course}". Lesson ids must be unique within a course.`,
    );
  }
  seenKeys.add(key);
}

// Canonical order: course order, then chapter order, then in-chapter order.
// Chapter ids/orders restart per course, so the chapter-order lookup is keyed by
// "<course>/<chapter>" to stay unambiguous when courses share a chapter id.
const courseOrder = new Map(courses.map((c) => [c.id, c.order]));
const chapterOrder = new Map(chapters.map((c) => [`${c.course}/${c.id}`, c.order]));
courses.sort((a, b) => a.order - b.order);
tiers.sort((a, b) => courseOrder.get(a.course) - courseOrder.get(b.course) || a.order - b.order);
chapters.sort((a, b) => courseOrder.get(a.course) - courseOrder.get(b.course) || a.order - b.order);
lessons.sort((a, b) => {
  const co = (courseOrder.get(a.course) ?? 999) - (courseOrder.get(b.course) ?? 999);
  if (co) return co;
  const ca = chapterOrder.get(`${a.course}/${a.chapter}`) ?? 999;
  const cb = chapterOrder.get(`${b.course}/${b.chapter}`) ?? 999;
  return ca !== cb ? ca - cb : a.order - b.order;
});

const slim = lessons.map((l) => ({
  id: l.id,
  progressId: l.progressId,
  course: l.course,
  title: l.title,
  chapter: l.chapter,
  order: l.order,
  difficulty: l.difficulty,
  concepts: l.concepts,
  ...(l.concept ? { concept: true } : {}),
}));

mkdirSync(outDir, { recursive: true });
const write = (name, data) =>
  writeFileSync(join(outDir, name), `${JSON.stringify(data, null, 2)}\n`);
write("courses.json", courses);
write("tiers.json", tiers);
write("chapters.json", chapters);
write("lessons.json", lessons);
write("lessons.client.json", slim);

console.log(
  `Built curriculum: ${courses.length} course(s), ${tiers.length} tiers, ${chapters.length} chapters, ${lessons.length} lessons -> src/curriculum/generated/`,
);
