import { api } from "./api";
import type { Ingredient, AllergenLink } from "@/lib/zodSchemas";

export const Ingredients = {
  list: () => api.get<Ingredient[]>("/api/ingredients"),
  byId: (id: number) => api.get<Ingredient>(`/api/ingredients/${id}`),
  update: (id: number, patch: Partial<Ingredient>) =>
    api.patch<Ingredient>(`/api/ingredients/${id}`, patch),
  remove: (id: number) => api.del(`/api/ingredients/${id}`),

  // links
  listAllergens: (id: number) =>
    api.get<AllergenLink[]>(`/api/ingredients/${id}/allergens`),
  upsertAllergen: (
    id: number,
    payload: { allergenId: number; concentration: number }
  ) => api.post(`/api/ingredients/${id}/allergens`, payload),
  deleteAllergen: (id: number, allergenId: number) =>
    api.del(`/api/ingredients/${id}/allergens/${allergenId}`),
};
