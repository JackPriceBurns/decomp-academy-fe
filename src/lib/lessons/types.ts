import { Instruction } from "../asm";

/** A curriculum "act" grouping consecutive chapters on the map. Defined by a
 *  _tier.md at src/curriculum/<NN>-<id>/ — order and grouping come from folders. */
export interface Tier {
  id: string;
  title: string;
  /** One-line summary shown beside the tier heading. */
  blurb: string;
  /** Display order. */
  order: number;
}

export interface Chapter {
  id: string;
  title: string;
  /** One-line summary shown on the curriculum map. */
  blurb: string;
  /** Display order. */
  order: number;
  /** id of the parent tier (from the enclosing _tier.md folder). */
  tier: string;
}

export interface LessonSource {
  id: string;
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
