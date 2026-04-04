import { Allergen } from "./zodSchemas";

export function cn(...vals: Array<string | undefined | false | null>) {
  return vals.filter(Boolean).join(" ");
}

/**
 * Convert a stored fraction (0.02) to a percentage string for display in inputs.
 * e.g. fractionToPercent(0.02) → "2.00"
 */
export function fractionToPercent(val: number | string | null | undefined, decimals = 6): string {
  if (val == null || val === "") return "";
  const n = typeof val === "string" ? Number(val) : val;
  if (Number.isNaN(n)) return "";
  return (n * 100).toFixed(decimals);
}

/**
 * Convert a percentage string from an input (e.g. "2") to a fraction string for the backend.
 * e.g. percentToFraction("2") → "0.020000"
 */
export function percentToFraction(val: string, decimals = 8): string {
  if (val.trim() === "") return "";
  const n = Number(val);
  if (Number.isNaN(n)) return "";
  return (n / 100).toFixed(decimals);
}

/**
 * Format a stored fraction as a percentage string for display (not in inputs).
 * e.g. formatMax(0.02) → "2.00%"
 */
export const formatMax = (val: Allergen["maxConcentration"]) => {
  if (val == null) return "—";
  const pct = +val * 100;
  return `${pct.toFixed(2)}%`;
};

export function formatAllergenPreview(
  topAllergens: { id: number; name: string }[] = [],
  totalCount: number
) {
  if (totalCount === 0) return "No allergens";

  if (totalCount <= 3) {
    return topAllergens.map((a) => a.name).join(", ");
  }

  const visible = topAllergens
    .slice(0, 2)
    .map((a) => a.name)
    .join(", ");
  const remaining = totalCount - 2;
  return `${visible}, +${remaining} more`;
}
