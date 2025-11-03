import { z } from "zod";

export const Ingredient = z.object({ id: z.number(), name: z.string() });
export type Ingredient = z.infer<typeof Ingredient>;

export const AllergenLink = z.object({
  allergenId: z.number(),
  name: z.string().optional(),
  concentration: z.number(),
});
export type AllergenLink = z.infer<typeof AllergenLink>;

export const Formula = z.object({ id: z.number(), name: z.string() });
export type Formula = z.infer<typeof Formula>;


export const Allergen = z.object({
  id: z.number(),
  name: z.string(),
  // add other fields here if your DB has them, e.g.
  // ifraLimit: z.number().nullable().optional(),
  // casNumber: z.string().nullable().optional(),
});
export type Allergen = z.infer<typeof Allergen>;


// do we need ingredientlinks?