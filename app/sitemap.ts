import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });
  return [
    { url: SITE.url, lastModified: new Date() },
    { url: `${SITE.url}/cours`, lastModified: new Date() },
    ...courses.map((c) => ({
      url: `${SITE.url}/cours/${c.slug}`,
      lastModified: c.updatedAt,
    })),
  ];
}
