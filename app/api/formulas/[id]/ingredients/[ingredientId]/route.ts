import { db } from "@/db";
import { formulaIngredients, formulas } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getOwnerId } from "@/lib/owner";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
  ingredientId: z.coerce.number().int().positive(),
});

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; ingredientId: string } }
) {
  const ownerId = getOwnerId();
  const { id, ingredientId } = paramsSchema.parse(params);

  // Optional: clearer 404 if the formula doesn't exist for this owner
  const f = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, id), eq(formulas.ownerId, ownerId)),
    columns: { id: true },
  });
  if (!f) return new Response("Formula not found", { status: 404 });

  await db
    .delete(formulaIngredients)
    .where(
      and(
        eq(formulaIngredients.formulaId, id),
        eq(formulaIngredients.ingredientId, ingredientId),
        eq(formulaIngredients.ownerId, ownerId)
      )
    );

  // 204 even if nothing was deleted (idempotent)
  return new Response(null, { status: 204 });
}
