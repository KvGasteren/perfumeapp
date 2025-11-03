/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
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
      // if it's a new row, just drop it
      if (!target._status || target._status === "new") {
        return prev.filter((_, i) => i !== idx);
      }
      // mark existing row as deleted
      return prev.map((r, i) =>
        i === idx ? { ...r, _status: "deleted" } : r
      );
    });
  }

  // so we can show ingredient names even when we only have an id
  // const ingredientMap = useMemo(() => {
  //   const m = new Map<number, string>();
  //   for (const ing of ingredientOptions) {
  //     m.set(ing.id, ing.name);
  //   }
  //   return m;
  // }, [ingredientOptions]);

  async function handleSave() {
    setSaving(true);
    try {
      // 1) update formula name if needed
      if (changedName) {
        await Formulas.update(formula.id, { name: name.trim() });
      }

      // 2) sync composition
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
      // e.g. 422 from backend
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
                      { ing.name }
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  className="w-28"
                  value={row.parts === "" ? "" : String(row.parts)}
                  onChange={(e) =>
                    updateRow(idx, { parts: e.target.value === "" ? "" : Number(e.target.value) })
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

      {/* later: allergen summary panel */}
      {/* <section className="rounded-lg border bg-white p-4">…</section> */}
    </div>
  );
}
