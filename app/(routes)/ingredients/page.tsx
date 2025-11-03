// app/(routes)/ingredients/page.tsx
import PageHeader from "@/components/PageHeader";
import { Ingredients } from "@/services/ingredients";
import { IngredientsListClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  const items = await Ingredients.list();

  return (
    <div>
      <PageHeader title="Ingredients" />
      <IngredientsListClient items={items} />
    </div>
  );
}
