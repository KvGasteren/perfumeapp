import { db } from "@/db";
import { formulas, formulaIngredients } from "@/db/schema";
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
  const id = await parseId(params);
  const row = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, id), eq(formulas.ownerId, ownerId)),
  });
  if (!row) return new Response("Not found", { status: 404 });
  return Response.json(row);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = getOwnerId();
  const id = await parseId(params);

  const { name } = patchSchema.parse(await req.json());

  const [row] = await db
    .update(formulas)
    .set({ name })
    .where(and(eq(formulas.id, id), eq(formulas.ownerId, ownerId)))
    .returning();

  if (!row) return new Response("Not found", { status: 404 });
  return Response.json(row);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = getOwnerId();
  const id = await parseId(params);

  const [deleted] = await db
    .delete(formulas)
    .where(and(eq(formulas.id, id), eq(formulas.ownerId, ownerId)))
    .returning();

  if (!deleted) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 204 });
}
