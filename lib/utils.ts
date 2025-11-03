export function cn(...vals: Array<string | undefined | false | null>) {
  return vals.filter(Boolean).join(" ");
}
