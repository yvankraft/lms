import { getAdminCourses, getCategories } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { CoursesTable } from "@/components/admin/courses-table";
import { CourseDialog } from "@/components/admin/course-dialog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cours" };

export default async function CoursesAdminPage() {
  const [courses, categories, user] = await Promise.all([
    getAdminCourses(),
    getCategories(),
    getSessionUser(),
  ]);
  // Un instructeur ne voit que ses cours
  const visible =
    user?.role === "INSTRUCTOR"
      ? courses.filter((c) => c.instructor?.name === user.name)
      : courses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl italic">Cours</h1>
        <CourseDialog categories={categories} />
      </div>
      <CoursesTable
        courses={visible}
        categories={categories}
        isAdmin={user?.role === "ADMIN"}
      />
    </div>
  );
}
