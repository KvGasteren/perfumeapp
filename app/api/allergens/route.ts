import { z } from "zod";
import { getOwnerId } from "@/lib/owner";
import { getAllAllergensForOwner, createAllergen } from "@/lib/data/allergens";
import { ConflictError } from "@/lib/data/errors";

const createSchema = z.object({
  name: z.string().min(1),
  casNumber: z.string().optional().nullable(),
  maxConcentration: z.union([z.number(), z.string()]).optional().nullable(),
});

export async function GET() {
  const ownerId = await getOwnerId();
  const rows = await getAllAllergensForOwner(ownerId);
  return Response.json(rows);
}

export async function POST(req: Request) {
  try {
    const ownerId = await getOwnerId();
    const parsed = createSchema.parse(await req.json());
    const row = await createAllergen(parsed, ownerId);
    return Response.json(row, { status: 201 });
  } catch (err) {
    if (err instanceof ConflictError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
