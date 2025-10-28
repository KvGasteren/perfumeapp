import { db } from "@/db";
import {
  ingredients,
  allergens,
  ingredientAllergens,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getOwnerId } from "@/lib/owner";

const idParam = z.object({ id: z.coerce.number().int().positive() });

const upsertSchema = z.object({
  allergenId: z.number().int().positive(),
  concentration: z.number().finite().nonnegative(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const ownerId = getOwnerId();
  const { id } = idParam.parse(params);

  // Ensure the ingredient exists for this owner
  const ing = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId)),
  });
  if (!ing) return new Response("Ingredient not found", { status: 404 });

  const rows = await db
    .select({
      allergenId: allergens.id,
      allergenName: allergens.name,
      concentration: ingredientAllergens.concentration,
    })
    .from(ingredientAllergens)
    .innerJoin(allergens, eq(ingredientAllergens.allergenId, allergens.id))
    .where(
      and(
        eq(ingredientAllergens.ingredientId, id),
        eq(ingredientAllergens.ownerId, ownerId),
        eq(allergens.ownerId, ownerId)
      )
    )
    .orderBy(allergens.name);

  return Response.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const ownerId = getOwnerId();
  const { id } = idParam.parse(params);
  const { allergenId, concentration } = upsertSchema.parse(await req.json());

  // Guard: ingredient must exist
  const ing = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId)),
    columns: { id: true },
  });
  if (!ing) return new Response("Ingredient not found", { status: 404 });

  // Guard: allergen must exist (and belong to same owner)
  const all = await db.query.allergens.findFirst({
    where: and(eq(allergens.id, allergenId), eq(allergens.ownerId, ownerId)),
    columns: { id: true, name: true },
  });
  if (!all) return new Response("Allergen not found", { status: 404 });

  // Upsert link using composite PK (ingredient_id, allergen_id)
  const [row] = await db
    .insert(ingredientAllergens)
    .values({
      ingredientId: id,
      allergenId,
      concentration,
      ownerId,
    })
    .onConflictDoUpdate({
      target: [ingredientAllergens.ingredientId, ingredientAllergens.allergenId],
      set: { concentration },
    })
    .returning();

  // Return the joined view for convenience
  return Response.json(
    { allergenId: row.allergenId, allergenName: all.name, concentration: row.concentration },
    { status: 201 }
  );
}
