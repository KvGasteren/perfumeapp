// services/formulas.ts
import { api } from "./api";
import type { Formula, FormulaIngredientLink } from "@/lib/zodSchemas";

export const Formulas = {
  list: () => api.get<Formula[]>("/api/formulas"),
  byId: (id: number) => api.get<Formula>(`/api/formulas/${id}`),
  create: (payload: { name: string }) => api.post<Formula>("/api/formulas", payload),
  update: (id: number, patch: Partial<Formula>) =>
    api.patch<Formula>(`/api/formulas/${id}`, patch),
  remove: (id: number) => api.del(`/api/formulas/${id}`),

  // composition
  listIngredients: (id: number) =>
    api.get<FormulaIngredientLink[]>(`/api/formulas/${id}/ingredients`),

  upsertIngredient: (id: number, payload: { ingredientId: number; parts: number }) =>
    api.post(`/api/formulas/${id}/ingredients`, payload),

  deleteIngredient: (id: number, ingredientId: number) =>
    api.del(`/api/formulas/${id}/ingredients/${ingredientId}`),
};
