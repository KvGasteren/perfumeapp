import { z } from "zod";
import { getOwnerFilter } from "@/lib/owner";
import { parseId } from "@/lib/params";
import { getIngredientById, updateIngredient, deleteIngredient } from "@/lib/data/ingredients";
import { NotFoundError, ConflictError } from "@/lib/data/errors";

const patchSchema = z.object({ name: z.string().min(1) });

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [id, ownerFilter] = await Promise.all([parseId(params), getOwnerFilter()]);
  const row = await getIngredientById(id, ownerFilter);
  if (!row) return new Response("Not found", { status: 404 });
  return Response.json(row);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [id, ownerFilter, { name }] = await Promise.all([
    parseId(params),
    getOwnerFilter(),
    req.json().then((b) => patchSchema.parse(b)),
  ]);
  try {
    const row = await updateIngredient(id, name, ownerFilter);
    return Response.json(row);
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    throw e;
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [id, ownerFilter] = await Promise.all([parseId(params), getOwnerFilter()]);
  try {
    await deleteIngredient(id, ownerFilter);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    if (e instanceof ConflictError) return Response.json({ error: e.message }, { status: 422 });
    throw e;
  }
}
