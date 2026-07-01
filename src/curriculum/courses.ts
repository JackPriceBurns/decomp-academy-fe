import { Course } from "@/lib/lessons/types";
import courses from "./generated/courses.json";

// The learning tracks offered by the site. Compiled from each course's
// _course.md by scripts/build-curriculum.mjs, sorted by order. Today there is
// one ("gamecube-c"); the folder-based system lets more be added without code.
export const COURSES = courses as Course[];

export const COURSE_BY_ID = new Map(COURSES.map((c) => [c.id, c]));

// The course a bare "/lesson/<id>" (and the home page) resolves to by default —
// the first one in curriculum order.
export const DEFAULT_COURSE = COURSES[0];
