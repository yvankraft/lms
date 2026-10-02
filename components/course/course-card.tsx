import Link from "next/link";
import { Clock, BookOpen, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LEVEL_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

type CourseCardData = {
  slug: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  priceCents: number;
  level: string;
  category: { name: string } | null;
  instructor: { name: string } | null;
  chapters: { lessons: { durationMin: number }[] }[];
  _count: { enrollments: number };
};

export function CourseCard({ course }: { course: CourseCardData }) {
  const lessons = course.chapters.reduce((n, c) => n + c.lessons.length, 0);
  const minutes = course.chapters.reduce(
    (n, c) => n + c.lessons.reduce((m, l) => m + l.durationMin, 0),
    0,
  );
  return (
    <Link href={`/cours/${course.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-lg">
        <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5">
          {course.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.coverUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <BookOpen className="size-10 text-primary/40" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs">
            {course.category && (
              <Badge variant="secondary">{course.category.name}</Badge>
            )}
            <Badge variant="outline">{LEVEL_LABELS[course.level]}</Badge>
          </div>
          <h3 className="mt-2 line-clamp-1 font-semibold group-hover:text-primary">
            {course.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {course.subtitle}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <BookOpen className="size-3.5" /> {lessons} leçons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" /> {Math.round(minutes / 60)}h
              </span>
              <span className="flex items-center gap-1">
                <Users className="size-3.5" /> {course._count.enrollments}
              </span>
            </span>
            <span className="text-sm font-semibold text-foreground">
              {course.priceCents === 0
                ? "Gratuit"
                : formatPrice(course.priceCents)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
