/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import { formulas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getOwnerId } from "@/lib/owner";

const createSchema = z.object({ name: z.string().min(1) });

export async function GET() {
  try {}
  const ownerId = getOwnerId();
  const rows = await db.query.formulas.findMany({
    where: eq(formulas.ownerId, ownerId),
    orderBy: (i: { name: any; }, { asc }: any) => [asc(i.name)],
  });
  return Response.json(rows);
} catch (error) {
  console.error("DB error", error);
  return new Response.json({error: "Database error", detail: String(error)}, {status: 500});
}

export async function POST(req: Request) {
  const ownerId = getOwnerId();
  const body = await req.json();
  const { name } = createSchema.parse(body);
  const [row] = await db.insert(formulas).values({ name, ownerId }).returning();
  return Response.json(row, { status: 201 });
}
