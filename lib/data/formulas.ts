import { db } from "@/db";
import { formulas, formulaIngredients, ingredients } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";

const PUBLIC = "public";
import { NotFoundError } from "./errors";

// ── List ──────────────────────────────────────────────────────────────────────

export async function getAllFormulasAdmin() {
  return db.query.formulas.findMany({
    orderBy: (f, { asc }) => [asc(f.ownerId), asc(f.name)],
  });
}

export async function getAllFormulasForOwner(ownerId: string) {
  return db.query.formulas.findMany({
    where: (f, { or, eq }) => or(eq(f.ownerId, ownerId), eq(f.ownerId, PUBLIC)),
    orderBy: (f, { asc }) => [asc(f.name)],
  });
}

// ── Single ────────────────────────────────────────────────────────────────────

export async function getFormulaById(id: number, ownerId: string | null) {
  const row = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, id), ownerId ? or(eq(formulas.ownerId, ownerId), eq(formulas.ownerId, PUBLIC)) : undefined),
  });
  return row ?? null;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createFormula(name: string, ownerId: string) {
  const [row] = await db.insert(formulas).values({ name, ownerId }).returning();
  return row;
}

export async function updateFormula(id: number, name: string, ownerId: string | null) {
  const [row] = await db
    .update(formulas)
    .set({ name })
    .where(and(eq(formulas.id, id), ownerId ? eq(formulas.ownerId, ownerId) : undefined))
    .returning();
  if (!row) throw new NotFoundError("Formula not found");
  return row;
}

export async function deleteFormula(id: number, ownerId: string | null) {
  const [deleted] = await db
    .delete(formulas)
    .where(and(eq(formulas.id, id), ownerId ? eq(formulas.ownerId, ownerId) : undefined))
    .returning();
  if (!deleted) throw new NotFoundError("Formula not found");
}

// ── Ingredient links ──────────────────────────────────────────────────────────

export async function getFormulaIngredients(formulaId: number, ownerId: string | null) {
  const formula = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, formulaId), ownerId ? eq(formulas.ownerId, ownerId) : undefined),
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
        ownerId ? or(eq(formulaIngredients.ownerId, ownerId), eq(formulaIngredients.ownerId, PUBLIC)) : undefined,
        ownerId ? or(eq(ingredients.ownerId, ownerId), eq(ingredients.ownerId, PUBLIC)) : undefined
      )
    )
    .orderBy(ingredients.name);
}

export async function upsertFormulaIngredient(
  formulaId: number,
  ingredientId: number,
  parts: number,
  ownerId: string | null
) {
  const formula = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, formulaId), ownerId ? eq(formulas.ownerId, ownerId) : undefined),
    columns: { id: true, ownerId: true },
  });
  if (!formula) throw new NotFoundError("Formula not found");

  const ing = await db.query.ingredients.findFirst({
    where: and(eq(ingredients.id, ingredientId), ownerId ? eq(ingredients.ownerId, ownerId) : undefined),
    columns: { id: true, name: true },
  });
  if (!ing) throw new NotFoundError("Ingredient not found");

  // Use the formula's actual ownerId for the insert (important for admin editing public data)
  const effectiveOwnerId = formula.ownerId;

  const [row] = await db
    .insert(formulaIngredients)
    .values({ formulaId, ingredientId, parts, ownerId: effectiveOwnerId })
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
  ownerId: string | null
) {
  const formula = await db.query.formulas.findFirst({
    where: and(eq(formulas.id, formulaId), ownerId ? eq(formulas.ownerId, ownerId) : undefined),
    columns: { id: true },
  });
  if (!formula) throw new NotFoundError("Formula not found");

  await db
    .delete(formulaIngredients)
    .where(
      and(
        eq(formulaIngredients.formulaId, formulaId),
        eq(formulaIngredients.ingredientId, ingredientId),
        ownerId ? eq(formulaIngredients.ownerId, ownerId) : undefined
      )
    );
}
