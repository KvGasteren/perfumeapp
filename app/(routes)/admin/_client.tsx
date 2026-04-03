"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Table, THead, TH, TR, TD } from "@/components/ui/Table";

type ClerkUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
};

export function AdminUsersClient({ users }: { users: ClerkUser[] }) {
  const router = useRouter();

  async function viewAs(userId: string) {
    await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    router.push("/ingredients");
    router.refresh();
  }

  return (
    <Table>
      <THead>
        <TR>
          <TH>Name</TH>
          <TH>Email</TH>
          <TH>Role</TH>
          <TH>User ID</TH>
          <TH>{""}</TH>
        </TR>
      </THead>
      <tbody>
        {users.map((user) => (
          <TR key={user.id}>
            <TD>{[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}</TD>
            <TD>{user.email}</TD>
            <TD>{user.role || "user"}</TD>
            <TD className="font-mono text-xs text-neutral-400">{user.id}</TD>
            <TD className="text-right">
              <Button variant="ghost" onClick={() => viewAs(user.id)}>
                View as
              </Button>
            </TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
