"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm } from "./client-form";
import { deleteClient } from "@/app/(dashboard)/dashboard/clients/actions";
import type { clients } from "@/db/schema";

type Client = typeof clients.$inferSelect;

export function ClientTable({ clients: rows }: { clients: Client[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteClient(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New client</DialogTitle>
            </DialogHeader>
            <ClientForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        rows={rows}
        emptyMessage="No clients yet."
        columns={[
          {
            header: "Name",
            cell: (row) => row.name,
          },
          {
            header: "Email",
            cell: (row) => row.email,
          },
          {
            header: "Company",
            cell: (row) => row.companyName,
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
                      <DialogTitle>Edit client</DialogTitle>
                    </DialogHeader>
                    <ClientForm client={row} onSuccess={() => setEditing(null)} />
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
