import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import Link from "next/link";
import { Ingredients } from "@/services/ingredients";

export const dynamic = "force-dynamic"; // always refetch on request

export default async function IngredientsPage() {
  const items = await Ingredients.list();
  return (
    <div>
      <PageHeader
        title="Ingredients"
        actions={
          <Link href="/ingredients/new">
            <Button>New</Button>
          </Link>
        }
      />
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-neutral-500">
          No ingredients yet
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
            {items.map((ing) => (
              <TR key={ing.id}>
                <TD>
                  <Link
                    href={`/ingredients/${ing.id}`}
                    className="hover:underline"
                  >
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
