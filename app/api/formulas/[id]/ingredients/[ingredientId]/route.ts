import { getOwnerFilter } from "@/lib/owner";
import { parseFormulaIngredientIds } from "@/lib/params";
import { deleteFormulaIngredient } from "@/lib/data/formulas";
import { NotFoundError } from "@/lib/data/errors";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; ingredientId: string }> }
) {
  const [{ id, ingredientId }, ownerFilter] = await Promise.all([
    parseFormulaIngredientIds(params),
    getOwnerFilter(),
  ]);
  try {
    await deleteFormulaIngredient(id, ingredientId, ownerFilter);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    throw e;
  }
}
