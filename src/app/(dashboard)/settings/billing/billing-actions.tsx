"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PricingPlan } from "@/config/pricing";

export function BillingActions({
  hasStripeCustomer,
  plans,
}: {
  hasStripeCustomer: boolean;
  plans: PricingPlan[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleCheckout(priceId: string) {
    setLoadingId(priceId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoadingId(null);
  }

  async function handlePortal() {
    setLoadingId("portal");
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoadingId(null);
  }

  if (hasStripeCustomer) {
    return (
      <Button onClick={handlePortal} disabled={loadingId === "portal"}>
        {loadingId === "portal" ? "Opening..." : "Manage billing"}
      </Button>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {plans.map((plan) => (
        <Button
          key={plan.id}
          variant="outline"
          onClick={() => handleCheckout(plan.stripePriceId)}
          disabled={loadingId === plan.stripePriceId}
        >
          {loadingId === plan.stripePriceId ? "Redirecting..." : `Subscribe to ${plan.name}`}
        </Button>
      ))}
    </div>
  );
}
