"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ExitImpersonationButton() {
  const router = useRouter();

  async function exit() {
    await fetch("/api/admin/impersonate", { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={exit}>
      Exit
    </Button>
  );
}
