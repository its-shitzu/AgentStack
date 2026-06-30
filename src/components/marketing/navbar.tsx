import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 px-6">
      <Link href="/" className="font-semibold">
        {siteConfig.name}
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/pricing" className="text-sm text-neutral-600 hover:text-neutral-900">
          Pricing
        </Link>
        <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">
          Log in
        </Link>
        <Button asChild size="sm">
          <Link href="/signup">Get started</Link>
        </Button>
      </nav>
    </header>
  );
}
