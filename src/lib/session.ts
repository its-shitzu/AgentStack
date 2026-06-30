import "server-only";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { organizationMembers, organizations } from "@/db/schema";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/**
 * Returns the user's first organization. AgentStack ships with a "personal
 * org per user" model — swap this for an active-org selector if you add
 * multi-org switching later.
 */
export async function getCurrentOrganization() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [membership] = await db
    .select({ organization: organizations })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, user.id))
    .limit(1);

  return membership?.organization ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireOrganization() {
  const organization = await getCurrentOrganization();
  if (!organization) {
    throw new Error("NO_ORGANIZATION");
  }
  return organization;
}
