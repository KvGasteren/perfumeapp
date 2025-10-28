import { db } from "@/db";
import { ingredients, formulaIngredients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getOwnerId } from "@/lib/owner";
import { parseId } from "@/lib/params";

const patchSchema = z.object({ name: z.string().min(1) });

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = getOwnerId();
  const id  = await parseId(params);
  const row = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId)),
  });
  if (!row) return new Response("Not found", { status: 404 });
  return Response.json(row);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = getOwnerId();
  const id  = await parseId(params);
  const { name } = patchSchema.parse(await req.json());

  const [row] = await db
    .update(ingredients)
    .set({ name })
    .where(and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId)))
    .returning();

  if (!row) return new Response("Not found", { status: 404 });
  return Response.json(row);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = getOwnerId();
  const id  = await parseId(params);

  // Guard: block deletion if used in any formula
  const usage = await db
    .select()
    .from(formulaIngredients)
    .where(
      and(
        eq(formulaIngredients.ingredientId, id),
        eq(formulaIngredients.ownerId, ownerId)
      )
    );

  if (usage.length > 0) {
    return Response.json(
      { error: "Cannot delete: ingredient is used in one or more formulas." },
      { status: 422 }
    );
  }

  const [deleted] = await db
    .delete(ingredients)
    .where(and(eq(ingredients.id, id), eq(ingredients.ownerId, ownerId)))
    .returning();

  if (!deleted) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 204 });
}
