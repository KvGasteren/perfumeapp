import PageHeader from "@/components/PageHeader";
import { getAllAllergensForOwner } from "@/lib/data/allergens";
import { getOwnerId } from "@/lib/owner";
import { AllergensClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function AllergensPage() {
  const items = await getAllAllergensForOwner(await getOwnerId());

  return (
    <>
      <PageHeader title="Allergens" />
      <AllergensClient items={items} />
    </>
  );
}
