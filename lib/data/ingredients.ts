import { db } from "@/db";
import { ingredients, ingredientAllergens, allergens, formulaIngredients } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";

const PUBLIC = "public";
import { NotFoundError, ConflictError } from "./errors";

// ── List ──────────────────────────────────────────────────────────────────────

export type IngredientWithAllergenSummary = {
  id: number;
  name: string;
  topAllergens: { id: number; name: string; concentration: number }[];
  allergenCount: number;
};

export async function getIngredientsWithAllergenSummary(ownerId: string): Promise<IngredientWithAllergenSummary[]> {
  const ownerFilter = or(eq(ingredients.ownerId, ownerId), eq(ingredients.ownerId, PUBLIC));
  const allIngredients = await db.select().from(ingredients).where(ownerFilter);

  const linkFilter = or(eq(ingredientAllergens.ownerId, ownerId), eq(ingredientAllergens.ownerId, PUBLIC));
  const links = await db
    .select({
      ingredientId: ingredientAllergens.ingredientId,
      concentration: ingredientAllergens.concentration,
      allergenId: allergens.id,
      allergenName: allergens.name,
    })
    .from(ingredientAllergens)
    .leftJoin(allergens, eq(ingredientAllergens.allergenId, allergens.id))
    .where(linkFilter);

  const byIngredient = new Map<number, IngredientWithAllergenSummary>();

  for (const ing of allIngredients) {
    byIngredient.set(ing.id, { id: ing.id, name: ing.name, topAllergens: [], allergenCount: 0 });
  }

  for (const link of links) {
    const bucket = byIngredient.get(link.ingredientId);
    if (!bucket) continue;

    const concentration = Number(link.concentration ?? 0);
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
    where: (i, { or, eq }) => or(eq(i.ownerId, ownerId), eq(i.ownerId, PUBLIC)),
    orderBy: (i, { asc }) => [asc(i.name)],
  });
}

// ── Single ────────────────────────────────────────────────────────────────────

export async function getIngredientById(id: number, ownerId: string | null) {
  const row = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), ownerId ? or(eq(ingredients.ownerId, ownerId), eq(ingredients.ownerId, PUBLIC)) : undefined),
  });
  return row ?? null;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createIngredient(name: string, ownerId: string) {
  const [row] = await db.insert(ingredients).values({ name, ownerId }).returning();
  return row;
}

export async function updateIngredient(id: number, name: string, ownerId: string | null) {
  const [row] = await db
    .update(ingredients)
    .set({ name })
    .where(and(eq(ingredients.id, id), ownerId ? eq(ingredients.ownerId, ownerId) : undefined))
    .returning();
  if (!row) throw new NotFoundError("Ingredient not found");
  return row;
}

export async function deleteIngredient(id: number, ownerId: string | null) {
  const usage = await db
    .select()
    .from(formulaIngredients)
    .where(and(eq(formulaIngredients.ingredientId, id), ownerId ? eq(formulaIngredients.ownerId, ownerId) : undefined));

  if (usage.length > 0) {
    throw new ConflictError("Cannot delete: ingredient is used in one or more formulas.");
  }

  const [deleted] = await db
    .delete(ingredients)
    .where(and(eq(ingredients.id, id), ownerId ? eq(ingredients.ownerId, ownerId) : undefined))
    .returning();

  if (!deleted) throw new NotFoundError("Ingredient not found");
}

// ── Allergen links ────────────────────────────────────────────────────────────

export async function getIngredientAllergens(ingredientId: number, ownerId: string | null) {
  const rows = await db
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
        ownerId ? or(eq(ingredientAllergens.ownerId, ownerId), eq(ingredientAllergens.ownerId, PUBLIC)) : undefined,
        ownerId ? or(eq(allergens.ownerId, ownerId), eq(allergens.ownerId, PUBLIC)) : undefined
      )
    )
    .orderBy(allergens.name);
  return rows.map((r) => ({ ...r, concentration: Number(r.concentration) }));
}

export async function upsertIngredientAllergen(
  ingredientId: number,
  allergenId: number,
  concentration: number,
  ownerId: string | null
) {
  const ing = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, ingredientId), ownerId ? eq(ingredients.ownerId, ownerId) : undefined),
    columns: { id: true, ownerId: true },
  });
  if (!ing) throw new NotFoundError("Ingredient not found");

  const all = await db.query.allergens.findFirst({
    where: and(eq(allergens.id, allergenId), ownerId ? eq(allergens.ownerId, ownerId) : undefined),
    columns: { id: true, name: true },
  });
  if (!all) throw new NotFoundError("Allergen not found");

  // Use the ingredient's actual ownerId for the insert (important for admin editing public data)
  const effectiveOwnerId = ing.ownerId;

  const [row] = await db
    .insert(ingredientAllergens)
    .values({ ingredientId, allergenId, concentration: String(concentration), ownerId: effectiveOwnerId })
    .onConflictDoUpdate({
      target: [ingredientAllergens.ingredientId, ingredientAllergens.allergenId],
      set: { concentration: String(concentration) },
    })
    .returning();

  return { allergenId: row.allergenId, allergenName: all.name, concentration: Number(row.concentration) };
}

export async function deleteIngredientAllergen(
  ingredientId: number,
  allergenId: number,
  ownerId: string | null
) {
  const ing = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, ingredientId), ownerId ? eq(ingredients.ownerId, ownerId) : undefined),
    columns: { id: true },
  });
  if (!ing) throw new NotFoundError("Ingredient not found");

  await db
    .delete(ingredientAllergens)
    .where(
      and(
        eq(ingredientAllergens.ingredientId, ingredientId),
        eq(ingredientAllergens.allergenId, allergenId),
        ownerId ? eq(ingredientAllergens.ownerId, ownerId) : undefined
      )
    );
}
