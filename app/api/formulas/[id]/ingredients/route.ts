import { db } from "@/db";
import { formulas, formulaIngredients, ingredients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getOwnerId } from "@/lib/owner";

const idParam = z.object({ id: z.coerce.number().int().positive() });

const upsertSchema = z.object({
  ingredientId: z.number().int().positive(),
  parts: z.number().finite().nonnegative(), // allow 0..∞; clamp/validate in UI if you need sums to 100
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const ownerId = getOwnerId();
  const { id } = idParam.parse(params);

  // Ensure the formula exists for this owner
  const formula = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, id), eq(formulas.ownerId, ownerId)),
  });
  if (!formula) return new Response("Formula not found", { status: 404 });

  const rows = await db
    .select({
      ingredientId: ingredients.id,
      ingredientName: ingredients.name,
      parts: formulaIngredients.parts,
    })
    .from(formulaIngredients)
    .innerJoin(ingredients, eq(formulaIngredients.ingredientId, ingredients.id))
    .where(
      and(
        eq(formulaIngredients.formulaId, id),
        eq(formulaIngredients.ownerId, ownerId),
        eq(ingredients.ownerId, ownerId)
      )
    )
    .orderBy(ingredients.name);

  return Response.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const ownerId = getOwnerId();
  const { id } = idParam.parse(params);
  const { ingredientId, parts } = upsertSchema.parse(await req.json());

  // Guards
  const f = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, id), eq(formulas.ownerId, ownerId)),
    columns: { id: true },
  });
  if (!f) return new Response("Formula not found", { status: 404 });

  const ing = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, ingredientId), eq(ingredients.ownerId, ownerId)),
    columns: { id: true, name: true },
  });
  if (!ing) return new Response("Ingredient not found", { status: 404 });

  // Upsert composition row (formulaId + ingredientId) → parts
  // NOTE: This uses ON CONFLICT on (formula_id, ingredient_id). See schema note below.
  const [row] = await db
    .insert(formulaIngredients)
    .values({
      formulaId: id,
      ingredientId,
      parts,
      ownerId,
    })
    .onConflictDoUpdate({
      target: [formulaIngredients.formulaId, formulaIngredients.ingredientId],
      set: { parts },
    })
    .returning();

  return Response.json(
    { ingredientId: row.ingredientId, ingredientName: ing.name, parts: row.parts },
    { status: 201 }
  );
}
