import { z } from "zod";
import { getOwnerId } from "@/lib/owner";
import { getAllFormulasForOwner, createFormula } from "@/lib/data/formulas";

const createSchema = z.object({ name: z.string().min(1) });

export async function GET() {
  const ownerId = getOwnerId();
  const rows = await getAllFormulasForOwner(ownerId);
  return Response.json(rows);
}

export async function POST(req: Request) {
  const ownerId = getOwnerId();
  const { name } = createSchema.parse(await req.json());
  const row = await createFormula(name, ownerId);
  return Response.json(row, { status: 201 });
}
