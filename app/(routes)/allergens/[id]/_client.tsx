/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(routes)/allergens/[id]/_client.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { Allergens } from "@/services/allergens";
import { formatMax } from "@/lib/utils";

type Allergen = {
  id: number;
  name: string;
  ownerId: string;
  casNumber?: string | null;
  maxConcentration?: string | null;
};

export default function AllergenDetailClient({
  allergen,
}: {
  allergen: Allergen;
}) {
  const router = useRouter();
  const { push } = useToast();

  // edit toggle
  const [editMode, setEditMode] = useState(false);

  // form fields
  const [name, setName] = useState(allergen.name);
  const [casNumber, setCasNumber] = useState(allergen.casNumber ?? "");
  const [maxConcentration, setMaxConcentration] = useState(
    allergen.maxConcentration ?? ""
  );

  const [saving, setSaving] = useState(false);

  const changed = useMemo(() => {
    return (
      name.trim() !== allergen.name.trim() ||
      (casNumber ?? "") !== (allergen.casNumber ?? "") ||
      (maxConcentration ?? "") !== (allergen.maxConcentration ?? "")
    );
  }, [name, casNumber, maxConcentration, allergen]);

  async function save() {
    if (!changed) {
      setEditMode(false);
      return;
    }
    setSaving(true);
    try {
      // normalize maxConcentration for the backend (it expects string or null)
      const payload: Record<string, unknown> = {
        name: name.trim(),
        casNumber: casNumber.trim() === "" ? null : casNumber.trim(),
        maxConcentration:
          maxConcentration.trim() === ""
            ? null
            : maxConcentration.trim(),
      };

      await Allergens.update(allergen.id, payload);

      push({ title: "Saved" });
      router.refresh();
      setEditMode(false);
    } catch (e: any) {
      push({ title: "Save failed", description: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this allergen?")) return;
    try {
      await Allergens.remove(allergen.id);
      push({ title: "Deleted" });
      router.push("/allergens");
    } catch (e: any) {
      // e.g. API returns 422 if allergen is in use
      push({ title: "Cannot delete", description: e.message });
    }
  }

  function cancel() {
    setName(allergen.name);
    setCasNumber(allergen.casNumber ?? "");
    setMaxConcentration(allergen.maxConcentration ?? "");
    setEditMode(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          editMode
            ? `Edit ${allergen.name}`
            : `${allergen.name}`
        }
        actions={
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
                <Button variant="ghost" onClick={cancel} disabled={saving}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)}>Edit</Button>
            )}
            <Button variant="danger" onClick={remove}>
              Delete
            </Button>
          </div>
        }
      />

      {/* Name */}
      <section className="rounded-lg border bg-white p-4 space-y-2">
        <label className="block text-xs font-medium text-neutral-600">
          Name
        </label>
        {editMode ? (
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        ) : (
          <p className="text-sm text-neutral-900">{name}</p>
        )}
      </section>

      {/* CAS number */}
      <section className="rounded-lg border bg-white p-4 space-y-2">
        <label className="block text-xs font-medium text-neutral-600">
          CAS number
        </label>
        {editMode ? (
          <Input
            value={casNumber}
            onChange={(e) => setCasNumber(e.target.value)}
            placeholder="e.g. 78-70-6"
          />
        ) : (
          <p className="text-sm text-neutral-900">
            {casNumber ? casNumber : "—"}
          </p>
        )}
      </section>

      {/* Max concentration */}
      <section className="rounded-lg border bg-white p-4 space-y-2">
        <label className="block text-xs font-medium text-neutral-600">
          Max concentration
        </label>
        {editMode ? (<>
          <Input
            type="number"
            step="0.0001"
            value={maxConcentration}
            onChange={(e) => setMaxConcentration(e.target.value)}
            placeholder="0.0200"
          />
          <p className="text-xs text-neutral-400">
          Store it as a decimal fraction (e.g. 0.0200 = 2%)
        </p>
        </>
        ) : (
          <p className="text-sm text-neutral-900">
            {formatMax(maxConcentration)}
          </p>
        )}
        
      </section>
    </div>
  );
}
