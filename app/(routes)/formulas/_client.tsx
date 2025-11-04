"use client"

import { SearchField } from "@/components/SearchField";
import { Button } from "@/components/ui/Button";
import { Table, TD, TH, THead, TR } from "@/components/ui/Table";
import { useSearch } from "@/hooks/useSearch";
import { Formula } from "@/lib/zodSchemas";
import Link from "next/link";

export function FormulasClient({ items }: { items: Formula[] }) {
  const { query, setQuery, filtered } = useSearch(items, { keys: ["name"] });
 return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SearchField value={query} onChange={setQuery} placeholder="Search formulas..." />
        <Link href="/formulas/new">
          <Button>New</Button>
        </Link>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-neutral-500">
          No formulas yet
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH width="120px">Actions</TH>
            </TR>
          </THead>
          <tbody>
            {filtered.map((f) => (
              <TR key={f.id}>
                <TD>
                  <Link href={`/formulas/${f.id}`} className="hover:underline">
                    {f.name}
                  </Link>
                </TD>
                <TD>
                  <Link
                    href={`/formulas/${f.id}`}
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