/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function IngredientsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/ingredients`, { cache: "no-store" });
  const data = await res.json();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Ingredients</h1>
      <ul className="space-y-2">
        {data.map((i: any) => <li key={i.id} className="border rounded p-3">{i.name}</li>)}
      </ul>
    </div>
  );
}
