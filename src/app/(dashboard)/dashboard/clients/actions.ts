"use server";

import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireOrganization } from "@/lib/session";
import { createId } from "@/lib/id";

const clientInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().min(1),
});

export async function listClients() {
  const organization = await requireOrganization();

  return db
    .select()
    .from(clients)
    .where(eq(clients.organizationId, organization.id))
    .orderBy(desc(clients.createdAt));
}

export async function createClient(input: z.infer<typeof clientInputSchema>) {
  const organization = await requireOrganization();
  const data = clientInputSchema.parse(input);

  await db.insert(clients).values({
    id: createId(),
    organizationId: organization.id,
    ...data,
  });
}

export async function updateClient(id: string, input: z.infer<typeof clientInputSchema>) {
  const organization = await requireOrganization();
  const data = clientInputSchema.parse(input);

  await db
    .update(clients)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(clients.id, id), eq(clients.organizationId, organization.id)));
}

export async function deleteClient(id: string) {
  const organization = await requireOrganization();

  await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.organizationId, organization.id)));
}
