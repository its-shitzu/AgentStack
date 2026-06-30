import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { organizations, subscriptions, users } from "@/db/schema";
import { createId } from "@/lib/id";
import { sendSubscriptionConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = session.metadata?.organizationId ?? session.client_reference_id;
      if (!organizationId || !session.subscription || !session.customer) break;

      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription.id;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;

      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      await upsertSubscriptionFromStripe(organizationId, customerId, stripeSubscription);
      await notifyOrganizationOwner(organizationId, stripeSubscription);
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const stripeSubscription = event.data.object as Stripe.Subscription;
      const [existing] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id))
        .limit(1);

      if (existing) {
        await db
          .update(subscriptions)
          .set({
            status: stripeSubscription.status,
            stripePriceId: stripeSubscription.items.data[0]?.price.id,
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, existing.id));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const stripeSubscription = event.data.object as Stripe.Subscription;
      await db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscription.id));
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscriptionFromStripe(
  organizationId: string,
  stripeCustomerId: string,
  stripeSubscription: Stripe.Subscription,
) {
  await db
    .update(organizations)
    .set({ stripeCustomerId })
    .where(eq(organizations.id, organizationId));

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, organizationId))
    .limit(1);

  const values = {
    stripeSubscriptionId: stripeSubscription.id,
    stripePriceId: stripeSubscription.items.data[0]?.price.id,
    status: stripeSubscription.status,
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(subscriptions).set(values).where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values({
      id: createId(),
      organizationId,
      ...values,
    });
  }
}

async function notifyOrganizationOwner(organizationId: string, stripeSubscription: Stripe.Subscription) {
  const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
  if (!org) return;

  const [owner] = await db.select().from(users).where(eq(users.id, org.ownerId)).limit(1);
  if (!owner) return;

  const priceId = stripeSubscription.items.data[0]?.price.id ?? "subscription";
  await sendSubscriptionConfirmationEmail({ to: owner.email, name: owner.name, planName: priceId });
}
