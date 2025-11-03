/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Ingredients } from "@/services/ingredients";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast/ToastProvider";
import type { Ingredient, AllergenLink } from "@/lib/zodSchemas";

export default function IngredientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { push } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [base, setBase] = useState<Ingredient | null>(null);
  const [draftName, setDraftName] = useState("");
  const [links, setLinks] = useState<AllergenLink[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [i, a] = await Promise.all([
          Ingredients.byId(numericId),
          Ingredients.listAllergens(numericId),
        ]);
        if (!cancelled) {
          setBase(i);
          setDraftName(i.name);
          setLinks(a);
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
    () => base && draftName.trim() !== base.name.trim(),
    [base, draftName]
  );

  async function saveAll() {
    if (!base) return;
    setSaving(true);
    try {
      if (changed)
        await Ingredients.update(base.id, { name: draftName.trim() });
      // No batch endpoint for allergens here; links are saved inline on change below.
      push({ title: "Saved" });
      router.refresh();
    } catch (e: any) {
      push({ title: "Save failed", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function onLinkChange(idx: number, next: AllergenLink) {
    setLinks((arr) => arr.map((l, i) => (i === idx ? next : l)));
    try {
      await Ingredients.upsertAllergen(numericId, {
        allergenId: next.allergenId,
        concentration: next.concentration,
      });
    } catch (e: any) {
      push({ title: "Failed", description: e.message });
    }
  }

  async function removeLink(idx: number) {
    const target = links[idx];
    setLinks((arr) => arr.filter((_, i) => i !== idx));
    try {
      await Ingredients.deleteAllergen(numericId, target.allergenId);
    } catch (e: any) {
      push({ title: "Failed", description: e.message });
    }
  }

  async function deleteIngredient() {
    if (!base) return;
    if (!confirm("Delete this ingredient?")) return;
    try {
      await Ingredients.remove(base.id);
      push({ title: "Deleted" });
      router.push("/ingredients");
    } catch (e: any) {
      push({ title: "Cannot delete", description: e.message });
    }
  }

  if (loading) return <div className="text-sm text-neutral-500">Loading…</div>;
  if (!base) return <div className="text-sm text-neutral-500">Not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${base.name}`}
        actions={
          <div className="flex gap-2">
            <Button onClick={saveAll} disabled={!changed || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="danger" onClick={deleteIngredient}>
              Delete
            </Button>
          </div>
        }
      />

      <section className="rounded-lg border bg-white p-4">
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          Name
        </label>
        <Input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
        />
      </section>

      <section className="rounded-lg border bg-white p-4">
        <div className="mb-3 text-sm font-medium">Allergens</div>
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={l.allergenId} className="flex items-center gap-3">
              <div className="min-w-0 flex-1 truncate text-sm">
                {l.name ?? `#${l.allergenId}`}
              </div>
              <Input
                type="number"
                step="0.01"
                className="w-32"
                value={String(l.concentration)}
                onChange={(e) =>
                  onLinkChange(i, {
                    ...l,
                    concentration: Number(e.target.value),
                  })
                }
              />
              <Button variant="ghost" onClick={() => removeLink(i)}>
                Remove
              </Button>
            </div>
          ))}
          {links.length === 0 && (
            <div className="text-sm text-neutral-500">No allergens linked</div>
          )}
        </div>
      </section>
    </div>
  );
}
