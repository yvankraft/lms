import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "Titre trop court").max(120),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug invalide (a-z, 0-9, -)"),
  subtitle: z.string().max(200).optional().or(z.literal("")),
  description: z.string().default(""),
  coverUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  priceCents: z.coerce.number().int().min(0).default(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  categoryId: z.string().optional().nullable(),
});
export type CourseInput = z.infer<typeof courseSchema>;

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const chapterSchema = z.object({
  title: z.string().min(2).max(120),
});
export type ChapterInput = z.infer<typeof chapterSchema>;

export const lessonSchema = z.object({
  title: z.string().min(2).max(120),
  content: z.string().default(""),
  videoUrl: z.string().url().optional().or(z.literal("")),
  durationMin: z.coerce.number().int().min(0).default(0),
  freePreview: z.boolean().default(false),
});
export type LessonInput = z.infer<typeof lessonSchema>;

export const profileSchema = z.object({
  name: z.string().min(2).max(60),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  })
  .strict();
export type PasswordInput = z.infer<typeof passwordSchema>;
