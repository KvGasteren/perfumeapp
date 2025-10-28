import { ZodSchema } from "zod";

export async function parseParams<T>(
  paramsPromise: Promise<unknown>,
  schema: ZodSchema<T>
): Promise<T> {
  const params = await paramsPromise;
  return schema.parse(params);
}