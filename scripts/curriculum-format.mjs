// Shared (de)serialization for the Markdown lesson format. Used by both the
// one-time exporter (scripts/export-lessons.mts) and the build-time loader
// (scripts/build-curriculum.mjs) so the on-disk format has a single source of
// truth.
//
// File shape — src/curriculum/<chapter>/<NNN>-<slug>.md:
//   ---
//   <YAML frontmatter: id, title, difficulty, concepts, symbol, [concept],
//    [hideContext], [opt], hints>
//   ---
//   <brief markdown body — may contain its own ```asm / ```c illustrative fences>
//
//   <!-- starter -->            // optional, HTML-comment marker (invisible)
//   ```c
//   ...left-aligned C...
//   ```
//   <!-- solution --> / <!-- context -->  // same shape, optional
//
// chapter is the folder name; order is the NNN filename prefix.

import YAML from "yaml";

// C-code fields that live in the body as marker-tagged ```c blocks.
export const CODE_FIELDS = ["starter", "solution", "context"];

/** Slug = id with the leading "<chapter>-" stripped (fallback: the full id). */
export function lessonSlug(id, chapter) {
  const prefix = `${chapter}-`;
  return id.startsWith(prefix) ? id.slice(prefix.length) : id;
}

/** "<NNN>-<slug>.md" — zero-padded order so files sort in curriculum order.
 *  A few lessons use a fractional order (e.g. 8.5, inserted between 8 and 9);
 *  pad the integer part only so "008.5" still sorts between "008" and "009". */
export function lessonFilename(id, chapter, order) {
  const [intPart, frac] = String(order).split(".");
  const prefix = intPart.padStart(3, "0") + (frac ? `.${frac}` : "");
  return `${prefix}-${lessonSlug(id, chapter)}.md`;
}

function fence(name, value) {
  // Drop trailing newlines; the loader re-adds a single one.
  return `<!-- ${name} -->\n\`\`\`c\n${value.replace(/\n+$/, "")}\n\`\`\``;
}

/** Serialize a full LessonSource object to Markdown file content. */
export function formatLesson(lesson) {
  const fm = {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    difficulty: lesson.difficulty,
    concepts: lesson.concepts ?? [],
  };
  // symbol/hints are absent for reading-only (concept) lessons; omit when empty.
  if (lesson.symbol) fm.symbol = lesson.symbol;
  if (lesson.concept) fm.concept = true;
  if (lesson.hideContext) fm.hideContext = true;
  if (lesson.opt) fm.opt = lesson.opt;
  if (lesson.peephole === false) fm.peephole = false;
  if (lesson.schedule === false) fm.schedule = false;
  if (lesson.hints && lesson.hints.length) fm.hints = lesson.hints;

  const sections = [`---\n${YAML.stringify(fm).trimEnd()}\n---`, (lesson.brief ?? "").trim()];
  for (const field of CODE_FIELDS) {
    const value = lesson[field];
    if (value && value.trim()) sections.push(fence(field, value));
  }
  return `${sections.join("\n\n")}\n`;
}

/** Serialize a Chapter to its _chapter.md content. Order lives in the folder
 *  prefix (NN-<id>), so it is not written to frontmatter. */
export function formatChapter(chapter) {
  const fm = { title: chapter.title, blurb: chapter.blurb };
  return `---\n${YAML.stringify(fm).trimEnd()}\n---\n`;
}

/** Serialize a Tier to its _tier.md content. Same shape as a chapter. */
export function formatTier(tier) {
  const fm = { title: tier.title, blurb: tier.blurb };
  return `---\n${YAML.stringify(fm).trimEnd()}\n---\n`;
}

