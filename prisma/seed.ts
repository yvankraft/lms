import "dotenv/config";
import { db } from "../lib/db";
import { auth } from "../lib/auth";

async function seed() {
  // ─── Utilisateurs ───
  const mkUser = async (email: string, name: string, role: string) => {
    await auth.api.signUpEmail({
      body: { email, name, password: "password123" },
    });
    const u = await db.user.update({ where: { email }, data: { role } });
    return u;
  };

  const existing = await db.user.count();
  if (existing === 0) {
    await mkUser("admin@example.com", "Admin", "ADMIN");
    await mkUser("nadia@example.com", "Nadia Ferreira", "INSTRUCTOR");
    await mkUser("karim@example.com", "Karim Benali", "INSTRUCTOR");
    await mkUser("lea@example.com", "Léa Martin", "STUDENT");
    await mkUser("hugo@example.com", "Hugo Petit", "STUDENT");
    console.log("users créés");
  }

  const [admin, nadia, karim, lea, hugo] = await Promise.all(
    ["admin@example.com", "nadia@example.com", "karim@example.com",
     "lea@example.com", "hugo@example.com"].map((e) =>
      db.user.findUniqueOrThrow({ where: { email: e } }),
    ),
  );

  // ─── Catégories ───
  const catData = [
    { slug: "dev", name: "Développement" },
    { slug: "design", name: "Design" },
    { slug: "business", name: "Business" },
    { slug: "data", name: "Data" },
  ];
  for (const c of catData)
    await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  const cats = await db.category.findMany();
  const cat = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // ─── Cours ───
  if ((await db.course.count()) === 0) {
    const courses = [
      {
        slug: "nextjs-de-zero",
        title: "Next.js de zéro à la production",
        subtitle: "App Router, Server Actions, auth et déploiement",
        description:
          "<p>Un parcours complet pour maîtriser Next.js moderne : App Router, composants serveur, Server Actions, authentification et mise en production.</p>",
        priceCents: 8900,
        level: "INTERMEDIATE" as const,
        status: "PUBLISHED" as const,
        categoryId: cat.dev,
        instructorId: nadia.id,
        chapters: [
          { title: "Fondations", lessons: [
            { title: "Installer et comprendre l'App Router", durationMin: 18, freePreview: true, content: "<p>Dans cette leçon nous installons Next.js et explorons la structure App Router…</p>" },
            { title: "Layouts, pages et navigation", durationMin: 24, content: "<p>Les layouts imbriqués sont la clé de voûte de l'App Router…</p>" },
            { title: "Server Components vs Client Components", durationMin: 31, content: "<p>Comprendre la frontière serveur/client…</p>" },
          ]},
          { title: "Données et mutations", lessons: [
            { title: "fetch, cache et revalidation", durationMin: 27, content: "<p>Le système de cache de Next.js en pratique…</p>" },
            { title: "Server Actions et formulaires", durationMin: 35, content: "<p>Les Server Actions remplacent vos API routes CRUD…</p>" },
            { title: "Streaming et Suspense", durationMin: 22, content: "<p>Améliorez le ressenti avec le streaming…</p>" },
          ]},
          { title: "Production", lessons: [
            { title: "Authentification avec Better Auth", durationMin: 40, content: "<p>Nous branchons Better Auth avec Prisma…</p>" },
            { title: "Déployer sur Vercel", durationMin: 15, content: "<p>Preview deployments, variables d'env, domaines…</p>" },
          ]},
        ],
      },
      {
        slug: "figma-design-system",
        title: "Design systems avec Figma",
        subtitle: "Tokens, composants et documentation vivante",
        description:
          "<p>Construisez un design system complet dans Figma : variables, styles, bibliothèques de composants et handoff développeurs.</p>",
        priceCents: 6900,
        level: "BEGINNER" as const,
        status: "PUBLISHED" as const,
        categoryId: cat.design,
        instructorId: karim.id,
        chapters: [
          { title: "Les bases", lessons: [
            { title: "Pourquoi un design system ?", durationMin: 12, freePreview: true, content: "<p>Le ROI d'un système de design cohérent…</p>" },
            { title: "Variables et tokens", durationMin: 28, content: "<p>Couleurs, espacements, typographies en variables…</p>" },
          ]},
          { title: "Composants", lessons: [
            { title: "Variants et auto-layout", durationMin: 33, content: "<p>Des composants qui s'adaptent à tout…</p>" },
            { title: "Documenter pour le handoff", durationMin: 19, content: "<p>Un système ne vit que s'il est documenté…</p>" },
          ]},
        ],
      },
      {
        slug: "sql-pratique",
        title: "SQL pratique pour analystes",
        subtitle: "Requêtes, jointures et fenêtres — gratuit",
        description:
          "<p>Cours gratuit : de SELECT aux fonctions fenêtres, avec des exercices sur des données réelles.</p>",
        priceCents: 0,
        level: "BEGINNER" as const,
        status: "PUBLISHED" as const,
        categoryId: cat.data,
        instructorId: admin.id,
        chapters: [
          { title: "Requêter", lessons: [
            { title: "SELECT, WHERE, ORDER BY", durationMin: 15, freePreview: true, content: "<p>Les fondations de toute requête…</p>" },
            { title: "JOIN : relier les tables", durationMin: 25, content: "<p>INNER, LEFT, RIGHT — quand et pourquoi…</p>" },
            { title: "GROUP BY et agrégats", durationMin: 20, content: "<p>Résumer des millions de lignes…</p>" },
          ]},
          { title: "Avancé", lessons: [
            { title: "Fonctions fenêtres", durationMin: 30, content: "<p>ROW_NUMBER, RANK, LAG/LEAD…</p>" },
            { title: "CTE et lisibilité", durationMin: 18, content: "<p>Écrire des requêtes que vos collègues reliront…</p>" },
          ]},
        ],
      },
      {
        slug: "freelance-avance",
        title: "Freelance : passer au niveau supérieur",
        subtitle: "Positionnement, prix, pipeline client",
        description: "<p>Stratégie complète pour freelances confirmés.</p>",
        priceCents: 14900,
        level: "ADVANCED" as const,
        status: "DRAFT" as const,
        categoryId: cat.business,
        instructorId: nadia.id,
        chapters: [
          { title: "Positionnement", lessons: [
            { title: "Trouver sa niche", durationMin: 22, content: "<p>Spécialiser sans se fermer…</p>" },
          ]},
        ],
      },
    ];

    for (const c of courses) {
      const { chapters, ...course } = c;
      const created = await db.course.create({ data: course });
      for (const [ci, ch] of chapters.entries()) {
        const chapter = await db.chapter.create({
          data: { courseId: created.id, title: ch.title, position: ci },
        });
        for (const [li, l] of ch.lessons.entries())
          await db.lesson.create({
            data: { ...l, chapterId: chapter.id, position: li },
          });
      }
    }
    console.log("4 cours créés avec chapitres et leçons");
  }

  // ─── Inscriptions + progression ───
  const nextCourse = await db.course.findUniqueOrThrow({
    where: { slug: "nextjs-de-zero" },
  });
  const sqlCourse = await db.course.findUniqueOrThrow({
    where: { slug: "sql-pratique" },
  });
  const figma = await db.course.findUniqueOrThrow({
    where: { slug: "figma-design-system" },
  });

  // Léa a acheté Next.js et suit le SQL gratuit
  if (await db.order.count() === 0) {
    await db.order.create({
      data: {
        userId: lea.id,
        courseId: nextCourse.id,
        amountCents: 8900,
        status: "PAID",
        stripePaymentId: "pi_seed_01",
      },
    });
    const e1 = await db.enrollment.create({
      data: { userId: lea.id, courseId: nextCourse.id },
    });
    const e2 = await db.enrollment.create({
      data: { userId: hugo.id, courseId: sqlCourse.id },
    });
    const e3 = await db.enrollment.create({
      data: { userId: lea.id, courseId: sqlCourse.id },
    });

    // Progression : Léa a fini le chapitre 1 de Next.js + 2 leçons SQL
    const nextLessons = await db.lesson.findMany({
      where: { chapter: { courseId: nextCourse.id } },
      orderBy: { position: "asc" },
      take: 3,
    });
    for (const l of nextLessons)
      await db.lessonProgress.create({
        data: { enrollmentId: e1.id, lessonId: l.id },
      });
    const sqlLessons = await db.lesson.findMany({
      where: { chapter: { courseId: sqlCourse.id } },
      take: 2,
    });
    for (const l of sqlLessons)
      await db.lessonProgress.createMany({
        data: [
          { enrollmentId: e2.id, lessonId: l.id },
          { enrollmentId: e3.id, lessonId: l.id },
        ],
      });
    // Hugo a aussi acheté Figma
    await db.order.create({
      data: {
        userId: hugo.id,
        courseId: figma.id,
        amountCents: 6900,
        status: "PAID",
        stripePaymentId: "pi_seed_02",
      },
    });
    await db.enrollment.create({
      data: { userId: hugo.id, courseId: figma.id },
    });
    console.log("2 commandes + 4 inscriptions + progression");
  }

  await db.activityLog.create({
    data: {
      action: "seed.run",
      entity: "system",
      userId: admin.id,
      detail: "Base initialisée avec données de démo",
    },
  });
  console.log("Seed LMS terminé. Login : admin@example.com / password123");
}

seed().finally(() => process.exit(0));
