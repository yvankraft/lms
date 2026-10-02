import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import type { Metadata } from "next";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { LessonNav } from "@/components/learn/lesson-nav";
import { MarkDoneButton } from "@/components/learn/mark-done";
import { getCourseBySlug, getEnrollment, courseProgress } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cours", robots: { index: false } };

export default async function LearnCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lecon?: string }>;
}) {
  const { slug } = await params;
  const { lecon } = await searchParams;
  const [course, user] = await Promise.all([
    getCourseBySlug(slug),
    getSessionUser(),
  ]);
  if (!course || course.status !== "PUBLISHED") notFound();
  if (!user) redirect(`/login?next=/apprendre/${slug}`);

  const enrollment = await getEnrollment(user.id, course.id);
  const unlocked = !!enrollment || user.role === "ADMIN" || user.role === "INSTRUCTOR";
  if (!enrollment && user.role === "STUDENT") redirect(`/cours/${slug}`);

  const allLessons = course.chapters.flatMap((c) => c.lessons);
  const lesson =
    allLessons.find((l) => l.id === lecon) ??
    allLessons.find((l) => unlocked || l.freePreview) ??
    allLessons[0];
  const accessible = unlocked || lesson?.freePreview;

  const doneIds = new Set(enrollment?.progress.map((p) => p.lessonId) ?? []);
  const { total, pct } = courseProgress(course, doneIds);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/apprendre"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Mes cours
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside>
          <h1 className="font-serif text-2xl italic">{course.title}</h1>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>
          <div className="mt-6">
            <LessonNav
              slug={slug}
              chapters={course.chapters}
              doneIds={doneIds}
              activeId={lesson?.id}
              unlocked={unlocked}
            />
          </div>
        </aside>

        <div>
          {lesson && accessible ? (
            <article>
              <h2 className="font-serif text-3xl italic">{lesson.title}</h2>
              {lesson.videoUrl && (
                <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-black">
                  <video
                    src={lesson.videoUrl}
                    controls
                    className="size-full"
                  />
                </div>
              )}
              {lesson.content ? (
                <div
                  className="prose prose-sm mt-6 max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              ) : (
                <Card className="mt-6">
                  <CardContent className="py-10 text-center text-muted-foreground">
                    Contenu en préparation.
                  </CardContent>
                </Card>
              )}
              {enrollment && (
                <div className="mt-8 flex items-center justify-between border-t pt-6">
                  <MarkDoneButton
                    lessonId={lesson.id}
                    courseId={course.id}
                    done={doneIds.has(lesson.id)}
                  />
                  <NextLesson
                    slug={slug}
                    lessons={allLessons}
                    currentId={lesson.id}
                    doneIds={doneIds}
                    unlocked={unlocked}
                  />
                </div>
              )}
            </article>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-20 text-center">
                <Lock className="size-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Cette leçon est réservée aux inscrits.
                </p>
              </CardContent>
            </Card>
          )}
          <p className="mt-8 text-xs text-muted-foreground">
            {total} leçons au total
          </p>
        </div>
      </div>
    </div>
  );
}

function NextLesson({
  slug,
  lessons,
  currentId,
  doneIds,
  unlocked,
}: {
  slug: string;
  lessons: { id: string; title: string; freePreview: boolean }[];
  currentId: string;
  doneIds: Set<string>;
  unlocked: boolean;
}) {
  const idx = lessons.findIndex((l) => l.id === currentId);
  const next = lessons.slice(idx + 1).find((l) => unlocked || l.freePreview);
  if (!next) return null;
  return (
    <Link
      href={`/apprendre/${slug}?lecon=${next.id}`}
      className="text-sm text-primary hover:underline"
    >
      Leçon suivante : {next.title} →
    </Link>
  );
}
