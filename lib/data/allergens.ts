import { db } from "@/db";
import { allergens } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getOwnerId } from "../owner";

// export async function getAllAllergens() {
//   return db.select().from(allergens).orderBy(asc(allergens.name));
// }

export async function getAllergenById(id: number) {
  const ownerId = getOwnerId();
  const [row] = await db.select().from(allergens).where(and(eq(allergens.id, id), eq(allergens.ownerId, ownerId))).orderBy();
  return row ?? null;
}

export async function createAllergen(data: { name: string; casNumber?: string }) {
  const [inserted] = await db.insert(allergens).values(data).returning();
  return inserted;
}

export async function updateAllergen(id: number, patch: { name?: string; casNumber?: string }) {
  const [updated] = await db.update(allergens).set(patch).where(eq(allergens.id, id)).returning();
  return updated;
}


export async function getAllAllergensForOwner(ownerId: string) {
  if (!ownerId) throw new Error("Missing ownerId")
  return db.query.allergens.findMany({
    where: (a, { eq }) => eq(a.ownerId, ownerId),
    orderBy: (a, { asc }) => [asc(a.name)],
  });
}
