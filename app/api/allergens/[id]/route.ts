import { z } from "zod";
import { getOwnerId } from "@/lib/owner";
import { parseId } from "@/lib/params";
import { getAllergenById, updateAllergen, deleteAllergen } from "@/lib/data/allergens";
import { NotFoundError, ConflictError } from "@/lib/data/errors";

const patchSchema = z.object({
  name: z.string().min(1),
  casNumber: z.string().optional().nullable(),
  maxConcentration: z.union([z.number(), z.string()]).optional().nullable(),
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = await getOwnerId();
  const id = await parseId(params);
  const row = await getAllergenById(id, ownerId);
  if (!row) return new Response("Not found", { status: 404 });
  return Response.json(row);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = await getOwnerId();
  const id = await parseId(params);
  const parsed = patchSchema.parse(await req.json());
  try {
    const row = await updateAllergen(id, parsed, ownerId);
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
  const ownerId = await getOwnerId();
  const id = await parseId(params);
  try {
    await deleteAllergen(id, ownerId);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    if (e instanceof ConflictError) return Response.json({ error: e.message }, { status: 422 });
    throw e;
  }
}
