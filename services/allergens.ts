import { api } from "./api";
import type { Allergen } from "@/lib/zodSchemas";

export const Allergens = {
  list: () => api.get<Allergen[]>("/api/allergens"),
  byId: (id: number) => api.get<Allergen>(`/api/allergens/${id}`),
  create: (payload: { name: string }) =>
    api.post<Allergen>("/api/allergens", payload),
  update: (id: number, patch: Partial<Allergen>) =>
    api.patch<Allergen>(`/api/allergens/${id}`, patch),
  remove: (id: number) => api.del(`/api/allergens/${id}`),
};
