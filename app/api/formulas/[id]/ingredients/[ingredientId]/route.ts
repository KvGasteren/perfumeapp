import { getOwnerId } from "@/lib/owner";
import { parseFormulaIngredientIds } from "@/lib/params";
import { deleteFormulaIngredient } from "@/lib/data/formulas";
import { NotFoundError } from "@/lib/data/errors";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; ingredientId: string }> }
) {
  const ownerId = getOwnerId();
  const { id, ingredientId } = await parseFormulaIngredientIds(params);
  try {
    await deleteFormulaIngredient(id, ingredientId, ownerId);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    throw e;
  }
}
