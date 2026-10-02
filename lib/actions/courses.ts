"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin, getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import {
  courseSchema,
  chapterSchema,
  lessonSchema,
  type CourseInput,
  type ChapterInput,
  type LessonInput,
} from "@/lib/validators";

type Result = { ok: true } | { ok: false; error: string };

/** Vérifie que l'instructeur ne touche que ses cours (admin : tout). */
async function canEditCourse(courseId: string) {
  const user = await requireStaff();
  if (user.role === "ADMIN") return user;
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course || course.instructorId !== user.id) return null;
  return user;
}

export async function upsertCourse(
  input: CourseInput,
  id?: string,
): Promise<Result> {
  const user = await requireStaff();
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = {
    ...parsed.data,
    subtitle: parsed.data.subtitle || null,
    coverUrl: parsed.data.coverUrl || null,
    categoryId: parsed.data.categoryId || null,
  };
  if (id) {
    if (!(await canEditCourse(id))) return { ok: false, error: "Non autorisé" };
    await db.course.update({ where: { id }, data });
    await logActivity("course.update", "course", id, user.id);
  } else {
    // Un instructeur devient propriétaire du cours qu'il crée
    const instructorId = user.role === "INSTRUCTOR" ? user.id : null;
    const exists = await db.course.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (exists) return { ok: false, error: "Ce slug est déjà pris" };
    const c = await db.course.create({ data: { ...data, instructorId } });
    await logActivity("course.create", "course", c.id, user.id);
  }
  revalidatePath("/admin/courses");
  revalidatePath("/cours");
  return { ok: true };
}

export async function deleteCourse(id: string): Promise<Result> {
  const user = await requireAdmin(); // suppression réservée à l'admin
  const enr = await db.enrollment.count({ where: { courseId: id } });
  if (enr > 0)
    return { ok: false, error: `${enr} inscrit(s) — archivez plutôt le cours` };
  await db.course.delete({ where: { id } });
  await logActivity("course.delete", "course", id, user.id);
  revalidatePath("/admin/courses");
  return { ok: true };
}

// ─── Chapitres & leçons ───

export async function addChapter(
  courseId: string,
  input: ChapterInput,
): Promise<Result> {
  const user = await canEditCourse(courseId);
  if (!user) return { ok: false, error: "Non autorisé" };
  const parsed = chapterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const max = await db.chapter.aggregate({
    where: { courseId },
    _max: { position: true },
  });
  await db.chapter.create({
    data: {
      courseId,
      title: parsed.data.title,
      position: (max._max.position ?? -1) + 1,
    },
  });
  revalidatePath(`/admin/courses/${courseId}`);
  return { ok: true };
}

export async function deleteChapter(id: string, courseId: string): Promise<Result> {
  const user = await canEditCourse(courseId);
  if (!user) return { ok: false, error: "Non autorisé" };
  await db.chapter.delete({ where: { id } });
  revalidatePath(`/admin/courses/${courseId}`);
  return { ok: true };
}

export async function upsertLesson(
  chapterId: string,
  courseId: string,
  input: LessonInput,
  id?: string,
): Promise<Result> {
  const user = await canEditCourse(courseId);
  if (!user) return { ok: false, error: "Non autorisé" };
  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = { ...parsed.data, videoUrl: parsed.data.videoUrl || null };
  if (id) {
    await db.lesson.update({ where: { id }, data });
  } else {
    const max = await db.lesson.aggregate({
      where: { chapterId },
      _max: { position: true },
    });
    await db.lesson.create({
      data: { ...data, chapterId, position: (max._max.position ?? -1) + 1 },
    });
  }
  revalidatePath(`/admin/courses/${courseId}`);
  return { ok: true };
}

export async function deleteLesson(id: string, courseId: string): Promise<Result> {
  const user = await canEditCourse(courseId);
  if (!user) return { ok: false, error: "Non autorisé" };
  await db.lesson.delete({ where: { id } });
  revalidatePath(`/admin/courses/${courseId}`);
  return { ok: true };
}

export async function moveLesson(
  id: string,
  courseId: string,
  dir: "up" | "down",
): Promise<Result> {
  const user = await canEditCourse(courseId);
  if (!user) return { ok: false, error: "Non autorisé" };
  const lesson = await db.lesson.findUnique({ where: { id } });
  if (!lesson) return { ok: false, error: "Leçon introuvable" };
  const neighbor = await db.lesson.findFirst({
    where: {
      chapterId: lesson.chapterId,
      position: dir === "up" ? { lt: lesson.position } : { gt: lesson.position },
    },
    orderBy: { position: dir === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return { ok: true };
  await db.$transaction([
    db.lesson.update({ where: { id: lesson.id }, data: { position: neighbor.position } }),
    db.lesson.update({ where: { id: neighbor.id }, data: { position: lesson.position } }),
  ]);
  revalidatePath(`/admin/courses/${courseId}`);
  return { ok: true };
}

export async function getCurrentUser() {
  return getSessionUser();
}
