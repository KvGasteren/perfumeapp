// app/(routes)/allergens/page.tsx
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import Link from "next/link";
import { Allergens } from "@/services/allergens";

export const dynamic = "force-dynamic";

export default async function AllergensPage() {
  const items = await Allergens.list();

  return (
    <div>
      <PageHeader
        title="Allergens"
        actions={
          <Link href="/allergens/new">
            <Button>New</Button>
          </Link>
        }
      />

      {items.length === 0 ? (
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
            {items.map((a) => (
              <TR key={a.id}>
                <TD>
                  <Link href={`/allergens/${a.id}`} className="hover:underline">
                    {a.name}
                  </Link>
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
