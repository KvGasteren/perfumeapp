// app/(routes)/allergens/[id]/page.tsx
import AllergenDetailClient from "./_client";

type Allergen = {
  id: number;
  name: string;
  ownerId: string;
  casNumber?: string | null;
  maxConcentration?: string | null;
};

export default async function AllergenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const allergenId = Number(id);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/allergens/${allergenId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="p-4 text-sm text-red-500">
        Allergen not found.
      </div>
    );
  }

  const allergen: Allergen = await res.json();

  return <AllergenDetailClient allergen={allergen} />;
}
