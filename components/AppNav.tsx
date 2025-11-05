// components/AppNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/allergens", label: "Allergens" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/formulas", label: "Formulas" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
     <aside
      className={cn(
        // mobile: full width card; desktop: narrow sidebar
        "w-full rounded-lg border border-neutral-200 bg-white p-3 shadow-sm lg:w-56 lg:shrink-0 lg:self-start"
      )}
    >
      <div className="flex flex-row gap-2 lg:flex-col">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-neutral-900 text-white lg:bg-white lg:text-neutral-900 lg:shadow-sm"
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
