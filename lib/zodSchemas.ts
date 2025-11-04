// lib/zodSchemas.ts
import { z } from "zod";

export const Ingredient = z.object({ id: z.number(), name: z.string() });
export type Ingredient = z.infer<typeof Ingredient>;

export const Allergen = z.object({
  id: z.number(),
  name: z.string(),
  casNumber: z.string().optional(),
  maxConcentration: z.union([z.number(), z.string()]).optional(),
});
export type Allergen = z.infer<typeof Allergen>;

export const AllergenLink = z.object({
  allergenId: z.number(),
  name: z.string().optional(),
  concentration: z.number(),
});
export type AllergenLink = z.infer<typeof AllergenLink>;

export const Formula = z.object({ id: z.number(), name: z.string() });
export type Formula = z.infer<typeof Formula>;

/** link between formula and ingredient */
export const FormulaIngredientLink = z.object({
  ingredientId: z.number(),
  ingredientName: z.string().optional(),
  parts: z.number(),
});
export type FormulaIngredientLink = z.infer<typeof FormulaIngredientLink>;
