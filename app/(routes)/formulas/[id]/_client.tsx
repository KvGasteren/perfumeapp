/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(routes)/formulas/[id]/_client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { Formulas } from "@/services/formulas";
import type {
  Formula,
  FormulaIngredientLink,
  Ingredient,
} from "@/lib/zodSchemas";
import { useRouter } from "next/navigation";

// helper: fetch allergens for 1 ingredient
async function fetchIngredientAllergens(ingredientId: number) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/ingredients/${ingredientId}/allergens`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load allergens for ingredient ${ingredientId}`);
  }
  return (await res.json()) as Array<{
    allergenId: number;
    allergenName?: string;
    concentration: number;
  }>;
}

type Row = {
  ingredientId: number | "";
  ingredientName?: string;
  parts: number | "";
  _status?: "new" | "existing" | "deleted";
};

export function FormulaEditorClient({
  formula,
  initialRows,
  ingredientOptions,
}: {
  formula: Formula;
  initialRows: FormulaIngredientLink[];
  ingredientOptions: Ingredient[];
}) {
  const router = useRouter();
  const { push } = useToast();

  const [name, setName] = useState(formula.name);
  const [rows, setRows] = useState<Row[]>(
    initialRows.map((r) => ({
      ingredientId: r.ingredientId,
      ingredientName: r.ingredientName,
      parts: r.parts,
      _status: "existing",
    }))
  );
  const [saving, setSaving] = useState(false);

  // NEW: cache of ingredient allergens
  const [allergenCache, setAllergenCache] = useState<
    Record<
      number,
      Array<{ allergenId: number; allergenName?: string; concentration: number }>
    >
  >({});

  const changedName = name.trim() !== formula.name.trim();

  function addRow() {
    setRows((prev) => [
      ...prev,
      { ingredientId: "", parts: "", _status: "new" },
    ]);
  }

  function updateRow(idx: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, ...patch } : row))
    );
  }

  function removeRow(idx: number) {
    setRows((prev) => {
      const target = prev[idx];
      if (!target._status || target._status === "new") {
        return prev.filter((_, i) => i !== idx);
      }
      return prev.map((r, i) =>
        i === idx ? { ...r, _status: "deleted" } : r
      );
    });
  }

  // const ingredientMap = useMemo(() => {
  //   const m = new Map<number, string>();
  //   for (const ing of ingredientOptions) {
  //     m.set(ing.id, ing.name);
  //   }
  //   return m;
  // }, [ingredientOptions]);

  // NEW: whenever rows change and we see a selected ingredient we don't have allergens for, fetch them
  useEffect(() => {
    (async () => {
      for (const row of rows) {
        if (
          row._status === "deleted" ||
          row.ingredientId === "" ||
          typeof row.ingredientId !== "number"
        ) {
          continue;
        }
        const ingId = row.ingredientId;
        if (!allergenCache[ingId]) {
          try {
            const data = await fetchIngredientAllergens(ingId);
            setAllergenCache((prev) => ({ ...prev, [ingId]: data }));
          } catch (e: any) {
            // non-fatal, just toast
            push({
              title: "Could not load allergens",
              description: e.message,
            });
          }
        }
      }
    })();
  }, [rows, allergenCache, push]);

  // NEW: compute allergen summary
  const allergenSummary = useMemo(() => {
    // total parts of formula
    const activeRows = rows.filter(
      (r) => r._status !== "deleted" && r.ingredientId !== "" && r.parts !== ""
    );
    const totalParts = activeRows.reduce(
      (sum, r) => sum + Number(r.parts),
      0
    );
    if (!totalParts) return [];

    // aggregate
    const agg = new Map<
      number,
      { name: string; total: number }
    >();

    for (const r of activeRows) {
      if (typeof r.ingredientId !== "number") continue;
      const ingredientParts = Number(r.parts);
      const share = ingredientParts / totalParts; // fraction of formula

      const ingredientAllergens = allergenCache[r.ingredientId] ?? [];
      for (const a of ingredientAllergens) {
        const contribution = share * a.concentration; // assuming concentration is fraction of ingredient
        const key = a.allergenId;
        const label = a.allergenName ?? `Allergen ${a.allergenId}`;
        const existing = agg.get(key);
        if (existing) {
          existing.total += contribution;
        } else {
          agg.set(key, { name: label, total: contribution });
        }
      }
    }

    // to array, sorted desc
    return Array.from(agg.entries())
      .map(([id, v]) => ({
        id,
        name: v.name,
        total: v.total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [rows, allergenCache]);

  async function handleSave() {
    setSaving(true);
    try {
      if (changedName) {
        await Formulas.update(formula.id, { name: name.trim() });
      }

      for (const row of rows) {
        if (row._status === "deleted" && typeof row.ingredientId === "number") {
          await Formulas.deleteIngredient(formula.id, row.ingredientId);
          continue;
        }

        if (
          (row._status === "new" || row._status === "existing") &&
          typeof row.ingredientId === "number" &&
          row.parts !== "" &&
          !Number.isNaN(Number(row.parts))
        ) {
          await Formulas.upsertIngredient(formula.id, {
            ingredientId: row.ingredientId,
            parts: Number(row.parts),
          });
        }
      }

      push({ title: "Saved" });
      router.refresh();
    } catch (e: any) {
      push({ title: "Save failed", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFormula() {
    if (!confirm("Delete this formula?")) return;
    try {
      await Formulas.remove(formula.id);
      push({ title: "Deleted" });
      router.push("/formulas");
    } catch (e: any) {
      push({ title: "Cannot delete", description: e.message });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit formula: ${formula.name}`}
        actions={
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button variant="danger" onClick={handleDeleteFormula}>
              Delete
            </Button>
          </div>
        }
      />

      {/* formula name */}
      <section className="rounded-lg border bg-white p-4">
        <label className="form-label">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </section>

      {/* composition */}
      <section className="rounded-lg border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Composition</h2>
          <Button variant="secondary" onClick={addRow}>
            Add ingredient
          </Button>
        </div>

        <div className="space-y-2">
          {rows.map((row, idx) =>
            row._status === "deleted" ? null : (
              <div key={idx} className="flex items-center gap-3">
                <select
                  className="w-56 rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm outline-none focus:border-neutral-400"
                  value={row.ingredientId === "" ? "" : String(row.ingredientId)}
                  onChange={(e) =>
                    updateRow(idx, {
                      ingredientId:
                        e.target.value === ""
                          ? ""
                          : Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select ingredient…</option>
                  {ingredientOptions.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  className="w-28"
                  value={row.parts === "" ? "" : String(row.parts)}
                  onChange={(e) =>
                    updateRow(idx, {
                      parts: e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  placeholder="parts"
                />

                <Button variant="ghost" onClick={() => removeRow(idx)}>
                  Remove
                </Button>
              </div>
            )
          )}

          {rows.length === 0 && (
            <div className="text-sm text-neutral-500">
              No ingredients in this formula yet.
            </div>
          )}
        </div>
      </section>

      {/* NEW: allergen summary panel */}
      <section className="rounded-lg border bg-white p-4 space-y-3">
        <h2 className="text-sm font-medium">Allergen summary</h2>
        {allergenSummary.length === 0 ? (
          <div className="text-sm text-neutral-500">
            No allergen data available for this formula.
          </div>
        ) : (
          <div className="space-y-1">
            {allergenSummary.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between text-sm"
              >
                <span>{a.name}</span>
                {/* show as percentage with 2 decimals */}
                <span className="font-mono text-neutral-700">
                  {(a.total * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
