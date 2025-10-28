import { db } from "@/db";
import { allergens, ingredientAllergens } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getOwnerId } from "@/lib/owner";

const idParam = z.object({ id: z.coerce.number().int().positive() });
const patchSchema = z.object({ name: z.string().min(1) });

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const ownerId = getOwnerId();
  const { id } = idParam.parse(params);
  const row = await db.query.allergens.findFirst({
    where: and(eq(allergens.id, id), eq(allergens.ownerId, ownerId)),
  });
  if (!row) return new Response("Not found", { status: 404 });
  return Response.json(row);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ownerId = getOwnerId();
  const { id } = idParam.parse(params);
  const { name } = patchSchema.parse(await req.json());

  const [row] = await db.update(allergens)
    .set({ name })
    .where(and(eq(allergens.id, id), eq(allergens.ownerId, ownerId)))
    .returning();

  if (!row) return new Response("Not found", { status: 404 });
  return Response.json(row);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ownerId = getOwnerId();
  const { id } = idParam.parse(params);

  // Guard: block deletion if used in any formula
  const usage = await db.select().from(ingredientAllergens).where(
    and(eq(ingredientAllergens.allergenId, id), eq(ingredientAllergens.ownerId, ownerId))
  );

  if (usage.length > 0) {
    return Response.json(
      { error: "Cannot delete: ingredient is used in one or more formulas." },
      { status: 422 }
    );
  }

  const [deleted] = await db.delete(allergens)
    .where(and(eq(allergens.id, id), eq(allergens.ownerId, ownerId)))
    .returning();

  if (!deleted) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 204 });
}
