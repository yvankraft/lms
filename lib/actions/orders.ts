"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { SITE } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";

/** Marque une commande payée et crée l'inscription (idempotent). */
export async function markOrderPaid(
  orderId: string,
  stripePaymentId?: string,
): Promise<void> {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status === "PAID") return;
  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: { status: "PAID", stripePaymentId },
    }),
    db.enrollment.upsert({
      where: {
        userId_courseId: { userId: order.userId, courseId: order.courseId },
      },
      create: { userId: order.userId, courseId: order.courseId },
      update: {},
    }),
  ]);
  await logActivity("order.paid", "order", orderId, order.userId);
}

export async function refundOrder(orderId: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN") return { ok: false, error: "Réservé à l'admin" };
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PAID") return { ok: false, error: "Commande non remboursable" };
  const stripe = getStripe();
  if (stripe && order.stripePaymentId) {
    try {
      await stripe.refunds.create({ payment_intent: order.stripePaymentId });
    } catch {
      return { ok: false, error: "Remboursement Stripe refusé" };
    }
  }
  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status: "REFUNDED" } }),
    db.enrollment.deleteMany({
      where: { userId: order.userId, courseId: order.courseId },
    }),
  ]);
  await logActivity("order.refund", "order", orderId, user.id);
  return { ok: true };
}

/** Checkout : session Stripe si configuré, sinon activation directe (dev). */
export async function checkoutCourse(courseId: string): Promise<never> {
  const user = await requireUser();
  const hs = await headers();
  const ip = hs.get("x-forwarded-for") ?? "local";
  rateLimit(`checkout:${ip}`, 10, 60_000);

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "PUBLISHED") redirect("/cours");
  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });
  if (existing) redirect(`/apprendre/${course.slug}`);

  const order = await db.order.create({
    data: { userId: user.id, courseId, amountCents: course.priceCents },
  });
  const stripe = getStripe();
  if (!stripe) {
    // Dev : pas de Stripe → paiement simulé, inscription immédiate
    await markOrderPaid(order.id);
    await logActivity("order.dev_paid", "order", order.id, user.id,
      "Paiement simulé (STRIPE_SECRET_KEY absent)");
    redirect(`/apprendre/${course.slug}?paid=1`);
  }
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: course.priceCents,
          product_data: { name: course.title },
        },
      },
    ],
    metadata: { orderId: order.id },
    success_url: `${SITE.url}/apprendre/${course.slug}?paid=1`,
    cancel_url: `${SITE.url}/cours/${course.slug}`,
    customer_email: user.email,
  });
  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });
  redirect(session.url!);
}
