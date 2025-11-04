"use client";

import { SearchField } from "@/components/SearchField";
import { Button } from "@/components/ui/Button";
import { Table, TD, TH, THead, TR } from "@/components/ui/Table";
import { useSearch } from "@/hooks/useSearch";
import { Allergen } from "@/lib/zodSchemas";
import Link from "next/link";

export function AllergensClient({ items }: { items: Allergen[] }) {
  const { query, setQuery, filtered } = useSearch<Allergen>(items, {
    keys: ["name", "casNumber"],
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search Allergens..."
        />
        <Link href="/allergens/new">
          <Button>New</Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No allergens yet</div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH width="120px">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {filtered.map((a) => (
              <TR key={a.id}>
                <TD>
                  <Link
                    href={`/allergens/${a.id}`}
                    className="hover:underline font-medium"
                  >
                    {a.name}
                  </Link>

                  {/* extra details line, muted just like in ingredient detail */}
                  {(a.casNumber || a.maxConcentration != null) && (
                    <div className="text-xs text-neutral-500 mt-1">
                      {a.casNumber ? (
                        <span>CAS: {a.casNumber}</span>
                      ) : null}
                      {a.casNumber && a.maxConcentration != null ? " • " : null}
                      {a.maxConcentration != null ? (
                        <span>Max: {a.maxConcentration}%</span>
                      ) : null}
                    </div>
                  )}
                </TD>
                <TD>
                  <Link
                    href={`/allergens/${a.id}`}
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
