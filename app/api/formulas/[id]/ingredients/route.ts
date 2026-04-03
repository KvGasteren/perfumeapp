import { z } from "zod";
import { getOwnerId } from "@/lib/owner";
import { parseId } from "@/lib/params";
import { getFormulaIngredients, upsertFormulaIngredient } from "@/lib/data/formulas";
import { NotFoundError } from "@/lib/data/errors";

const upsertSchema = z.object({
  ingredientId: z.number().int().positive(),
  parts: z.number().finite().nonnegative(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = await getOwnerId();
  const id = await parseId(params);
  try {
    const rows = await getFormulaIngredients(id, ownerId);
    return Response.json(rows);
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    throw e;
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerId = await getOwnerId();
  const id = await parseId(params);
  const { ingredientId, parts } = upsertSchema.parse(await req.json());
  try {
    const row = await upsertFormulaIngredient(id, ingredientId, parts, ownerId);
    return Response.json(row, { status: 201 });
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    throw e;
  }
}
