// app/(routes)/allergens/page.tsx
import PageHeader from "@/components/PageHeader";
import { Allergens } from "@/services/allergens";
import { AllergensClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function AllergensPage() {
  const items = await Allergens.list();

  return (
    <>
      <PageHeader title="Allergens" />
      <AllergensClient items={items} />
    </>  
  );
}
