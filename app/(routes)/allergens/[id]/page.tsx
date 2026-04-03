import { notFound } from "next/navigation";
import { getAllergenById } from "@/lib/data/allergens";
import { getOwnerId } from "@/lib/owner";
import AllergenDetailClient from "./_client";

export default async function AllergenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const allergenId = Number(id);

  if (Number.isNaN(allergenId)) notFound();

  const allergen = await getAllergenById(allergenId, getOwnerId());
  if (!allergen) notFound();

  return <AllergenDetailClient allergen={allergen} />;
}
