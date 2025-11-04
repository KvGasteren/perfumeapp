import { Allergen } from "./zodSchemas";

export function cn(...vals: Array<string | undefined | false | null>) {
  return vals.filter(Boolean).join(" ");
}

export const formatMax = (val: Allergen["maxConcentration"]) => {
  if (val == null) return "-";
  return `${(+val * 100).toPrecision(6)}%`;
};

export function formatAllergenPreview(
  topAllergens: { id: number; name: string }[] = [],
  totalCount: number
) {
  if (totalCount === 0) return "No allergens";

  if (totalCount <= 3) {
    return topAllergens.map((a) => a.name).join(", ");
  }

  // total > 3 ⇒ show first 2
  const visible = topAllergens
    .slice(0, 2)
    .map((a) => a.name)
    .join(", ");
  const remaining = totalCount - 2;
  return `${visible}, +${remaining} more`;
}
