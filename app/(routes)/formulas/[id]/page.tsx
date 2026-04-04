import { notFound } from "next/navigation";
import { getFormulaById, getFormulaIngredients } from "@/lib/data/formulas";
import { getAllIngredientsForOwner, getIngredientAllergens } from "@/lib/data/ingredients";
import { getOwnerFilter } from "@/lib/owner";
import { FormulaEditorClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function FormulaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const formulaId = Number(id);

  if (Number.isNaN(formulaId)) notFound();

  const ownerFilter = await getOwnerFilter();

  const [formula, ingredientsInFormula, allIngredients] = await Promise.all([
    getFormulaById(formulaId, ownerFilter),
    getFormulaIngredients(formulaId, ownerFilter),
    ownerFilter ? getAllIngredientsForOwner(ownerFilter) : Promise.resolve([]),
  ]);

  if (!formula) notFound();

  const ingredientIds = ingredientsInFormula
    .map((r) => r.ingredientId)
    .filter((id): id is number => typeof id === "number");

  const allergenResults = await Promise.all(
    ingredientIds.map((ingId) =>
      getIngredientAllergens(ingId, ownerFilter).then((allergens) => ({ ingId, allergens }))
    )
  );

  const initialAllergenCache: Record<
    number,
    Array<{ allergenId: number; allergenName?: string; concentration: number }>
  > = {};
  for (const { ingId, allergens } of allergenResults) {
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
