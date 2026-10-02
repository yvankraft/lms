import { db } from "@/lib/db";

// ─── Catalogue public ───

export function getPublishedCourses() {
  return db.course.findMany({
    where: { status: "PUBLISHED" },
    include: {
      category: true,
      instructor: { select: { name: true } },
      chapters: { include: { lessons: { select: { durationMin: true } } } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getCourseBySlug(slug: string) {
  return db.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: { select: { name: true, image: true } },
      chapters: {
        orderBy: { position: "asc" },
        include: { lessons: { orderBy: { position: "asc" } } },
      },
      _count: { select: { enrollments: true } },
    },
  });
}

export function getCategories() {
  return db.category.findMany({
    include: {
      _count: {
        select: { courses: { where: { status: "PUBLISHED" } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

// ─── Progression élève ───

export async function getEnrollment(userId: string, courseId: string) {
  return db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: { progress: { select: { lessonId: true } } },
  });
}

export function getMyEnrollments(userId: string) {
  return db.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          chapters: { include: { lessons: { select: { id: true } } } },
        },
      },
      progress: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export function courseProgress(
  course: { chapters: { lessons: { id: string }[] }[] },
  done: Set<string>,
) {
  const total = course.chapters.reduce((n, c) => n + c.lessons.length, 0);
  const completed = course.chapters.reduce(
    (n, c) => n + c.lessons.filter((l) => done.has(l.id)).length,
    0,
  );
  return { total, completed, pct: total ? Math.round((completed / total) * 100) : 0 };
}

// ─── Admin ───

export function getAdminCourses() {
  return db.course.findMany({
    include: {
      category: true,
      instructor: { select: { name: true } },
      _count: { select: { chapters: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getCourseForEdit(id: string) {
  return db.course.findUnique({
    where: { id },
    include: {
      chapters: {
        orderBy: { position: "asc" },
        include: { lessons: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export function getOrders() {
  return db.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getStats() {
  return Promise.all([
    db.course.count({ where: { status: "PUBLISHED" } }),
    db.enrollment.count(),
    db.order.aggregate({ _sum: { amountCents: true }, where: { status: "PAID" } }),
    db.user.count({ where: { role: "STUDENT" } }),
  ]);
}

export function getActivityLogs(take = 100) {
  return db.activityLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
}
