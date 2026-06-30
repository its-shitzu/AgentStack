import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { getCurrentUser, requireOrganization } from "@/lib/session";
import { siteConfig } from "@/config/site";

const bodySchema = z.object({
  priceId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let organization;
  try {
    organization = await requireOrganization();
  } catch {
    return NextResponse.json({ error: "No organization for this user" }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: organization.stripeCustomerId ? undefined : user.email,
    customer: organization.stripeCustomerId ?? undefined,
    client_reference_id: organization.id,
    line_items: [{ price: parsed.data.priceId, quantity: 1 }],
    success_url: `${siteConfig.url}/dashboard/settings/billing?checkout=success`,
    cancel_url: `${siteConfig.url}/dashboard/settings/billing?checkout=canceled`,
    metadata: { organizationId: organization.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
