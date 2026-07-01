import { chaptersWithLessons, COURSES, LESSONS, TIERS } from "@/lib/lessons/registry";
import { Curriculum, CourseView } from "@/components/homepage/Curriculum";
import { Hero } from "@/components/homepage/Hero";
import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { JsonLd } from "@/components/JsonLd";
import { courseLd, lessonPath } from "@/lib/seo";

export default function Home() {
  const courses: CourseView[] = COURSES.map((course) => {
    const chapters = chaptersWithLessons(course.id)
      .filter((c) => c.lessons.length > 0)
      .map((c) => ({
        id: c.id,
        title: c.title,
        blurb: c.blurb,
        order: c.order,
        tier: c.tier,
        lessons: c.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          order: l.order,
          difficulty: l.difficulty,
          concepts: l.concepts,
          concept: l.concept ?? false,
        })),
      }));

    const heatLessons = chapters.flatMap((c) => c.lessons);
    return {
      id: course.id,
      title: course.title,
      blurb: course.blurb,
      firstLessonId: chapters[0]?.lessons[0]?.id,
      tiers: TIERS.filter((t) => t.course === course.id),
      chapters,
      heatLessons,
    };
  }).filter((c) => c.chapters.length > 0);

  const total = LESSONS.length;
  const firstLesson = LESSONS[0];
  const startHref = firstLesson ? lessonPath(firstLesson.course, firstLesson.id) : "/";

  return (
    <main className="min-h-screen">
      <JsonLd data={courseLd()} />
      <Navbar />
      <Hero
        total={total}
        firstLesson={firstLesson ? { id: firstLesson.id, course: firstLesson.course } : undefined}
      />
      <Curriculum courses={courses} />
      <Footer startHref={startHref} />
    </main>
  );
}
