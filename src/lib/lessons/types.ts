import { Instruction } from "../asm";

/** A self-contained learning track (e.g. "GameCube C"). Defined by a _course.md
 *  at src/curriculum/<NN>-<id>/ — order comes from the folder prefix. A learner
 *  picks one course; tiers/chapters/lessons all live under it. */
export interface Course {
  id: string;
  title: string;
  /** One-line summary shown on the course selector. */
  blurb: string;
  /** Display order. */
  order: number;
}

/** A curriculum "act" grouping consecutive chapters on the map. Defined by a
 *  _tier.md at src/curriculum/<NN>-<course>/<NN>-<id>/ — order and grouping come
 *  from folders. */
export interface Tier {
  id: string;
  title: string;
  /** One-line summary shown beside the tier heading. */
  blurb: string;
  /** Display order (within its course). */
  order: number;
  /** id of the enclosing course (from the parent _course.md folder). */
  course: string;
}

export interface Chapter {
  id: string;
  title: string;
  /** One-line summary shown on the curriculum map. */
  blurb: string;
  /** Display order (within its course). */
  order: number;
  /** id of the parent tier (from the enclosing _tier.md folder). */
  tier: string;
  /** id of the enclosing course. */
  course: string;
}

export interface LessonSource {
  id: string;
  /** Deterministic UUIDv5 of "<course>/<tier>/<chapter>/<slug>" — the stable key
   *  under which progress is stored on the server and in localStorage. (The
   *  pre-course id that progress migrates *from* lives in the frozen
   *  src/lib/lessons/legacy-progress-ids.json, not on the lesson.) */
  progressId: string;
  /** id of the enclosing course. */
  course: string;
  /** id of the enclosing tier. Needed to disambiguate `chapter`, whose id is
   *  only unique within a tier (two tiers can each have a "finale" chapter). */
  tier: string;
  chapter: string;
  order: number;
  title: string;
  /** 1 (intro) .. 5 (master). */
  difficulty: number;
  /** Short concept tags, e.g. ["registers", "arithmetic"]. */
  concepts: string[];
  /** Markdown lesson body shown in the left panel. */
  brief: string;
  /**
   * A reading-only lesson with no compile exercise (concepts, workflow, mindset).
   * For these, symbol/starter/solution may be empty and the editor is hidden.
   */
  concept?: boolean;
  /** Name of the function the learner must reproduce. */
  symbol: string;
  /** Extra preamble injected before the user code at compile time. */
  context?: string;
  /**
   * Hide the `context` preamble from the learner: no context tab in the
   * workspace, and the preamble is NOT prepended to the learner's submission
   * (so they must declare the types themselves). The reference target is still
   * compiled with the context, so the goal asm is unchanged. Use sparingly, for
   * lessons whose point is to reverse-engineer the struct/types.
   */
  hideContext?: boolean;
  /** Code the editor starts with. */
  starter: string;
  /** Authoritative reference C — compiled to produce the target asm. */
  solution: string;
  /** Progressive hints. */
  hints: string[];
  /** MWCC flag overrides appended after the base set (e.g. pragmas/opt). */
  extraFlags?: string[];
}

export interface Lesson extends LessonSource {
  /** Precomputed, normalized target instructions (filled by the generator). */
  target: Instruction[];
}
