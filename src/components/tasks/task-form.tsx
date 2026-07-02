"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTask, updateTask } from "@/app/(dashboard)/dashboard/tasks/actions";
import type { tasks } from "@/db/schema";

type Task = typeof tasks.$inferSelect;

export function TaskForm({
  task,
  onSuccess,
}: {
  task?: Task;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(task?.title ?? "");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(task?.status ?? "todo");
  const [assignee, setAssignee] = useState(task?.assignee ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input = { title, status, assignee };

    startTransition(async () => {
      try {
        if (task) {
          await updateTask(task.id, input);
        } else {
          await createTask(input);
        }
        router.refresh();
        onSuccess();
      } catch {
        setError("Unable to save task.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in-progress">In progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="assignee">Assignee</Label>
        <Input
          id="assignee"
          required
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : task ? "Save changes" : "Create task"}
      </Button>
    </form>
  );
}
