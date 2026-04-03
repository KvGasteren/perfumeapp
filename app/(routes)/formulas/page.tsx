import PageHeader from "@/components/PageHeader";
import { getAllFormulasForOwner } from "@/lib/data/formulas";
import { getOwnerId } from "@/lib/owner";
import { FormulasClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function FormulasPage() {
  const items = await getAllFormulasForOwner(getOwnerId());

  return (
    <>
      <PageHeader title="Formulas" />
      <FormulasClient items={items} />
    </>
  );
}
