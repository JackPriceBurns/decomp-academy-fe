import { Chapter } from "@/lib/lessons/types";
import chapters from "./generated/chapters.json";

// The full ladder: knowing nothing -> MWCC GC/2.0 master. Compiled from each
// chapter's _chapter.md by scripts/build-curriculum.mjs, sorted by order.
export const CHAPTERS = chapters as unknown as Chapter[];

export const CHAPTER_BY_ID = new Map(CHAPTERS.map((c) => [c.id, c]));
