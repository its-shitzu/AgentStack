"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InvoiceForm } from "./invoice-form";
import { deleteInvoice } from "@/app/(dashboard)/dashboard/invoices/actions";
import type { invoices } from "@/db/schema";

type Invoice = typeof invoices.$inferSelect;

const statusVariant = {
  draft: "secondary",
  sent: "default",
  paid: "success",
} as const;

export function InvoiceTable({ invoices: rows }: { invoices: Invoice[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteInvoice(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New invoice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        rows={rows}
        emptyMessage="No invoices yet."
        columns={[
          {
            header: "Amount",
            cell: (row) => `$${(row.amount / 100).toFixed(2)}`,
          },
          {
            header: "Status",
            cell: (row) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge>,
          },
          {
            header: "Due date",
            cell: (row) => row.dueDate.toLocaleDateString(),
          },
          {
            header: "Actions",
            cell: (row) => (
              <div className="flex gap-2">
                <Dialog
                  open={editing?.id === row.id}
                  onOpenChange={(open) => setEditing(open ? row : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit invoice</DialogTitle>
                    </DialogHeader>
                    <InvoiceForm invoice={row} onSuccess={() => setEditing(null)} />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