/** Serialize a Course to its _course.md content. Same shape as a tier. */
export function formatCourse(course) {
  const fm = { title: course.title, blurb: course.blurb, grader: course.grader };
  return `---\n${YAML.stringify(fm).trimEnd()}\n---\n`;
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
const CODE_BLOCK_RE =
  /<!--\s*(starter|solution|context)\s*-->\s*\n```[a-zA-Z0-9]*\n([\s\S]*?)\n```/g;

/** Split raw file content into { data, body }. */
function splitFrontmatter(raw) {
  const m = raw.match(FRONTMATTER_RE);
  if (!m) throw new Error("missing or malformed YAML frontmatter");
  return { data: YAML.parse(m[1]) ?? {}, body: m[2] };
}

/**
 * Parse a lesson Markdown file back into a LessonSource.
 * chapter (folder) and order (filename prefix) are supplied by the caller.
 */
export function parseLessonFile(raw, { chapter, order }) {
  const { data, body } = splitFrontmatter(raw);

  const code = {};
  const brief = body
    .replace(CODE_BLOCK_RE, (_, name, content) => {
      code[name] = content;
      return "";
    })
    .trim();

  const lesson = {
    // `id` is the lesson's permanent UUID identity (the progress/storage key);
    // `slug` is the human, path-independent URL string. Renaming/moving a lesson
    // changes its slug/path but never its id, so progress survives reorgs.
    id: data.id,
    slug: data.slug,
    chapter,
    order,
    title: data.title,
    difficulty: data.difficulty,
    concepts: data.concepts ?? [],
    brief,
    symbol: data.symbol ?? "",
    starter: code.starter != null ? `${code.starter}\n` : "",
    solution: code.solution != null ? `${code.solution}\n` : "",
    hints: data.hints ?? [],
  };
  if (data.concept) lesson.concept = true;
  if (code.context != null) lesson.context = `${code.context}\n`;
  if (data.hideContext) lesson.hideContext = true;
  if (data.opt) lesson.opt = data.opt;
  // Codegen toggles (default enabled). Only carried when explicitly present, so
  // a lesson opts out of peephole/scheduling by setting the field to `false`.
  if (typeof data.peephole === "boolean") lesson.peephole = data.peephole;
  if (typeof data.schedule === "boolean") lesson.schedule = data.schedule;
  return lesson;
}

/** Parse a _chapter.md file into a Chapter. id and order come from the folder
 *  name (NN-<id>), supplied by the caller. tier is the parent tier folder's id,
 *  course the enclosing course folder's id. */
export function parseChapterFile(raw, { id, order, tier, course }) {
  const { data } = splitFrontmatter(raw);
  return { id, title: data.title, blurb: data.blurb, order, tier, course };
}

/** Parse a _tier.md file into a Tier. Same shape as a chapter (title + blurb);
 *  id and order come from the folder name (NN-<id>), supplied by the caller.
 *  course is the parent course folder's id. */
export function parseTierFile(raw, { id, order, course }) {
  const { data } = splitFrontmatter(raw);
  return { id, title: data.title, blurb: data.blurb, order, course };
}

/** Parse a _course.md file into a Course. Same shape as a tier (title + blurb)
 *  plus a `grader` selecting how its lessons compile; id and order come from the
 *  folder name (NN-<id>), supplied by the caller. */
export function parseCourseFile(raw, { id, order }) {
  const { data } = splitFrontmatter(raw);
  const graders = ["remote", "remote-ido53", "wasm-agbcc"];
  if (!graders.includes(data.grader)) {
    throw new Error(
      `Course "${id}" _course.md must set grader to one of ${graders.map((grader) => JSON.stringify(grader)).join(", ")} (got ${JSON.stringify(data.grader)})`,
    );
  }
  return {
    id,
    title: data.title,
    blurb: data.blurb,
    grader: data.grader,
    order,
  };
}

// renderMarkdown (src/lib/markdown.ts) only starts a list after a blank line, so
// a paragraph line that merely looks like a list item ("32767. Ask...", "- so
// the...") renders as part of the sentence. That's right for hard-wrapped prose
// but silently wrong for a real list missing its blank line, and the two look
// identical in the source — so reject both and make the author choose: add a
// blank line before the list, or rewrap so no line starts with a marker. Mirrors
// the renderer's block rules; returns the offending [previous, line] pairs.
const LIST_MARKER = /^([-*]|\d+\.)\s+/;
export function listMarkersInParagraphs(md) {
  const found = [];
  let fenced = false;
  let block = null; // "para" | "list" | null — what the previous line belongs to
  let prev = "";
  for (const line of md.split("\n")) {
    if (/^```/.test(line)) {
      fenced = !fenced;
      block = null;
    } else if (fenced) {
      continue;
    } else if (
      line.trim() === "" ||
      /^#{1,3}\s+/.test(line) ||
      /^>/.test(line) ||
      line.trim().startsWith("|")
    ) {
      block = null;
    } else if (LIST_MARKER.test(line)) {
      if (block === "para") found.push([prev, line]);
      block = "list";
    } else if (block !== "list") {
      block = "para"; // a non-marker line inside a list is that item's wrap
    }
    prev = line;
  }
  return found;
}
