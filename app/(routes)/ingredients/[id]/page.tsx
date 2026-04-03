import { notFound } from "next/navigation";
import { getIngredientById, getIngredientAllergens } from "@/lib/data/ingredients";
import { getOwnerFilter } from "@/lib/owner";
import IngredientDetailClient from "./_client";

export default async function IngredientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ingredientId = Number(id);

  if (Number.isNaN(ingredientId)) notFound();

  const ownerId = await getOwnerFilter();
  const [ingredient, allergens] = await Promise.all([
    getIngredientById(ingredientId, ownerId),
    getIngredientAllergens(ingredientId, ownerId),
  ]);

  if (!ingredient) notFound();

  return <IngredientDetailClient ingredient={ingredient} allergens={allergens} />;
}
