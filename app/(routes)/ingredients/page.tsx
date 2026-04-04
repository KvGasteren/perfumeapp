// app/(routes)/ingredients/page.tsx
import PageHeader from "@/components/PageHeader";
import { IngredientsListClient } from "./_client";
import { getIngredientsWithAllergenSummary } from "@/lib/data/ingredients";
import { getEffectiveOwnerId } from "@/lib/owner";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  const items = await getIngredientsWithAllergenSummary(await getEffectiveOwnerId());

  return (
    <div>
      <PageHeader title="Ingredients" />
      <IngredientsListClient items={items} />
    </div>
  );
}
