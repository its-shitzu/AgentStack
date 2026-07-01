import { eq } from "drizzle-orm";
import { requireOrganization } from "@/lib/session";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { pricingPlans } from "@/config/pricing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingActions } from "./billing-actions";

export default async function BillingPage() {
  const organization = await requireOrganization();

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, organization.id))
    .limit(1);

  const currentPlan = pricingPlans.find((p) => p.stripePriceId === subscription?.stripePriceId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-neutral-500">Manage your subscription and payment details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            {currentPlan ? currentPlan.name : "No active subscription"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {subscription ? (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={subscription.status === "active" ? "success" : "secondary"}>
                {subscription.status}
              </Badge>
              {subscription.currentPeriodEnd && (
                <span className="text-neutral-500">
                  Renews {subscription.currentPeriodEnd.toLocaleDateString()}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              You are not subscribed to a plan yet. Pick one below to get started.
            </p>
          )}

          <BillingActions hasStripeCustomer={Boolean(organization.stripeCustomerId)} plans={pricingPlans} />
        </CardContent>
      </Card>
    </div>
  );
}
