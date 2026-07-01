"use server";

import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { requireOrganization } from "@/lib/session";
import { createId } from "@/lib/id";

const invoiceInputSchema = z.object({
  amount: z.number().int().positive(),
  status: z.enum(["draft", "sent", "paid"]),
  dueDate: z.coerce.date(),
});

export async function listInvoices() {
  const organization = await requireOrganization();

  return db
    .select()
    .from(invoices)
    .where(eq(invoices.organizationId, organization.id))
    .orderBy(desc(invoices.createdAt));
}

export async function createInvoice(input: z.infer<typeof invoiceInputSchema>) {
  const organization = await requireOrganization();
  const data = invoiceInputSchema.parse(input);

  await db.insert(invoices).values({
    id: createId(),
    organizationId: organization.id,
    ...data,
  });
}

export async function updateInvoice(id: string, input: z.infer<typeof invoiceInputSchema>) {
  const organization = await requireOrganization();
  const data = invoiceInputSchema.parse(input);

  await db
    .update(invoices)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(invoices.id, id), eq(invoices.organizationId, organization.id)));
}

export async function deleteInvoice(id: string) {
  const organization = await requireOrganization();

  await db
    .delete(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.organizationId, organization.id)));
}
