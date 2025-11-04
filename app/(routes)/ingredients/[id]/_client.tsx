/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(routes)/ingredients/[id]/_client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ingredients } from "@/services/ingredients";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { formatMax } from "@/lib/utils";

type Ingredient = {
  id: number;
  name: string;
  ownerId: string;
};

type AllergenLink = {
  allergenId: number;
  concentration: number;
  allergenName?: string | null;
  casNumber?: string | null;
  maxConcentration?: string | null;
  // older responses
  name?: string | null;
};

type AllergenOption = {
  id: number;
  name: string;
  casNumber?: string | null;
  maxConcentration?: string | null;
};

export default function IngredientDetailClient({
  ingredient,
  allergens,
}: {
  ingredient: Ingredient;
  allergens: AllergenLink[];
}) {
  const router = useRouter();
  const { push } = useToast();

  // view/edit state
  const [editMode, setEditMode] = useState(false);

  // form state
  const [draftName, setDraftName] = useState(ingredient.name);
  const [links, setLinks] = useState<AllergenLink[]>(allergens);
  const [saving, setSaving] = useState(false);

  // add-allergen state
  const [allAllergens, setAllAllergens] = useState<AllergenOption[]>([]);
  const [adding, setAdding] = useState(false);
  const [newAllergenId, setNewAllergenId] = useState<number | "">("");
  const [newConcentration, setNewConcentration] = useState("0");

  const nameChanged = useMemo(
    () => draftName.trim() !== ingredient.name.trim(),
    [draftName, ingredient.name]
  );

  // fetch all allergens so we can add new ones
  useEffect(() => {
    if (!editMode) return;
    // basic fetch, you can swap this for your services layer if you want
    (async () => {
      try {
        const res = await fetch("/api/allergens");
        if (!res.ok) return;
        const data: AllergenOption[] = await res.json();
        setAllAllergens(data);
      } catch {
        // ignore for now
      }
    })();
  }, [editMode]);

  async function saveAll() {
    setSaving(true);
    try {
      if (nameChanged) {
        await Ingredients.update(ingredient.id, {
          name: draftName.trim(),
        });
      }

      push({ title: "Saved" });
      router.refresh();
      setEditMode(false);
    } catch (e: any) {
      push({ title: "Save failed", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function deleteIngredient() {
    if (!confirm("Delete this ingredient?")) return;
    try {
      await Ingredients.remove(ingredient.id);
      push({ title: "Deleted" });
      router.push("/ingredients");
    } catch (e: any) {
      push({ title: "Cannot delete", description: e.message });
    }
  }

  // update concentration for an existing link
  async function onLinkChange(idx: number, next: AllergenLink) {
    if (!editMode) return;
    setLinks((arr) => arr.map((l, i) => (i === idx ? next : l)));
    try {
      await Ingredients.upsertAllergen(ingredient.id, {
        allergenId: next.allergenId,
        concentration: next.concentration,
      });
    } catch (e: any) {
      push({ title: "Failed to update allergen", description: e.message });
    }
  }

  async function removeLink(idx: number) {
    if (!editMode) return;
    const target = links[idx];
    setLinks((arr) => arr.filter((_, i) => i !== idx));
    try {
      await Ingredients.deleteAllergen(ingredient.id, target.allergenId);
    } catch (e: any) {
      push({ title: "Failed to remove allergen", description: e.message });
    }
  }

  function cancelEdit() {
    setDraftName(ingredient.name);
    setLinks(allergens);
    setEditMode(false);
    setAdding(false);
    setNewAllergenId("");
    setNewConcentration("0");
  }

  // add a brand new allergen link
  async function addAllergen() {
    if (!editMode) return;
    if (newAllergenId === "") return;
    const numericConcentration = Number(newConcentration) || 0;

    try {
      await Ingredients.upsertAllergen(ingredient.id, {
        allergenId: Number(newAllergenId),
        concentration: numericConcentration,
      });

      // find more info from the loaded list so we can show name/CAS right away
      const info = allAllergens.find((a) => a.id === Number(newAllergenId));

      setLinks((prev) => [
        ...prev,
        {
          allergenId: Number(newAllergenId),
          concentration: numericConcentration,
          allergenName: info?.name,
          casNumber: info?.casNumber ?? null,
          maxConcentration: info?.maxConcentration ?? null,
        },
      ]);

      setAdding(false);
      setNewAllergenId("");
      setNewConcentration("0");
      push({ title: "Allergen added" });
    } catch (e: any) {
      push({ title: "Failed to add allergen", description: e.message });
    }
  }

  // filter out allergens that are already linked
  const availableToAdd = allAllergens.filter(
    (a) => !links.some((l) => l.allergenId === a.id)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={editMode ? `Edit ${ingredient.name}` : `${ingredient.name}`}
        actions={
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button onClick={saveAll} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
                <Button variant="ghost" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)}>Edit</Button>
            )}
            <Button variant="danger" onClick={deleteIngredient}>
              Delete
            </Button>
          </div>
        }
      />

      {/* Name section */}
      <section className="rounded-lg border bg-white p-4">
        <label className="mb-1 block text-xs font-medium text-neutral-600">
          Name
        </label>
        {editMode ? (
          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
        ) : (
          <p className="text-sm text-neutral-900">{draftName}</p>
        )}
      </section>

      {/* Allergens section */}
      <section className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm font-medium">Allergens</div>
          {editMode ? (
            <Button
              variant={adding ? "secondary" : "ghost"}
              onClick={() => setAdding((p) => !p)}
            >
              {adding ? "Close" : "Add allergen"}
            </Button>
          ) : null}
        </div>

        {editMode && 
        <p className="mb-3 text-xs text-red-500 text-right">
          Store concentration as a decimal fraction (e.g. <code>0.0200</code> = 2%)
        </p>
        }
        {/* add row */}
        {editMode && adding ? (
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

        <div className="space-y-3">
          {links.map((l, i) => {
            const displayName =
              l.allergenName ?? l.name ?? `Allergen #${l.allergenId}`; // fallback so we always show something

            return (
              <div
                key={l.allergenId}
                className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
              >
                {/* left block: name + meta */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {displayName}
                  </p>
                  {(l.casNumber || l.maxConcentration) && (
                    <p className="text-xs text-neutral-500">
                      {l.casNumber ? `CAS: ${l.casNumber}` : null}
                      {l.casNumber && l.maxConcentration ? " • " : null}
                      {l.maxConcentration ? `Max: ${formatMax(l.maxConcentration)}` : null}
                    </p>
                  )}
                </div>

                {/* right block: input + remove */}
                <div className="flex items-center gap-2 sm:w-auto">
                  {editMode ? (
                    <Input
                      type="number"
                      step="0.01"
                      className="w-28"
                      value={String(l.concentration)}
                      onChange={(e) =>
                        onLinkChange(i, {
                          ...l,
                          concentration: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    <div className="w-28 text-sm text-neutral-700 text-right">
                      {formatMax(l.concentration)}
                    </div>
                  )}

                  {editMode ? (
                    <Button variant="ghost" onClick={() => removeLink(i)}>
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}

          {links.length === 0 && (
            <div className="text-sm text-neutral-500">No allergens linked</div>
          )}
        </div>
      </section>
    </div>
  );
}
