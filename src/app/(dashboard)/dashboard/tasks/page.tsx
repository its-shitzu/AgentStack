import { listTasks } from "./actions";
import { TaskTable } from "@/components/tasks/task-table";

export default async function TasksPage() {
  const tasks = await listTasks();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-sm text-neutral-500">Manage your organization&apos;s tasks.</p>
      </div>

      <TaskTable tasks={tasks} />
    </div>
  );
}
