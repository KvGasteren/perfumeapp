"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { useSearch } from "@/hooks/useSearch";
import { SearchField } from "@/components/SearchField";
import { useRouter } from "next/navigation";
import { IngredientWithAllergenSummary } from "@/lib/data/ingredients";
import { formatAllergenPreview } from "@/lib/utils";

export function IngredientsListClient({
  items,
}: {
  items: IngredientWithAllergenSummary[];
}) {
  const { query, setQuery, filtered } = useSearch(items, { keys: ["name"] });
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Search ingredients..."
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
              <TH>Allergens</TH>
            </TR>
          </THead>
          <tbody>
            {filtered.map((ing) => (
              <TR
                key={ing.id}
                onClick={() => router.push(`/ingredients/${ing.id}`)}
                className="cursor-pointer transition-colors hover:bg-neutral-50 active:bg-neutral-100"
              >
                <TD>{ing.name}</TD>
                <TD>
                  {formatAllergenPreview(ing.topAllergens, ing.allergenCount)}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
