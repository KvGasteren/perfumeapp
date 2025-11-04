"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast/ToastProvider";

export default function NewAllergenClient() {
  const router = useRouter();
  const { push } = useToast();

  const [name, setName] = useState("");
  const [casNumber, setCasNumber] = useState("");
  const [maxConcentration, setMaxConcentration] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // build payload
      const payload: {
        name: string;
        casNumber?: string | null;
        maxConcentration?: number | null;
      } = {
        name: name.trim(),
      };

      const cas = casNumber.trim();
      if (cas) payload.casNumber = cas;

      const max = maxConcentration.trim();
      if (max !== "") {
        // user enters 0.0200 for 2%
        payload.maxConcentration = Number(max);
      }

      const res = await fetch("/api/allergens", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create allergen");
      }

      push({ title: "Allergen created" });
      router.push("/allergens");
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      push({ title: "Error", description: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New allergen"
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border bg-white p-4 space-y-4"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Name
          </label>
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Limonene"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            CAS number
          </label>
          <Input
            value={casNumber}
            onChange={(e) => setCasNumber(e.target.value)}
            placeholder="e.g. 138-86-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Max concentration
          </label>
          <Input
            type="number"
            step="0.0001"
            value={maxConcentration}
            onChange={(e) => setMaxConcentration(e.target.value)}
            placeholder="e.g. 0.0200"
          />
          <p className="mt-1 text-xs text-red-500">
            Store concentration as a decimal fraction (e.g. <code>0.0200</code> = 2%)
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Create allergen"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}