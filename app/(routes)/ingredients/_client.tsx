// app/(routes)/ingredients/_client.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import type { Ingredient } from "@/lib/zodSchemas";
import { useSearch } from "@/hooks/useSearch";
import { SearchField } from "@/components/SearchField";


export function IngredientsListClient({ items }: { items: Ingredient[] }) {

  const { query, setQuery, filtered } = useSearch(items, { keys: ["name"] });


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SearchField value={query} onChange={setQuery} placeholder="Search ingredients..." />
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
