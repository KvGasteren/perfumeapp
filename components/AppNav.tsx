// components/AppNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const links = [
  { href: "/allergens", label: "Allergens" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/formulas", label: "Formulas" },
];

export function AppNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const admin = user?.publicMetadata?.role === "admin";

  return (
    <aside
      className={cn(
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
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {link.label}
            </Link>
          );
        })}

        {admin && (
          <>
            <div className="my-1 border-t border-neutral-100 lg:block hidden" />
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                pathname?.startsWith("/admin")
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-400 hover:bg-neutral-100"
              )}
            >
              Admin
            </Link>
          </>
        )}
        <div className="lg:mt-2 lg:border-t lg:border-neutral-100 lg:pt-2 ml-auto lg:ml-0 flex flex-row lg:flex-col gap-1">
          <Link
            href="/account"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
              pathname?.startsWith("/account")
                ? "bg-neutral-900 text-white"
                : "text-neutral-400 hover:bg-neutral-100"
            )}
          >
            My account
          </Link>
          <SignOutButton>
            <button className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition w-full",
              "text-neutral-400 hover:bg-neutral-100"
            )}>
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>
    </aside>
  );
}
