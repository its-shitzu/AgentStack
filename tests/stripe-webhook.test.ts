import { describe, it, expect, vi, beforeEach } from "vitest";
import Stripe from "stripe";

vi.mock("@/db", () => {
  const subscriptionRows: Record<string, unknown>[] = [];
  return {
    db: {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => subscriptionRows,
          }),
        }),
      }),
      update: () => ({
        set: () => ({
          where: async () => undefined,
        }),
      }),
      insert: () => ({
        values: async () => undefined,
      }),
    },
  };
});

vi.mock("@/lib/email", () => ({
  sendSubscriptionConfirmationEmail: vi.fn(),
}));

const webhookSecret = "whsec_test_secret";
process.env.STRIPE_WEBHOOK_SECRET = webhookSecret;
process.env.STRIPE_SECRET_KEY = "sk_test_dummy";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });

function buildRequest(payload: string, signature: string) {
  return new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body: payload,
  });
}

describe("Stripe webhook", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("rejects a request with an invalid signature", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const payload = JSON.stringify({ type: "checkout.session.completed" });
    const res = await POST(buildRequest(payload, "invalid-signature") as never);
    expect(res.status).toBe(400);
  });

  it("accepts and processes a validly signed checkout.session.completed event", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");

    const payload = JSON.stringify({
      id: "evt_test",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test",
          object: "checkout.session",
          client_reference_id: "org_123",
          customer: "cus_123",
          subscription: "sub_123",
          metadata: { organizationId: "org_123" },
        },
      },
    });

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: webhookSecret,
    });

    const { stripe: stripeClient } = await import("@/lib/stripe");
    vi.spyOn(stripeClient.subscriptions, "retrieve").mockResolvedValue({
      id: "sub_123",
      status: "active",
      items: { data: [{ price: { id: "price_123" } }] },
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      cancel_at_period_end: false,
    } as never);

    const res = await POST(buildRequest(payload, signature) as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });
});
