// app/(routes)/ingredients/_client.tsx
"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import type { Ingredient } from "@/lib/zodSchemas";

export function IngredientsListClient({ items }: { items: Ingredient[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ingredients…"
          className="w-64 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400"
        />
        <Link href="/ingredients/new">
          <Button>New</Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No ingredients found</div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH width="120px">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {filtered.map((ing) => (
              <TR key={ing.id}>
                <TD>
                  <Link href={`/ingredients/${ing.id}`} className="hover:underline">
                    {ing.name}
                  </Link>
                </TD>
                <TD>
                  <Link
                    href={`/ingredients/${ing.id}`}
                    className="text-sm text-neutral-600 hover:underline"
                  >
                    Edit
                  </Link>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
