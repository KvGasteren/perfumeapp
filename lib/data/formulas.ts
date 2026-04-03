import { db } from "@/db";
import { formulas, formulaIngredients, ingredients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NotFoundError } from "./errors";

// ── List ──────────────────────────────────────────────────────────────────────

export async function getAllFormulasForOwner(ownerId: string) {
  return db.query.formulas.findMany({
    where: eq(formulas.ownerId, ownerId),
    orderBy: (f, { asc }) => [asc(f.name)],
  });
}

// ── Single ────────────────────────────────────────────────────────────────────

export async function getFormulaById(id: number, ownerId: string) {
  const row = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, id), eq(formulas.ownerId, ownerId)),
  });
  return row ?? null;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createFormula(name: string, ownerId: string) {
  const [row] = await db.insert(formulas).values({ name, ownerId }).returning();
  return row;
}

export async function updateFormula(id: number, name: string, ownerId: string) {
  const [row] = await db
    .update(formulas)
    .set({ name })
    .where(and(eq(formulas.id, id), eq(formulas.ownerId, ownerId)))
    .returning();
  if (!row) throw new NotFoundError("Formula not found");
  return row;
}

export async function deleteFormula(id: number, ownerId: string) {
  const [deleted] = await db
    .delete(formulas)
    .where(and(eq(formulas.id, id), eq(formulas.ownerId, ownerId)))
    .returning();
  if (!deleted) throw new NotFoundError("Formula not found");
}

// ── Ingredient links ──────────────────────────────────────────────────────────

export async function getFormulaIngredients(formulaId: number, ownerId: string) {
  const formula = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, formulaId), eq(formulas.ownerId, ownerId)),
    columns: { id: true },
  });
  if (!formula) throw new NotFoundError("Formula not found");

  return db
    .select({
      ingredientId: ingredients.id,
      ingredientName: ingredients.name,
      parts: formulaIngredients.parts,
    })
    .from(formulaIngredients)
    .innerJoin(ingredients, eq(formulaIngredients.ingredientId, ingredients.id))
    .where(
      and(
        eq(formulaIngredients.formulaId, formulaId),
        eq(formulaIngredients.ownerId, ownerId),
        eq(ingredients.ownerId, ownerId)
      )
    )
    .orderBy(ingredients.name);
}

export async function upsertFormulaIngredient(
  formulaId: number,
  ingredientId: number,
  parts: number,
  ownerId: string
) {
  const formula = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, formulaId), eq(formulas.ownerId, ownerId)),
    columns: { id: true },
  });
  if (!formula) throw new NotFoundError("Formula not found");

  const ing = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, ingredientId), eq(ingredients.ownerId, ownerId)),
    columns: { id: true, name: true },
  });
  if (!ing) throw new NotFoundError("Ingredient not found");

  const [row] = await db
    .insert(formulaIngredients)
    .values({ formulaId, ingredientId, parts, ownerId })
    .onConflictDoUpdate({
      target: [formulaIngredients.formulaId, formulaIngredients.ingredientId, formulaIngredients.ownerId],
      set: { parts },
    })
    .returning();

  return { ingredientId: row.ingredientId, ingredientName: ing.name, parts: row.parts };
}

export async function deleteFormulaIngredient(
  formulaId: number,
  ingredientId: number,
  ownerId: string
) {
  const formula = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, formulaId), eq(formulas.ownerId, ownerId)),
    columns: { id: true },
  });
  if (!formula) throw new NotFoundError("Formula not found");

  await db
    .delete(formulaIngredients)
    .where(
      and(
        eq(formulaIngredients.formulaId, formulaId),
        eq(formulaIngredients.ingredientId, ingredientId),
        eq(formulaIngredients.ownerId, ownerId)
      )
    );
}
