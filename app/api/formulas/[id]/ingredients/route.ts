import { z } from "zod";
import { getOwnerFilter } from "@/lib/owner";
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
  const [id, ownerFilter] = await Promise.all([parseId(params), getOwnerFilter()]);
  try {
    const rows = await getFormulaIngredients(id, ownerFilter);
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
  const [id, ownerFilter, { ingredientId, parts }] = await Promise.all([
    parseId(params),
    getOwnerFilter(),
    req.json().then((b) => upsertSchema.parse(b)),
  ]);
  try {
    const row = await upsertFormulaIngredient(id, ingredientId, parts, ownerFilter);
    return Response.json(row, { status: 201 });
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    throw e;
  }
}
