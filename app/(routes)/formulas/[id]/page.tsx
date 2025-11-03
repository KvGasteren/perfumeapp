"use client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";

export default function FormulaDetailPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Formula details" actions={<Button>Save</Button>} />
      <div className="rounded-lg border bg-white p-4 text-sm text-neutral-500">
        Coming next: composition editor (add/remove ingredients, parts),
        allergen summary panel, guarded delete.
      </div>
    </div>
  );
}
