import { z } from "zod";
import { getOwnerFilter } from "@/lib/owner";
import { parseId } from "@/lib/params";
import { getIngredientById, getIngredientAllergens, upsertIngredientAllergen } from "@/lib/data/ingredients";
import { NotFoundError } from "@/lib/data/errors";

const upsertSchema = z.object({
  allergenId: z.coerce.number().int().positive(),
  concentration: z.coerce.number().nonnegative(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [id, ownerFilter] = await Promise.all([parseId(params), getOwnerFilter()]);
  const ing = await getIngredientById(id, ownerFilter);
  if (!ing) return new Response("Ingredient not found", { status: 404 });
  const rows = await getIngredientAllergens(id, ownerFilter);
  return Response.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [id, ownerFilter, { allergenId, concentration }] = await Promise.all([
    parseId(params),
    getOwnerFilter(),
    req.json().then((b) => upsertSchema.parse(b)),
  ]);
  try {
    const row = await upsertIngredientAllergen(id, allergenId, concentration, ownerFilter);
    return Response.json(row, { status: 201 });
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    throw e;
  }
}
