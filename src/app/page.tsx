import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { PricingTable } from "@/components/marketing/pricing-table";
import { pricingPlans } from "@/config/pricing";

export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <section className="px-6 pb-24">
        <h2 className="mb-8 text-center text-2xl font-semibold">Simple pricing</h2>
        <PricingTable plans={pricingPlans} />
      </section>
    </div>
  );
}
