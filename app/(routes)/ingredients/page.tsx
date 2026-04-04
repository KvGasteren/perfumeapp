// app/(routes)/ingredients/page.tsx
import PageHeader from "@/components/PageHeader";
import { IngredientsListClient } from "./_client";
import { getIngredientsWithAllergenSummary } from "@/lib/data/ingredients";
import { getOwnerFilter } from "@/lib/owner";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  const ownerId = await getOwnerFilter();
  const items = await (ownerId ? getIngredientsWithAllergenSummary(ownerId) : []);

  return (
    <div>
      <PageHeader title="Ingredients" />
      <IngredientsListClient items={items} />
    </div>
  );
}
