export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  stripePriceId: string;
  features: string[];
  highlighted?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For solo builders shipping their first product.",
    price: 19,
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_ID_STARTER ?? "",
    features: ["1 organization", "Up to 3 team members", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need more headroom.",
    price: 49,
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO ?? "",
    features: ["Unlimited organizations", "Up to 20 team members", "Priority support"],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For larger orgs with custom requirements.",
    price: 199,
    interval: "month",
    stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE ?? "",
    features: ["Unlimited everything", "SSO", "Dedicated support"],
  },
];
