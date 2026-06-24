// Shared (de)serialization for the Markdown lesson format. Used by both the
// one-time exporter (scripts/export-lessons.mts) and the build-time loader
// (scripts/build-curriculum.mjs) so the on-disk format has a single source of
// truth.
//
// File shape — src/curriculum/<chapter>/<NNN>-<slug>.md:
//   ---
//   <YAML frontmatter: id, title, difficulty, concepts, symbol, [concept],
//    [extraFlags], hints>
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
    title: lesson.title,
    difficulty: lesson.difficulty,
    concepts: lesson.concepts ?? [],
  };
  // symbol/hints are absent for reading-only (concept) lessons; omit when empty.
  if (lesson.symbol) fm.symbol = lesson.symbol;
  if (lesson.concept) fm.concept = true;
  if (lesson.extraFlags && lesson.extraFlags.length) fm.extraFlags = lesson.extraFlags;
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

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
const CODE_BLOCK_RE = /<!--\s*(starter|solution|context)\s*-->\s*\n```[a-zA-Z0-9]*\n([\s\S]*?)\n```/g;

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
  const brief = body.replace(CODE_BLOCK_RE, (_, name, content) => {
    code[name] = content;
    return "";
  }).trim();

  const lesson = {
    id: data.id,
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
  if (data.extraFlags && data.extraFlags.length) lesson.extraFlags = data.extraFlags;
  return lesson;
}

/** Parse a _chapter.md file into a Chapter. id and order come from the folder
 *  name (NN-<id>), supplied by the caller. tier is the parent tier folder's id. */
export function parseChapterFile(raw, { id, order, tier }) {
  const { data } = splitFrontmatter(raw);
  return { id, title: data.title, blurb: data.blurb, order, tier };
}

/** Parse a _tier.md file into a Tier. Same shape as a chapter (title + blurb);
 *  id and order come from the folder name (NN-<id>), supplied by the caller. */
export function parseTierFile(raw, { id, order }) {
  const { data } = splitFrontmatter(raw);
  return { id, title: data.title, blurb: data.blurb, order };
}
