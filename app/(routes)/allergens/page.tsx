import PageHeader from "@/components/PageHeader";
import { getAllAllergensForOwner } from "@/lib/data/allergens";
import { getOwnerFilter } from "@/lib/owner";
import { AllergensClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function AllergensPage() {
  const ownerId = await getOwnerFilter();
  const items = await (ownerId ? getAllAllergensForOwner(ownerId) : []);

  return (
    <>
      <PageHeader title="Allergens" />
      <AllergensClient items={items} />
    </>
  );
}
