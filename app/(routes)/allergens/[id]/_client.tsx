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


// --- helpers: percent <-> fraction and formatting ---
function toPercentStringFromFraction(frac: string | number | null | undefined, decimals = 4) {
  if (frac == null || frac === "") return "";
  const n = typeof frac === "string" ? Number(frac) : frac;
  if (Number.isNaN(n)) return "";
  return (n * 100).toFixed(decimals); // string
}

function toFractionStringFromPercent(pctStr: string, decimals = 6) {
  const n = Number(pctStr);
  if (pctStr.trim() === "" || Number.isNaN(n)) return "";
  return (n / 100).toFixed(decimals); // string
}

function formatPercentFromFraction(frac: string | number | null | undefined, decimals = 4) {
  const s = toPercentStringFromFraction(frac, decimals);
  return s === "" ? "—" : `${s}%`;
}


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
  const [maxPercent, setMaxPercent] = useState(
    toPercentStringFromFraction(allergen.maxConcentration ?? "", 4)
  );

  const [saving, setSaving] = useState(false);

  // normalized strings for accurate change detection
  const originalFractionNorm = useMemo(() => {
    const s = allergen.maxConcentration ?? "";
    return s === "" ? "" : Number(s).toFixed(6);
  }, [allergen.maxConcentration]);

  const currentFractionNorm = useMemo(() => {
    const s = toFractionStringFromPercent(maxPercent, 6);
    return s === "" ? "" : Number(s).toFixed(6);
  }, [maxPercent]);

  const changed = useMemo(() => {
    return (
      name.trim() !== allergen.name.trim() ||
      (casNumber ?? "") !== (allergen.casNumber ?? "") ||
      currentFractionNorm !== originalFractionNorm
    );
  }, [name, casNumber, currentFractionNorm, originalFractionNorm, allergen]);

  async function save() {
    if (!changed) {
      setEditMode(false);
      return;
    }
    setSaving(true);
    try {
      // convert percent (UI) -> fraction string for backend
      const fractionStr = toFractionStringFromPercent(maxPercent, 6);

      const payload: Record<string, unknown> = {
        name: name.trim(),
        casNumber: casNumber.trim() === "" ? null : casNumber.trim(),
        maxConcentration: fractionStr === "" ? null : fractionStr, // backend expects string or null
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
    setMaxPercent(toPercentStringFromFraction(allergen.maxConcentration ?? "", 4));
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
        <label className="block text-xs font-medium text-neutral-600">Max concentration</label>
        {editMode ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                max={100}
                value={maxPercent}
                onChange={(e) => setMaxPercent(e.target.value)}
                placeholder="2.00"
              />
              <span className="text-sm text-neutral-600">%</span>
            </div>
        ) : (
          <p className="text-sm text-neutral-900">
            {formatPercentFromFraction(allergen.maxConcentration, 4)}
          </p>
        )}
      </section>
    </div>
  );
}
