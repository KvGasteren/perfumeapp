/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(routes)/ingredients/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Ingredients } from "@/services/ingredients";
import { useToast } from "@/components/ui/toast/ToastProvider";

export default function NewIngredientPage() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  async function handleSave() {
    if (!name.trim()) {
      push({ title: "Name required" });
      return;
    }
    setSaving(true);
    try {
      const created = await Ingredients.create({ name: name.trim() });
      push({ title: "Ingredient created" });
      router.push(`/ingredients/${created.id}`);
    } catch (e: any) {
      push({ title: "Create failed", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New ingredient" />
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
