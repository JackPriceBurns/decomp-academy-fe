import { LessonSource } from "@/lib/lessons/types";
import lessons from "./generated/lessons.json";

// Canonical lesson sources, compiled from the Markdown tree under
// src/curriculum/<chapter>/*.md by scripts/build-curriculum.mjs (run on
// predev/prebuild). Already in canonical order (chapter order, then in-chapter).
export const ALL_LESSON_SOURCES = lessons as unknown as LessonSource[];
