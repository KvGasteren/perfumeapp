"use client";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-neutral-400",
        "focus:border-neutral-400",
        className
      )}
      {...props}
    />
  );
}
