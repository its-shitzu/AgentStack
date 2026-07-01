import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  status: text("status", { enum: ["draft", "sent", "paid"] })
    .notNull()
    .default("draft"),
  dueDate: timestamp("due_date").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
