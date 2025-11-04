/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(routes)/ingredients/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Ingredients } from "@/services/ingredients";
import { useToast } from "@/components/ui/toast/ToastProvider";

type AllergenOption = {
  id: number;
  name: string;
  casNumber?: string | null;
  maxConcentration?: string | null;
};

type StagedAllergen = {
  allergenId: number;
  concentration: number;
  name?: string;
  casNumber?: string | null;
  maxConcentration?: string | null;
};

export default function NewIngredientPage() {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  // for adding allergens
  const [allAllergens, setAllAllergens] = useState<AllergenOption[]>([]);
  const [adding, setAdding] = useState(false);
  const [newAllergenId, setNewAllergenId] = useState<number | "">("");
  const [newConcentration, setNewConcentration] = useState("0");
  const [stagedAllergens, setStagedAllergens] = useState<StagedAllergen[]>([]);

  // load allergens once for the selector
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/allergens");
        if (!res.ok) return;
        const data: AllergenOption[] = await res.json();
        setAllAllergens(data);
      } catch {
        // ignore
      }
    })();
  }, []);

  const availableToAdd = allAllergens.filter(
    (a) => !stagedAllergens.some((s) => s.allergenId === a.id)
  );

  async function handleSave() {
    if (!name.trim()) {
      push({ title: "Name required" });
      return;
    }
    setSaving(true);
    try {
      // 1) create ingredient
      const created = await Ingredients.create({ name: name.trim() });

      // 2) attach staged allergens
      for (const link of stagedAllergens) {
        await Ingredients.upsertAllergen(created.id, {
          allergenId: link.allergenId,
          concentration: link.concentration,
        });
      }

      push({ title: "Ingredient created" });
      router.push(`/ingredients/${created.id}`);
    } catch (e: any) {
      push({ title: "Create failed", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  function addAllergen() {
    if (newAllergenId === "") return;
    const info = allAllergens.find((a) => a.id === newAllergenId);
    const conc = Number(newConcentration) || 0;
    setStagedAllergens((prev) => [
      ...prev,
      {
        allergenId: Number(newAllergenId),
        concentration: conc,
        name: info?.name,
        casNumber: info?.casNumber ?? null,
        maxConcentration: info?.maxConcentration ?? null,
      },
    ]);
    setAdding(false);
    setNewAllergenId("");
    setNewConcentration("0");
  }

  function updateStagedConcentration(idx: number, value: string) {
    const num = Number(value);
    setStagedAllergens((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, concentration: num } : item
      )
    );
  }

  function removeStaged(idx: number) {
    setStagedAllergens((prev) => prev.filter((_, i) => i !== idx));
  }
  return (
    <div className="space-y-6">
      <PageHeader title="New ingredient" />

      {/* name */}
      <section className="rounded-lg border bg-white p-4">
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          Name
        </label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </section>

      {/* allergens */}
      <section className="rounded-lg border bg-white p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Allergens</h2>
          <Button
            variant={adding ? "secondary" : "ghost"}
            onClick={() => setAdding((p) => !p)}
          >
            {adding ? "Close" : "Add allergen"}
          </Button>
        </div>
        {(stagedAllergens.length > 0 || adding) && (
        <p className="mb-3 text-xs text-red-500 text-right">
          Store concentration as a decimal fraction (e.g. <code>0.0200</code> =
          2%)
        </p>
        )}
        {adding ? (
          <div className="mb-4 flex flex-col gap-2 rounded-md bg-neutral-50 p-3 sm:flex-row sm:items-center">
            <select
              className="w-full rounded-md border px-2 py-1 text-sm"
              value={newAllergenId}
              onChange={(e) =>
                setNewAllergenId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <option value="">Select allergen…</option>
              {availableToAdd.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.casNumber ? ` (${a.casNumber})` : ""}
                </option>
              ))}
            </select>
            <Input
              type="number"
              step="0.01"
              className="w-32"
              value={newConcentration}
              onChange={(e) => setNewConcentration(e.target.value)}
              placeholder="conc."
            />
            <Button
              onClick={addAllergen}
              disabled={newAllergenId === "" || availableToAdd.length === 0}
            >
              Add
            </Button>
          </div>
        ) : null}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {stagedAllergens.map((s, i) => (
            <div
              key={s.allergenId}
              className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {s.name ?? `Allergen #${s.allergenId}`}
                </p>
                {(s.casNumber || s.maxConcentration) && (
                  <p className="text-xs text-neutral-500">
                    {s.casNumber ? `CAS: ${s.casNumber}` : null}
                    {s.casNumber && s.maxConcentration ? " • " : null}
                    {s.maxConcentration ? `Max: ${s.maxConcentration}` : null}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  className="w-28"
                  value={String(s.concentration)}
                  onChange={(e) => updateStagedConcentration(i, e.target.value)}
                />
                <Button variant="ghost" onClick={() => removeStaged(i)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {stagedAllergens.length === 0 && (
            <p className="text-sm text-neutral-500">
              No allergens added yet. Add them now, or later from the ingredient
              detail page.
            </p>
          )}
        </div>
      </section>

      {/* actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
