// app/(routes)/ingredients/[id]/page.tsx
import { getBaseUrl } from "@/lib/getBaseUrl";
import IngredientDetailClient from "./_client";

type Ingredient = {
  id: number;
  name: string;
  ownerId: string;
};

type AllergenLink = {
  allergenId: number;
  concentration: number;
  // new fields from the joined endpoint
  allergenName?: string | null;
  casNumber?: string | null;
  maxConcentration?: string | null;
  // older backend might still return name
  name?: string | null;
};

export default async function IngredientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ingredientId = Number(id);

  const baseUrl = getBaseUrl();

  // fetch both ingredient and its allergens from the API
  const [ingredientRes, allergensRes] = await Promise.all([
    fetch(`${baseUrl}/api/ingredients/${ingredientId}`, {
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/ingredients/${ingredientId}/allergens`, {
      cache: "no-store",
    }),
  ]);

  if (!ingredientRes.ok) {
    // you can swap this for notFound()
    return <div className="p-4 text-sm text-red-500">Ingredient not found.</div>;
  }

  const ingredient: Ingredient = await ingredientRes.json();
  const allergens: AllergenLink[] = allergensRes.ok
    ? await allergensRes.json()
    : [];

  return (
    <IngredientDetailClient ingredient={ingredient} allergens={allergens} />
  );
}
