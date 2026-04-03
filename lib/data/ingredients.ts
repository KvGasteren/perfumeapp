import { db } from "@/db";
import { ingredients, ingredientAllergens, allergens, formulaIngredients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NotFoundError, ConflictError } from "./errors";

// ── List ──────────────────────────────────────────────────────────────────────

export type IngredientWithAllergenSummary = {
  id: number;
  name: string;
  topAllergens: { id: number; name: string; concentration: number }[];
  allergenCount: number;
};

export async function getIngredientsWithAllergenSummary(ownerId: string): Promise<IngredientWithAllergenSummary[]> {
  const allIngredients = await db.select().from(ingredients).where(eq(ingredients.ownerId, ownerId));

  const links = await db
    .select({
      ingredientId: ingredientAllergens.ingredientId,
      concentration: ingredientAllergens.concentration,
      allergenId: allergens.id,
      allergenName: allergens.name,
    })
    .from(ingredientAllergens)
    .leftJoin(allergens, eq(ingredientAllergens.allergenId, allergens.id))
    .where(eq(ingredientAllergens.ownerId, ownerId));

  const byIngredient = new Map<number, IngredientWithAllergenSummary>();

  for (const ing of allIngredients) {
    byIngredient.set(ing.id, { id: ing.id, name: ing.name, topAllergens: [], allergenCount: 0 });
  }

  for (const link of links) {
    const bucket = byIngredient.get(link.ingredientId);
    if (!bucket) continue;

    const concentration = link.concentration ?? 0;
    bucket.allergenCount += 1;

    const current = bucket.topAllergens;
    current.push({ id: link.allergenId!, name: link.allergenName ?? "Unknown", concentration });
    current.sort((a, b) => b.concentration - a.concentration);
    if (current.length > 3) current.pop();
  }

  return Array.from(byIngredient.values());
}

export async function getAllIngredientsAdmin() {
  return db.query.ingredients.findMany({
    orderBy: (i, { asc }) => [asc(i.ownerId), asc(i.name)],
  });
}

export async function getAllIngredientsForOwner(ownerId: string) {
  return db.query.ingredients.findMany({
    where: eq(ingredients.ownerId, ownerId),
    orderBy: (i, { asc }) => [asc(i.name)],
  });
}

// ── Single ────────────────────────────────────────────────────────────────────

export async function getIngredientById(id: number, ownerId: string) {
  const row = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId)),
  });
  return row ?? null;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createIngredient(name: string, ownerId: string) {
  const [row] = await db.insert(ingredients).values({ name, ownerId }).returning();
  return row;
}

export async function updateIngredient(id: number, name: string, ownerId: string) {
  const [row] = await db
    .update(ingredients)
    .set({ name })
    .where(and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId)))
    .returning();
  if (!row) throw new NotFoundError("Ingredient not found");
  return row;
}

export async function deleteIngredient(id: number, ownerId: string) {
  const usage = await db
    .select()
    .from(formulaIngredients)
    .where(and(eq(formulaIngredients.ingredientId, id), eq(formulaIngredients.ownerId, ownerId)));

  if (usage.length > 0) {
    throw new ConflictError("Cannot delete: ingredient is used in one or more formulas.");
  }

  const [deleted] = await db
    .delete(ingredients)
    .where(and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId)))
    .returning();

  if (!deleted) throw new NotFoundError("Ingredient not found");
}

// ── Allergen links ────────────────────────────────────────────────────────────

export async function getIngredientAllergens(ingredientId: number, ownerId: string) {
  return db
    .select({
      allergenId: allergens.id,
      allergenName: allergens.name,
      concentration: ingredientAllergens.concentration,
      casNumber: allergens.casNumber,
      maxConcentration: allergens.maxConcentration,
    })
    .from(ingredientAllergens)
    .innerJoin(allergens, eq(ingredientAllergens.allergenId, allergens.id))
    .where(
      and(
        eq(ingredientAllergens.ingredientId, ingredientId),
        eq(ingredientAllergens.ownerId, ownerId),
        eq(allergens.ownerId, ownerId)
      )
    )
    .orderBy(allergens.name);
}

export async function upsertIngredientAllergen(
  ingredientId: number,
  allergenId: number,
  concentration: number,
  ownerId: string
) {
  const ing = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, ingredientId), eq(ingredients.ownerId, ownerId)),
    columns: { id: true },
  });
  if (!ing) throw new NotFoundError("Ingredient not found");

  const all = await db.query.allergens.findFirst({
    where: and(eq(allergens.id, allergenId), eq(allergens.ownerId, ownerId)),
    columns: { id: true, name: true },
  });
  if (!all) throw new NotFoundError("Allergen not found");

  const [row] = await db
    .insert(ingredientAllergens)
    .values({ ingredientId, allergenId, concentration, ownerId })
    .onConflictDoUpdate({
      target: [ingredientAllergens.ingredientId, ingredientAllergens.allergenId],
      set: { concentration },
    })
    .returning();

  return { allergenId: row.allergenId, allergenName: all.name, concentration: row.concentration };
}

export async function deleteIngredientAllergen(
  ingredientId: number,
  allergenId: number,
  ownerId: string
) {
  const ing = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, ingredientId), eq(ingredients.ownerId, ownerId)),
    columns: { id: true },
  });
  if (!ing) throw new NotFoundError("Ingredient not found");

  await db
    .delete(ingredientAllergens)
    .where(
      and(
        eq(ingredientAllergens.ingredientId, ingredientId),
        eq(ingredientAllergens.allergenId, allergenId),
        eq(ingredientAllergens.ownerId, ownerId)
      )
    );
}
