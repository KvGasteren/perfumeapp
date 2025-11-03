// app/(routes)/formulas/[id]/page.tsx
import { Formulas } from "@/services/formulas";
import { Ingredients } from "@/services/ingredients";
import { FormulaEditorClient } from "./_client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FormulaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 👇 unwrap the promise — this is what the error was about
  const { id } = await params;
  const formulaId = Number(id);

  if (Number.isNaN(formulaId)) {
    // if someone hits /formulas/foo
    notFound();
  }

  const [formula, ingredientsInFormula, allIngredients] = await Promise.all([
    Formulas.byId(formulaId),
    Formulas.listIngredients(formulaId),
    Ingredients.list(),
  ]);

  return (
    <FormulaEditorClient
      formula={formula}
      initialRows={ingredientsInFormula}
      ingredientOptions={allIngredients}
    />
  );
}
