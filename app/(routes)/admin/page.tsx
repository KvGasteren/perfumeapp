import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/owner";
import { clerkClient } from "@clerk/nextjs/server";
import PageHeader from "@/components/PageHeader";
import { AdminUsersClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/");

  const client = await clerkClient();
  const { data: clerkUsers } = await client.users.getUserList({ limit: 100 });

  const users = clerkUsers.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.emailAddresses[0]?.emailAddress ?? "—",
    role: (u.publicMetadata?.role as string) ?? "",
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Admin — Users" />
      <AdminUsersClient users={users} />
    </div>
  );
}
