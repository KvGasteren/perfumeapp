import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import Link from "next/link";
import { Formulas } from "@/services/formulas";

export const dynamic = "force-dynamic";

export default async function FormulasPage() {
  const items = await Formulas.list();
  return (
    <div>
      <PageHeader
        title="Formulas"
        actions={
          <Link href="/formulas/new">
            <Button>New</Button>
          </Link>
        }
      />
      {items.length === 0 ? (
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
            {items.map((f) => (
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
