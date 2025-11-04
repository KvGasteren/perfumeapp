import PageHeader from "@/components/PageHeader";
import { Formulas } from "@/services/formulas";
import { FormulasClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function FormulasPage() {
  const items = await Formulas.list();

  return (
    <>
      <PageHeader title="Formulas" />
      <FormulasClient items={items} />
    </>
  );
}
