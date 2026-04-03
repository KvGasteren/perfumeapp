import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/owner";
import { getAllIngredientsAdmin } from "@/lib/data/ingredients";
import { getAllAllergensAdmin } from "@/lib/data/allergens";
import { getAllFormulasAdmin } from "@/lib/data/formulas";
import PageHeader from "@/components/PageHeader";
import { Table, THead, TH, TR, TD } from "@/components/ui/Table";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/");

  const [ingredients, allergens, formulas] = await Promise.all([
    getAllIngredientsAdmin(),
    getAllAllergensAdmin(),
    getAllFormulasAdmin(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title="Admin overview" />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
          Ingredients ({ingredients.length})
        </h2>
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Owner ID</TH>
            </TR>
          </THead>
          <tbody>
            {ingredients.map((row) => (
              <TR key={row.id}>
                <TD>{row.name}</TD>
                <TD className="font-mono text-xs text-neutral-400">{row.ownerId}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
          Allergens ({allergens.length})
        </h2>
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Owner ID</TH>
            </TR>
          </THead>
          <tbody>
            {allergens.map((row) => (
              <TR key={row.id}>
                <TD>{row.name}</TD>
                <TD className="font-mono text-xs text-neutral-400">{row.ownerId}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
          Formulas ({formulas.length})
        </h2>
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Owner ID</TH>
            </TR>
          </THead>
          <tbody>
            {formulas.map((row) => (
              <TR key={row.id}>
                <TD>{row.name}</TD>
                <TD className="font-mono text-xs text-neutral-400">{row.ownerId}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
