import { Navbar } from "@/components/marketing/navbar";
import { PricingTable } from "@/components/marketing/pricing-table";
import { pricingPlans } from "@/config/pricing";

export default function PricingPage() {
  return (
    <div>
      <Navbar />
      <section className="px-6 py-24">
        <h1 className="mb-8 text-center text-3xl font-bold">Pricing</h1>
        <PricingTable plans={pricingPlans} />
      </section>
    </div>
  );
}
