// components/AppNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/ingredients", label: "Ingredients" },
  { href: "/allergens", label: "Allergens" },
  { href: "/formulas", label: "Formulas" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0">
      <div className="space-y-1">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
