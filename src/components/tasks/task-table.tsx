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
import { TaskForm } from "./task-form";
import { deleteTask } from "@/app/(dashboard)/dashboard/tasks/actions";
import type { tasks } from "@/db/schema";

type Task = typeof tasks.$inferSelect;

const statusVariant = {
  todo: "secondary",
  "in-progress": "default",
  done: "success",
} as const;

export function TaskTable({ tasks: rows }: { tasks: Task[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTask(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New task</DialogTitle>
            </DialogHeader>
            <TaskForm onSuccess={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        rows={rows}
        emptyMessage="No tasks yet."
        columns={[
          {
            header: "Title",
            cell: (row) => row.title,
          },
          {
            header: "Status",
            cell: (row) => <Badge variant={statusVariant[row.status]}>{row.status}</Badge>,
          },
          {
            header: "Assignee",
            cell: (row) => row.assignee,
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
                      <DialogTitle>Edit task</DialogTitle>
                    </DialogHeader>
                    <TaskForm task={row} onSuccess={() => setEditing(null)} />
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
