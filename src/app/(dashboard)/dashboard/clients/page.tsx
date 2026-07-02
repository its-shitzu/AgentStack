import { listClients } from "./actions";
import { ClientTable } from "@/components/clients/client-table";

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="text-sm text-neutral-500">Manage your organization&apos;s clients.</p>
      </div>

      <ClientTable clients={clients} />
    </div>
  );
}
