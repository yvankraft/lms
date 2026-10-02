import Link from "next/link";
import { GraduationCap, BookOpen, TrendingUp, Award } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { CourseCard } from "@/components/course/course-card";
import { getPublishedCourses, getCategories } from "@/lib/queries";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Cours structurés",
    desc: "Chapitres et leçons organisés, progression pas à pas.",
  },
  {
    icon: TrendingUp,
    title: "Suivi de progression",
    desc: "Chaque leçon terminée fait avancer votre barre de progression.",
  },
  {
    icon: Award,
    title: "Instructeurs experts",
    desc: "Des cours créés par des praticiens, pas des théoriciens.",
  },
];

export default async function HomePage() {
  const [courses, categories] = await Promise.all([
    getPublishedCourses(),
    getCategories(),
  ]);
  const featured = courses.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="py-24 text-center">
        <FadeIn>
          <GraduationCap className="mx-auto size-12 text-primary" />
          <h1 className="mt-6 font-serif text-5xl italic md:text-6xl">
            {SITE.name}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            {SITE.description}
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link href="/cours" className={buttonVariants({ size: "lg" })}>
              Explorer le catalogue
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Créer un compte
            </Link>
          </div>
        </FadeIn>
      </section>

      <FadeIn delay={0.1}>
        <section className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border p-6">
              <f.icon className="size-6 text-primary" />
              <h2 className="mt-3 font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </FadeIn>

      {featured.length > 0 && (
        <section className="mt-20">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl italic">Cours à la une</h2>
            <Link
              href="/cours"
              className="text-sm text-primary hover:underline"
            >
              Tout le catalogue →
            </Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-3xl italic">Parcourir par thème</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/cours?categorie=${cat.slug}`}
                className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                {cat.name}{" "}
                <span className="text-muted-foreground">
                  ({cat._count.courses})
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
