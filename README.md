# Lumina Academy — squelette LMS complet

Plateforme de formation en ligne **complète et livrable** : catalogue de
cours public, chapitres/leçons avec aperçus gratuits, inscription gratuite
ou achat via Stripe, lecteur de cours avec suivi de progression,
back-office `/admin` (rôles `ADMIN` / `INSTRUCTOR` / `STUDENT`).

## Stack

- Next.js (App Router) + Turbopack, TypeScript strict
- Tailwind CSS v4 + shadcn/ui (preset base-ui), next-themes
- Prisma 7 + PostgreSQL (driver adapter `@prisma/adapter-pg`)
- Auth : **Better Auth** (email + mot de passe), rôles `ADMIN` /
  `INSTRUCTOR` / `STUDENT`
- Stripe Checkout + webhook (fallback dev sans clés)
- TanStack Table, react-hook-form + zod, Server Actions
- Vercel Blob (couvertures de cours), pnpm

## Démarrage

```bash
cp .env.example .env    # renseigner DATABASE_URL et BETTER_AUTH_SECRET
pnpm install
pnpm db:push            # crée les tables
pnpm db:seed            # utilisateurs + 4 cours + inscriptions
pnpm dev
```

- Site public : http://localhost:3000
- Catalogue : http://localhost:3000/cours
- Mes cours : http://localhost:3000/apprendre (compte requis)
- Studio : http://localhost:3000/admin (ADMIN / INSTRUCTOR)

## Credentials (seed)

| Rôle        | Email                | Mot de passe  |
|-------------|----------------------|---------------|
| Admin       | `admin@example.com`  | `password123` |
| Instructeur | `nadia@example.com`  | `password123` |
| Instructeur | `karim@example.com`  | `password123` |
| Élève       | `lea@example.com`    | `password123` |
| Élève       | `hugo@example.com`   | `password123` |

Léa a acheté « Next.js de zéro à la production » (chapitre 1 terminé) et
suit « SQL pratique ». Hugo suit le cours Figma.

## Parcours

### Élève

1. `/cours` → catalogue filtrable par catégorie
2. `/cours/[slug]` → programme détaillé, prix, aperçus gratuits
3. Inscription gratuite en un clic, ou achat via `checkoutCourse`
   (Stripe Checkout, ou **paiement simulé** si `STRIPE_SECRET_KEY` absent)
4. `/apprendre` → ses cours avec barres de progression
5. `/apprendre/[slug]` → lecteur : sidebar programme, leçon (vidéo +
   contenu HTML), bouton « Marquer comme terminée », leçon suivante

### Instructeur

- `/admin/courses` : ne voit que **ses** cours (`canEditCourse` vérifie
  `instructorId` côté serveur sur chaque action)
- Édite le cours + tout le programme (chapitres, leçons, ordre, durée,
  aperçu gratuit)
- `/admin/users`, `/admin/orders`, `/admin/categories` → réservés à l'admin

### Admin

Dashboard (cours publiés, inscriptions, revenus, élèves), CRUD complet,
commandes + **remboursement** (Stripe refund réel + retrait de
l'inscription), gestion des rôles, journal d'activité.

## Modèle de données

```
User (ADMIN/INSTRUCTOR/STUDENT)
  ├── teaching → Course (instructorId)
  ├── enrollments → Enrollment ──→ LessonProgress (leçon ✓)
  └── orders → Order (PENDING/PAID/REFUNDED, stripeSessionId)

Course (slug, prix, niveau, statut, coverUrl)
  ├── category → Category
  └── chapters → Chapter → Lesson (contenu HTML, videoUrl, freePreview)
```

## Paiement

`POST /api/webhooks/stripe` traite `checkout.session.completed` →
`markOrderPaid` crée l'`Enrollment` (idempotent, transaction). Sans clés
Stripe, le checkout simule le paiement immédiatement — le tunnel complet
(commande → inscription → progression) se teste en local.

## Variables d'environnement

| Variable                | Obligatoire | Usage                          |
|-------------------------|-------------|--------------------------------|
| `DATABASE_URL`          | Oui         | PostgreSQL                     |
| `BETTER_AUTH_SECRET`    | Oui         | Secret de session              |
| `BETTER_AUTH_URL`       | Non         | URL de l'app                   |
| `STRIPE_SECRET_KEY`     | Non         | Paiement réel des cours        |
| `STRIPE_WEBHOOK_SECRET` | Non         | Confirmation de paiement       |
| `BLOB_READ_WRITE_TOKEN` | Non         | Upload couvertures             |
| `NEXT_PUBLIC_SITE_URL`  | Non         | SEO, sitemap                   |

## Thème

Identité **violet** (`#7c3aed` / accent `#a78bfa` en dark) — éducation et
connaissance, distincte des autres squelettes (cuivre, forêt, corail,
teal, indigo, océan, framboise).
