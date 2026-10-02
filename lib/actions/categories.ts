"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { categorySchema, type CategoryInput } from "@/lib/validators";

type Result = { ok: true } | { ok: false; error: string };

export async function upsertCategory(
  input: CategoryInput,
  id?: string,
): Promise<Result> {
  const user = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (id) {
    await db.category.update({ where: { id }, data: parsed.data });
    await logActivity("category.update", "category", id, user.id);
  } else {
    const exists = await db.category.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (exists) return { ok: false, error: "Slug déjà pris" };
    const c = await db.category.create({ data: parsed.data });
    await logActivity("category.create", "category", c.id, user.id);
  }
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  const user = await requireAdmin();
  const n = await db.course.count({ where: { categoryId: id } });
  if (n > 0)
    return { ok: false, error: `${n} cours rattaché(s) — retirez-les d'abord` };
  await db.category.delete({ where: { id } });
  await logActivity("category.delete", "category", id, user.id);
  revalidatePath("/admin/categories");
  return { ok: true };
}
