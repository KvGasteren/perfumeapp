// app/(routes)/allergens/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Allergens } from "@/services/allergens";
import { useToast } from "@/components/ui/toast/ToastProvider";

export default function NewAllergenPage() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      push({ title: "Name is required" });
      return;
    }
    setSaving(true);
    try {
      const created = await Allergens.create({ name: trimmed });
      push({ title: "Allergen created" });
      router.push(`/allergens/${created.id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      push({ title: "Create failed", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New allergen" />

      <section className="rounded-lg border bg-white p-4">
        <label className="form-label">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </section>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
