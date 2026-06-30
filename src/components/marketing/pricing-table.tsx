import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PricingPlan } from "@/config/pricing";

export function PricingTable({ plans }: { plans: PricingPlan[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id} className={cn(plan.highlighted && "border-neutral-900 shadow-md")}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <p className="pt-2 text-3xl font-bold">
              ${plan.price}
              <span className="text-sm font-normal text-neutral-500">/{plan.interval}</span>
            </p>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-neutral-900" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
              <Link href="/signup">Get started</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
