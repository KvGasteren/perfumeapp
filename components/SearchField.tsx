"use client";

import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchField({ value, onChange, placeholder, className }: SearchBarProps) {
  return <input
        className={cn("w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none", className)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search..."}
      />
}
