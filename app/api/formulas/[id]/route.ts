import { z } from "zod";
import { getOwnerId } from "@/lib/owner";
import { parseId } from "@/lib/params";
import { getFormulaById, updateFormula, deleteFormula } from "@/lib/data/formulas";
import { NotFoundError } from "@/lib/data/errors";

const patchSchema = z.object({ name: z.string().min(1) });

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = getOwnerId();
  const id = await parseId(params);
  const row = await getFormulaById(id, ownerId);
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
  try {
    const row = await updateFormula(id, name, ownerId);
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
  const ownerId = getOwnerId();
  const id = await parseId(params);
  try {
    await deleteFormula(id, ownerId);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    throw e;
  }
}
