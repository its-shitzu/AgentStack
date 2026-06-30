import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { organizations, organizationMembers } from "@/db/schema";
import { createId } from "@/lib/id";
import { sendWelcomeEmail } from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Every new user gets a personal organization so the app stays
          // multi-tenant-ready without forcing an onboarding step.
          const orgId = createId();
          const slug = `${user.id.slice(0, 8)}-personal`;

          await db.insert(organizations).values({
            id: orgId,
            name: `${user.name}'s Organization`,
            slug,
            ownerId: user.id,
          });

          await db.insert(organizationMembers).values({
            id: createId(),
            organizationId: orgId,
            userId: user.id,
            role: "owner",
          });

          await sendWelcomeEmail({ to: user.email, name: user.name });
        },
      },
    },
  },
});
