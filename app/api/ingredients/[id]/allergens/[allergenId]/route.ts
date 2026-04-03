import { getOwnerId } from "@/lib/owner";
import { parseIngredientAllergenIds } from "@/lib/params";
import { deleteIngredientAllergen } from "@/lib/data/ingredients";
import { NotFoundError } from "@/lib/data/errors";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; allergenId: string }> }
) {
  const ownerId = getOwnerId();
  const { id, allergenId } = await parseIngredientAllergenIds(params);
  try {
    await deleteIngredientAllergen(id, allergenId, ownerId);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof NotFoundError) return new Response(e.message, { status: 404 });
    throw e;
  }
}
