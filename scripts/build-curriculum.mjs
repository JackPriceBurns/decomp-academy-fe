// Build-time loader: reads the Markdown lesson tree under src/curriculum/ and
// emits importable JSON artifacts under src/curriculum/generated/. Runs from
// npm "predev"/"prebuild" so the JSON is always fresh before Next builds.
//
// Why JSON and not runtime fs: the client navigation list (registry.client.ts)
// runs in the browser where fs is unavailable, and Next won't reliably bundle
// arbitrary fs-read .md files into the Amplify SSR output. Compiling to JSON at
// build time makes the data a normal import — and lets us ship a slim,
// solution-free list to the browser.

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseChapterFile, parseLessonFile } from "./curriculum-format.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "src", "curriculum");
const outDir = join(root, "generated");

const ORDER_PREFIX = /^([0-9.]+)-/;
// Chapter folders are "<order>-<id>" (e.g. 01-foundations); the id is what
// lessons and routes reference, the order drives the curriculum sequence.
const CHAPTER_DIR = /^(\d+)-(.+)$/;

const chapters = [];
const lessons = [];

for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name === "generated") continue;
  const dir = join(root, entry.name);
  const files = readdirSync(dir);
  if (!files.includes("_chapter.md")) continue; // not a chapter (e.g. legacy dirs)

  const cm = entry.name.match(CHAPTER_DIR);
  if (!cm) throw new Error(`Chapter folder missing "<order>-" prefix: ${entry.name}`);
  const chOrder = parseInt(cm[1], 10);
  const chId = cm[2];

  chapters.push(parseChapterFile(readFileSync(join(dir, "_chapter.md"), "utf8"), { id: chId, order: chOrder }));

  for (const file of files) {
    if (file === "_chapter.md" || !file.endsWith(".md")) continue;
    const m = file.match(ORDER_PREFIX);
    if (!m) throw new Error(`Lesson file missing "<order>-" prefix: ${entry.name}/${file}`);
    const order = parseFloat(m[1]);
    lessons.push(parseLessonFile(readFileSync(join(dir, file), "utf8"), { chapter: chId, order }));
  }
}

// Canonical order: chapter order, then in-chapter order.
const chapterOrder = new Map(chapters.map((c) => [c.id, c.order]));
chapters.sort((a, b) => a.order - b.order);
lessons.sort((a, b) => {
  const ca = chapterOrder.get(a.chapter) ?? 999;
  const cb = chapterOrder.get(b.chapter) ?? 999;
  return ca !== cb ? ca - cb : a.order - b.order;
});

const slim = lessons.map((l) => ({
  id: l.id,
  title: l.title,
  chapter: l.chapter,
  order: l.order,
  difficulty: l.difficulty,
  concepts: l.concepts,
  ...(l.concept ? { concept: true } : {}),
}));

mkdirSync(outDir, { recursive: true });
const write = (name, data) => writeFileSync(join(outDir, name), `${JSON.stringify(data, null, 2)}\n`);
write("chapters.json", chapters);
write("lessons.json", lessons);
write("lessons.client.json", slim);

console.log(`Built curriculum: ${chapters.length} chapters, ${lessons.length} lessons -> src/curriculum/generated/`);
