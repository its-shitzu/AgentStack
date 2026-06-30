import { requireUser, requireOrganization } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireUser();
  const organization = await requireOrganization();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
        <p className="text-sm text-neutral-500">{organization.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>{organization.slug}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Manage your team in Settings → Organization</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>View your plan in Settings → Billing</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
