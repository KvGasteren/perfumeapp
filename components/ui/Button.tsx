"use client";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition";
  const variants = {
    primary: "bg-black text-white hover:bg-neutral-800",
    secondary:
      "bg-white text-neutral-900 ring-1 ring-neutral-300 hover:bg-neutral-50",
    ghost: "bg-transparent hover:bg-neutral-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  } as const;
  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}
