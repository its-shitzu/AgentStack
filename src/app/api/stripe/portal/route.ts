import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireOrganization } from "@/lib/session";
import { siteConfig } from "@/config/site";

export async function POST() {
  let organization;
  try {
    organization = await requireOrganization();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!organization.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer for this organization" }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: organization.stripeCustomerId,
    return_url: `${siteConfig.url}/dashboard/settings/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
