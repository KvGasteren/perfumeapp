"use client";

import { SearchField } from "@/components/SearchField";
import { Button } from "@/components/ui/Button";
import { Table, TD, TH, THead, TR } from "@/components/ui/Table";
import { useSearch } from "@/hooks/useSearch";
import { formatMax } from "@/lib/utils";
import { Allergen } from "@/lib/zodSchemas";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AllergensClient({ items }: { items: Allergen[] }) {
  const { query, setQuery, filtered } = useSearch<Allergen>(items, {
    keys: ["name", "casNumber"],
  });
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search Allergens (by name or CAS)..."
          className="flex-1 min-w-[200px]"
        />
        <Link href="/allergens/new">
          <Button>New</Button>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
          No allergens yet.
        </div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH className="w-[40%]">Name</TH>
              <TH className="w-[25%]">CAS-number</TH>
              <TH className="w-[25%]">Max. Concentration</TH>
            </TR>
          </THead>
          <tbody>
            {filtered.map((a) => (
              <TR
                key={a.id}
                onClick={() => router.push(`/allergens/${a.id}`)}
                className="cursor-pointer transition-colors hover:bg-neutral-50 active:bg-neutral-100"
              >
                <TD>
                  <div className="flex flex-col">{a.name}</div>
                </TD>
                <TD>
                  {a.casNumber && a.casNumber.trim().length > 0
                    ? a.casNumber
                    : "—"}
                </TD>
                <TD>{formatMax(a.maxConcentration)}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
