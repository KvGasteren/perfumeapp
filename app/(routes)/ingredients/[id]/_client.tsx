/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(routes)/ingredients/[id]/_client.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ingredients } from "@/services/ingredients";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/components/ui/toast/ToastProvider";

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

  const nameChanged = useMemo(
    () => draftName.trim() !== ingredient.name.trim(),
    [draftName, ingredient.name]
  );

  async function saveAll() {
    setSaving(true);
    try {
      // only update name if it changed
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

  // This is the functionality you had inline in the old page.tsx;
  // we just moved it here, and we guard it behind edit mode.
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
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          editMode
            ? `Edit ingredient: ${ingredient.name}`
            : `Ingredient: ${ingredient.name}`
        }
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
        <div className="mb-3 text-sm font-medium">Allergens</div>
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={l.allergenId} className="flex items-center gap-3">
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate">
                  {l.allergenName ?? l.name ?? `#${l.allergenId}`}
                </p>
                {/* optional extra info from the new endpoint */}
                {(l.casNumber || l.maxConcentration) && (
                  <p className="text-xs text-neutral-500">
                    CAS: {l.casNumber || "—"} | Max:{" "}
                    {l.maxConcentration || "—"}
                  </p>
                )}
              </div>

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
                <div className="w-28 text-right text-sm text-neutral-700">
                  {l.concentration}
                </div>
              )}

              {editMode ? (
                <Button variant="ghost" onClick={() => removeLink(i)}>
                  Remove
                </Button>
              ) : null}
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
