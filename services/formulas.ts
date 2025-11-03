import { api } from "./api";
import type { Formula } from "@/lib/zodSchemas";

export const Formulas = {
  list: () => api.get<Formula[]>("/api/formulas"),
  byId: (id: number) => api.get<Formula>(`/api/formulas/${id}`),
  update: (id: number, patch: Partial<Formula>) =>
    api.patch<Formula>(`/api/formulas/${id}`, patch),
  remove: (id: number) => api.del(`/api/formulas/${id}`),
};
