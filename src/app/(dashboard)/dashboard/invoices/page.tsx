import { listInvoices } from "./actions";
import { InvoiceTable } from "@/components/invoices/invoice-table";

export default async function InvoicesPage() {
  const invoices = await listInvoices();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-sm text-neutral-500">Manage your organization&apos;s invoices.</p>
      </div>

      <InvoiceTable invoices={invoices} />
    </div>
  );
}
