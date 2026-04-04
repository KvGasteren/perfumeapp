import PageHeader from "@/components/PageHeader";
import { getAllFormulasForOwner } from "@/lib/data/formulas";
import { getOwnerFilter } from "@/lib/owner";
import { FormulasClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function FormulasPage() {
  const ownerId = await getOwnerFilter();
  const items = await (ownerId ? getAllFormulasForOwner(ownerId) : []);

  return (
    <>
      <PageHeader title="Formulas" />
      <FormulasClient items={items} />
    </>
  );
}
