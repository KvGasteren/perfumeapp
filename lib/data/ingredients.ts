// lib/data/ingredients.ts
import { db } from "@/db";
import { ingredients, ingredientAllergens, allergens } from "@/db/schema";
import { eq } from "drizzle-orm";

export type IngredientWithAllergenSummary = {
  id: number;
  name: string;
  topAllergens: {
    id: number;
    name: string;
    concentration: number;
  }[];
  allergenCount: number;
};

export async function getIngredientsWithAllergenSummary(): Promise<IngredientWithAllergenSummary[]> {
  const allIngredients = await db.select().from(ingredients);

  const links = await db
    .select({
      ingredientId: ingredientAllergens.ingredientId,
      concentration: ingredientAllergens.concentration,
      allergenId: allergens.id,
      allergenName: allergens.name,
    })
    .from(ingredientAllergens)
    .leftJoin(allergens, eq(ingredientAllergens.allergenId, allergens.id));

  // prep map
  const byIngredient = new Map<
    number,
    {
      id: number;
      name: string;
      // we’ll fill these
      topAllergens: { id: number; name: string; concentration: number }[];
      allergenCount: number;
    }
  >();

  for (const ing of allIngredients) {
    byIngredient.set(ing.id, {
      id: ing.id,
      name: ing.name,
      topAllergens: [],
      allergenCount: 0,
    });
  }

  for (const link of links) {
    const bucket = byIngredient.get(link.ingredientId);
    if (!bucket) continue;

    const concentration = link.concentration ?? 0;
    bucket.allergenCount += 1;

    // insert into top 3 list (small array, so simple logic)
    const current = bucket.topAllergens;

    // push and re-sort small array
    current.push({
      id: link.allergenId!,
      name: link.allergenName ?? "Unknown",
      concentration,
    });
    current.sort((a, b) => b.concentration - a.concentration);
    if (current.length > 3) {
      current.pop(); // keep only top 3
    }
  }

  return Array.from(byIngredient.values());
}
