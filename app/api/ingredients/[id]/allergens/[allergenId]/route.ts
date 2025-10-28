import { db } from "@/db";
import { ingredientAllergens, ingredients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getOwnerId } from "@/lib/owner";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  allergenId: z.coerce.number().int().positive(),
});

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; allergenId: string } }
) {
  const ownerId = getOwnerId();
  const { id, allergenId } = paramsSchema.parse(params);

  // Optional: ensure the ingredient exists for clearer 404s
  const ing = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId)),
    columns: { id: true },
  });
  if (!ing) return new Response("Ingredient not found", { status: 404 });

  const res = await db
    .delete(ingredientAllergens)
    .where(
      and(
        eq(ingredientAllergens.ingredientId, id),
        eq(ingredientAllergens.allergenId, allergenId),
        eq(ingredientAllergens.ownerId, ownerId)
      )
    )
    .returning();

  if (res.length === 0) {
    // Not found (either link absent or belonged to another owner)
    return new Response(null, { status: 204 });
  }
  return new Response(null, { status: 204 });
}
