import { db } from "@/db";
import { allergens, ingredientAllergens } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NotFoundError, ConflictError } from "./errors";

export async function getAllAllergensForOwner(ownerId: string) {
  return db.query.allergens.findMany({
    where: (a, { eq }) => eq(a.ownerId, ownerId),
    orderBy: (a, { asc }) => [asc(a.name)],
  });
}

export async function getAllergenById(id: number, ownerId: string) {
  const row = await db.query.allergens.findFirst({
    where: and(eq(allergens.id, id), eq(allergens.ownerId, ownerId)),
  });
  return row ?? null;
}

function toNumericString(v: string | number | null | undefined): string | null | undefined {
  if (v == null) return v as null | undefined;
  return String(v);
}

export async function createAllergen(
  data: { name: string; casNumber?: string | null; maxConcentration?: string | number | null },
  ownerId: string
) {
  const [row] = await db
    .insert(allergens)
    .values({ ...data, maxConcentration: toNumericString(data.maxConcentration), ownerId })
    .returning();
  return row;
}

export async function updateAllergen(
  id: number,
  patch: { name?: string; casNumber?: string | null; maxConcentration?: string | number | null },
  ownerId: string
) {
  const [row] = await db
    .update(allergens)
    .set({ ...patch, maxConcentration: toNumericString(patch.maxConcentration) })
    .where(and(eq(allergens.id, id), eq(allergens.ownerId, ownerId)))
    .returning();
  if (!row) throw new NotFoundError("Allergen not found");
  return row;
}

export async function deleteAllergen(id: number, ownerId: string) {
  const usage = await db
    .select()
    .from(ingredientAllergens)
    .where(and(eq(ingredientAllergens.allergenId, id), eq(ingredientAllergens.ownerId, ownerId)));

  if (usage.length > 0) {
    throw new ConflictError("Cannot delete: allergen is used in one or more ingredients.");
  }

  const [deleted] = await db
    .delete(allergens)
    .where(and(eq(allergens.id, id), eq(allergens.ownerId, ownerId)))
    .returning();

  if (!deleted) throw new NotFoundError("Allergen not found");
}
