import Stripe from "stripe";

let client: Stripe | null = null;

/** Client Stripe — null si STRIPE_SECRET_KEY absent (mode dév). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}
