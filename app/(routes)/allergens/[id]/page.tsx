/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(routes)/allergens/[id]/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { Allergens } from "@/services/allergens";
import type { Allergen } from "@/lib/zodSchemas";

export default function AllergenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const router = useRouter();
  const { push } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [base, setBase] = useState<Allergen | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const a = await Allergens.byId(numericId);
        if (!cancelled) {
          setBase(a);
          setName(a.name);
        }
      } catch (e: any) {
        push({ title: "Error", description: e.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numericId, push]);

  const changed = useMemo(
    () => base && name.trim() !== base.name.trim(),
    [base, name]
  );

  async function save() {
    if (!base) return;
    if (!changed) return;
    setSaving(true);
    try {
      await Allergens.update(base.id, { name: name.trim() });
      push({ title: "Saved" });
      router.refresh();
    } catch (e: any) {
      push({ title: "Save failed", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!base) return;
    if (!confirm("Delete this allergen?")) return;
    try {
      await Allergens.remove(base.id);
      push({ title: "Deleted" });
      router.push("/allergens");
    } catch (e: any) {
      // e.g. API returns 422 if allergen is in use
      push({ title: "Cannot delete", description: e.message });
    }
  }

  if (loading) return <div className="text-sm text-neutral-500">Loading…</div>;
  if (!base) return <div className="text-sm text-neutral-500">Not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit allergen: ${base.name}`}
        actions={
          <div className="flex gap-2">
            <Button onClick={save} disabled={!changed || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="danger" onClick={remove}>
              Delete
            </Button>
          </div>
        }
      />

      <section className="rounded-lg border bg-white p-4">
        <label className="form-label">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </section>
    </div>
  );
}
