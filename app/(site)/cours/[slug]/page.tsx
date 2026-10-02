import { notFound } from "next/navigation";
import { Clock, BookOpen, Users, PlayCircle, Lock } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EnrollButton } from "@/components/course/enroll-button";
import { FadeIn } from "@/components/motion/fade-in";
import { getCourseBySlug, getEnrollment } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { LEVEL_LABELS, SITE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.subtitle ?? SITE.description,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [course, user] = await Promise.all([
    getCourseBySlug(slug),
    getSessionUser(),
  ]);
  if (!course || course.status !== "PUBLISHED") notFound();

  const enrollment = user ? await getEnrollment(user.id, course.id) : null;
  const lessons = course.chapters.reduce((n, c) => n + c.lessons.length, 0);
  const minutes = course.chapters.reduce(
    (n, c) => n + c.lessons.reduce((m, l) => m + l.durationMin, 0),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <FadeIn>
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex items-center gap-2 text-xs">
              {course.category && (
                <Badge variant="secondary">{course.category.name}</Badge>
              )}
              <Badge variant="outline">{LEVEL_LABELS[course.level]}</Badge>
            </div>
            <h1 className="mt-4 font-serif text-4xl italic">{course.title}</h1>
            {course.subtitle && (
              <p className="mt-3 text-lg text-muted-foreground">
                {course.subtitle}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4" /> {lessons} leçons
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" /> {Math.round(minutes / 60)}h de
                contenu
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4" /> {course._count.enrollments} inscrit
                {course._count.enrollments > 1 ? "s" : ""}
              </span>
              {course.instructor && (
                <span>par {course.instructor.name}</span>
              )}
            </div>
            {course.description && (
              <div
                className="prose prose-sm mt-8 max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            )}

            <h2 className="mt-10 font-serif text-2xl italic">Programme</h2>
            <div className="mt-4 space-y-3">
              {course.chapters.map((ch, i) => (
                <Card key={ch.id}>
                  <CardContent className="p-4">
                    <p className="font-medium">
                      <span className="text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}.
                      </span>{" "}
                      {ch.title}
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {ch.lessons.map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between text-muted-foreground"
                        >
                          <span className="flex items-center gap-2">
                            {l.freePreview || enrollment ? (
                              <PlayCircle className="size-4 text-primary" />
                            ) : (
                              <Lock className="size-4" />
                            )}
                            {l.title}
                            {l.freePreview && (
                              <Badge variant="outline" className="text-[10px]">
                                Aperçu gratuit
                              </Badge>
                            )}
                          </span>
                          {l.durationMin > 0 && (
                            <span className="text-xs">{l.durationMin} min</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden">
              <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5">
                {course.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.coverUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                )}
              </div>
              <CardContent className="p-5">
                <p className="font-serif text-3xl">
                  {course.priceCents === 0
                    ? "Gratuit"
                    : formatPrice(course.priceCents)}
                </p>
                {enrollment ? (
                  <Link
                    href={`/apprendre/${course.slug}`}
                    className={buttonVariants({ className: "mt-4 w-full", size: "lg" })}
                  >
                    Continuer le cours
                  </Link>
                ) : (
                  <div className="mt-4">
                    <EnrollButton
                      courseId={course.id}
                      courseSlug={course.slug}
                      priceCents={course.priceCents}
                      isLoggedIn={!!user}
                    />
                  </div>
                )}
                <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <li>Accès à vie, à votre rythme</li>
                  <li>{lessons} leçons en {course.chapters.length} chapitres</li>
                  <li>Suivi de progression inclus</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
