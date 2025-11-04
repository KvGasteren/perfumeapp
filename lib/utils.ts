import { Allergen } from "./zodSchemas";

export function cn(...vals: Array<string | undefined | false | null>) {
  return vals.filter(Boolean).join(" ");
}


export const formatMax = (val: Allergen["maxConcentration"]) => {
    if (val == null) return "-";
    return `${(+val * 100).toPrecision(6)}%`;
  };
