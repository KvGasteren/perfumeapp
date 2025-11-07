import { Formulas } from "@/services/formulas";
import { Ingredients } from "@/services/ingredients";
import { FormulaEditorClient } from "./_client";
import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/getBaseUrl";

export const dynamic = "force-dynamic";

export default async function FormulaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formulaId = Number(id);

  if (Number.isNaN(formulaId)) {
    notFound();
  }

  const [formula, ingredientsInFormula, allIngredients] = await Promise.all([
    Formulas.byId(formulaId),
    Formulas.listIngredients(formulaId),
    Ingredients.list(),
  ]);

  // collect ingredientIds that are actually in this formula
  const ingredientIds = ingredientsInFormula
    .map((r) => r.ingredientId)
    .filter((id): id is number => typeof id === "number");

  // fetch allergens for those ingredients on the server
  // we mirror what you did in the client, but here we do it once
  const base = getBaseUrl();
  
  const allergenResponses = await Promise.all(
    ingredientIds.map(async (ingId) => {
      const res = await fetch(`${base}/api/ingredients/${ingId}/allergens`, {
        cache: "no-store",
      });
      if (!res.ok) {
        // if one fails, just return empty list for that ingredient
        return { ingId, allergens: [] as Array<{ allergenId: number; allergenName?: string; concentration: number }> };
      }
      const data = (await res.json()) as Array<{
        allergenId: number;
        allergenName?: string;
        concentration: number;
      }>;
      return { ingId, allergens: data };
    })
  );

  // shape it like the client expects: Record<number, Array<...>>
  const initialAllergenCache: Record<
    number,
    Array<{ allergenId: number; allergenName?: string; concentration: number }>
  > = {};
  for (const { ingId, allergens } of allergenResponses) {
    initialAllergenCache[ingId] = allergens;
  }

  return (
    <FormulaEditorClient
      formula={formula}
      initialRows={ingredientsInFormula}
      ingredientOptions={allIngredients}
      initialAllergenCache={initialAllergenCache}
    />
  );
}
