import type { Metadata } from "next";
import { CourseCard } from "@/components/course/course-card";
import { getPublishedCourses, getCategories } from "@/lib/queries";
import { FadeIn } from "@/components/motion/fade-in";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Catalogue",
  description: "Tous les cours disponibles",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  const [courses, categories] = await Promise.all([
    getPublishedCourses(),
    getCategories(),
  ]);
  const visible = categorie
    ? courses.filter((c) => c.category?.slug === categorie)
    : courses;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <FadeIn>
        <h1 className="font-serif text-4xl italic">Catalogue</h1>
        <p className="mt-2 text-muted-foreground">
          {visible.length} cours{visible.length > 1 ? "" : ""} disponible
          {visible.length > 1 ? "s" : ""}
        </p>
      </FadeIn>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/cours"
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm",
            !categorie && "border-primary bg-primary/10 text-primary",
          )}
        >
          Tous
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/cours?categorie=${cat.slug}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              categorie === cat.slug &&
                "border-primary bg-primary/10 text-primary",
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
      {visible.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">
          Aucun cours dans cette catégorie pour le moment.
        </p>
      )}
    </div>
  );
}
