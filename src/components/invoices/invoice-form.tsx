"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvoice, updateInvoice } from "@/app/(dashboard)/dashboard/invoices/actions";
import type { invoices } from "@/db/schema";

type Invoice = typeof invoices.$inferSelect;

export function InvoiceForm({
  invoice,
  onSuccess,
}: {
  invoice?: Invoice;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(invoice ? (invoice.amount / 100).toString() : "");
  const [status, setStatus] = useState<"draft" | "sent" | "paid">(invoice?.status ?? "draft");
  const [dueDate, setDueDate] = useState(
    invoice ? invoice.dueDate.toISOString().slice(0, 10) : "",
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input = {
      amount: Math.round(Number(amount) * 100),
      status,
      dueDate: new Date(dueDate),
    };

    startTransition(async () => {
      try {
        if (invoice) {
          await updateInvoice(invoice.id, input);
        } else {
          await createInvoice(input);
        }
        router.refresh();
        onSuccess();
      } catch {
        setError("Unable to save invoice.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dueDate">Due date</Label>
        <Input
          id="dueDate"
          type="date"
          required
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : invoice ? "Save changes" : "Create invoice"}
      </Button>
    </form>
  );
}
