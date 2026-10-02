import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CurriculumEditor } from "@/components/admin/curriculum-editor";
import { CourseDialog } from "@/components/admin/course-dialog";
import { Badge } from "@/components/ui/badge";
import { getCourseForEdit, getCategories } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Programme du cours" };

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, categories, user] = await Promise.all([
    getCourseForEdit(id),
    getCategories(),
    getSessionUser(),
  ]);
  if (!course) notFound();
  // Un instructeur ne peut ouvrir que ses cours
  if (user?.role === "INSTRUCTOR" && course.instructorId !== user.id)
    redirect("/admin/courses");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/courses"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Tous les cours
      </Link>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl italic">{course.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">
              {COURSE_STATUS_LABELS[course.status]}
            </Badge>
            <span>
              {course.priceCents === 0
                ? "Gratuit"
                : formatPrice(course.priceCents)}
            </span>
            <span>·</span>
            <span>{course.chapters.length} chapitres</span>
          </div>
        </div>
        <CourseDialog course={course} categories={categories} />
      </div>

      <CurriculumEditor courseId={course.id} chapters={course.chapters} />
    </div>
  );
}
