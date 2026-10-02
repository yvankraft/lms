import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FadeIn } from "@/components/motion/fade-in";
import { buttonVariants } from "@/components/ui/button";
import { getMyEnrollments, courseProgress } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mes cours" };

export default async function LearnPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/apprendre");
  const enrollments = await getMyEnrollments(user.id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <FadeIn>
        <h1 className="font-serif text-4xl italic">Mes cours</h1>
        <p className="mt-2 text-muted-foreground">
          Reprenez là où vous étiez, {user.name}.
        </p>
      </FadeIn>

      {enrollments.length === 0 ? (
        <Card className="mt-10">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <GraduationCap className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">
              Vous n&apos;êtes inscrit à aucun cours pour le moment.
            </p>
            <Link href="/cours" className={buttonVariants()}>
              Explorer le catalogue
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {enrollments.map((e) => {
            const done = new Set(e.progress.map((p) => p.lessonId));
            const { total, completed, pct } = courseProgress(e.course, done);
            return (
              <Link key={e.id} href={`/apprendre/${e.course.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <p className="font-semibold">{e.course.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {e.course.instructor?.name ?? "Équipe pédagogique"}
                    </p>
                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                        <span>
                          {completed}/{total} leçons
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} />
                    </div>
                    {pct === 100 && (
                      <p className="mt-3 text-xs font-medium text-primary">
                        Cours terminé — félicitations !
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
