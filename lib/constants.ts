export const SITE = {
  name: "Lumina Academy",
  title: "Lumina Academy — Cours en ligne",
  description:
    "Plateforme de formation : cours vidéo, suivi de progression, instructeurs et certifications.",
  email: "hello@lumina-academy.dev",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Débutant",
  INTERMEDIATE: "Intermédiaire",
  ADVANCED: "Avancé",
};

export const COURSE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  REFUNDED: "Remboursée",
};
