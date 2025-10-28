import { z } from "zod";

const idSchema = z.coerce.number().int().positive();

export async function parseId(params: Promise<{ id: string }>) {
  const { id } = await params;
  return idSchema.parse(id);
}

export async function parseParams<T extends z.ZodTypeAny>(
  paramsPromise: Promise<unknown>,
  schema: T
): Promise<z.infer<T>> {
  const params = await paramsPromise;
  return schema.parse(params);
}

export async function parseIngredientAllergenIds(
  params: Promise<{ id: string; allergenId: string}>
) {
  const schema = z.object({
    id: z.coerce.number().int().positive(),
    allergenId: z.coerce.number().int().positive(),
  });
  return parseParams(params, schema);
}

export async function parseFormulaIngredientIds(
  params: Promise<{ id: string; ingredientId: string; }>
) {
  const schema = z.object({
    id: z.coerce.number().int().positive(),
    ingredientId: z.coerce.number().int().positive()
  })
  return parseParams(params, schema)
}