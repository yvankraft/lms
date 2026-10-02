"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

type Result = { ok: true } | { ok: false; error: string };

/** Inscription à un cours gratuit (les payants passent par le checkout). */
export async function enrollFree(courseId: string): Promise<Result> {
  const user = await requireUser();
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { status: true, priceCents: true, title: true },
  });
  if (!course || course.status !== "PUBLISHED")
    return { ok: false, error: "Cours indisponible" };
  if (course.priceCents > 0)
    return { ok: false, error: "Ce cours est payant — passez par le checkout" };
  try {
    await db.enrollment.create({ data: { userId: user.id, courseId } });
    await logActivity("enrollment.create", "course", courseId, user.id,
      `Inscription à « ${course.title} »`);
  } catch {
    return { ok: false, error: "Déjà inscrit" };
  }
  revalidatePath("/apprendre");
  revalidatePath(`/cours/${courseId}`);
  return { ok: true };
}

export async function unenroll(courseId: string): Promise<Result> {
  const user = await requireUser();
  await db.enrollment.deleteMany({
    where: { userId: user.id, courseId },
  });
  revalidatePath("/apprendre");
  return { ok: true };
}

/** Marque une leçon comme terminée / à refaire (toggle). */
export async function toggleLessonDone(
  lessonId: string,
  courseId: string,
): Promise<Result> {
  const user = await requireUser();
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  });
  if (!enrollment) return { ok: false, error: "Non inscrit à ce cours" };
  const existing = await db.lessonProgress.findUnique({
    where: {
      enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId },
    },
  });
  if (existing) {
    await db.lessonProgress.delete({ where: { id: existing.id } });
  } else {
    await db.lessonProgress.create({
      data: { enrollmentId: enrollment.id, lessonId },
    });
  }
  revalidatePath(`/apprendre/${courseId}`);
  return { ok: true };
}
