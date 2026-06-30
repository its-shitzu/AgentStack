import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        The SaaS boilerplate built for AI agents, not just developers.
      </h1>
      <p className="max-w-xl text-lg text-neutral-600">
        Auth, billing, and a multi-tenant dashboard out of the box — plus Claude Code skills that
        let an agent extend your product for you.
      </p>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/signup">Get started for free</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/pricing">View pricing</Link>
        </Button>
      </div>
    </section>
  );
}
