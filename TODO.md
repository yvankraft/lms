# TODO — lms

## Fait

- [x] Scaffold Next.js + Tailwind v4 + shadcn/ui (base-ui)
- [x] Prisma 7 + PostgreSQL (schema, adapter pg, client généré)
- [x] Better Auth + rôles ADMIN / INSTRUCTOR / STUDENT
- [x] Protection `/admin/*` (staff) et `/apprendre/*` (connecté) via
      `proxy.ts` + vérifications serveur par rôle
- [x] Thème violet distinct + dark mode
- [x] Catalogue public : `/cours` + filtres catégorie, cartes avec
      leçons/durée/inscrits/prix
- [x] Page cours : programme complet, aperçus gratuits, prix, CTA
      inscription/achat
- [x] Inscription gratuite (`enrollFree`) + achat payant
      (`checkoutCourse` → Stripe ou fallback dev)
- [x] Webhook Stripe `checkout.session.completed` → inscription
      idempotente
- [x] Lecteur `/apprendre/[slug]` : sidebar programme, vidéo + contenu,
      « marquer terminée », leçon suivante, leçons verrouillées
- [x] Dashboard élève `/apprendre` avec barres de progression
- [x] Admin : dashboard stats, CRUD cours + éditeur de cursus
      (chapitres/leçons, ordre, aperçu), catégories, commandes +
      remboursement Stripe, gestion des rôles, activité, paramètres
- [x] Instructeur restreint à ses propres cours
- [x] Seed : 5 users, 4 catégories, 4 cours (14 leçons), 2 commandes,
      4 inscriptions, progression
- [x] `.env.example`, README

## Améliorations possibles (hors périmètre du squelette)

- [ ] Quiz par leçon avec score minimum pour avancer
- [ ] Certificat PDF en fin de cours (React PDF / PDFKit)
- [ ] Avis et notes sur les cours (modération admin)
- [ ] Vidéos signées (Mux / Cloudflare Stream) au lieu d'URLs directes
- [ ] Codes promo sur le checkout
- [ ] Emails : bienvenue, rappel d'inactivité, fin de cours (Resend)
- [ ] Abonnement mensuel « all access » (Stripe subscription)
- [ ] Reprise de lecture (reprendre sur la dernière leçon vue)
- [ ] Commentaires/Q&A par leçon
