"use server";

import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { requireOrganization } from "@/lib/session";
import { createId } from "@/lib/id";

const taskInputSchema = z.object({
  title: z.string().min(1),
  status: z.enum(["todo", "in-progress", "done"]),
  assignee: z.string().min(1),
});

export async function listTasks() {
  const organization = await requireOrganization();

  return db
    .select()
    .from(tasks)
    .where(eq(tasks.organizationId, organization.id))
    .orderBy(desc(tasks.createdAt));
}

export async function createTask(input: z.infer<typeof taskInputSchema>) {
  const organization = await requireOrganization();
  const data = taskInputSchema.parse(input);

  await db.insert(tasks).values({
    id: createId(),
    organizationId: organization.id,
    ...data,
  });
}

export async function updateTask(id: string, input: z.infer<typeof taskInputSchema>) {
  const organization = await requireOrganization();
  const data = taskInputSchema.parse(input);

  await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.organizationId, organization.id)));
}

export async function deleteTask(id: string) {
  const organization = await requireOrganization();

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.organizationId, organization.id)));
}
