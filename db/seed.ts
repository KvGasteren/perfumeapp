// db/seed.ts
import "dotenv/config";
import { db } from "./index";
import {
  ingredients,
  allergens,
  ingredientAllergens,
  formulas,
  formulaIngredients,
} from "./schema";

async function main() {
  const OWNER = "public";

  // --- Clean slate for local dev (comment out if you want to preserve data)
  // Order matters due to FKs
  await db.delete(formulaIngredients);
  await db.delete(formulas);
  await db.delete(ingredientAllergens);
  await db.delete(allergens);
  await db.delete(ingredients);

  const ingredientData = [
    { name: "Bergamot", ownerId: OWNER },
    { name: "Rose Absolute", ownerId: OWNER },
    { name: "Sandalwood", ownerId: OWNER },
    { name: "Patchouli", ownerId: OWNER },
    { name: "Orange Sweet", ownerId: OWNER },
    { name: "Lavender", ownerId: OWNER },
    { name: "Ylang Ylang", ownerId: OWNER },
    { name: "Jasmine Sambac", ownerId: OWNER },
    { name: "Cedarwood Atlas", ownerId: OWNER },
    { name: "Vanillin", ownerId: OWNER },
  ];

  const allergenData = [
    {
      name: "Limonene",
      casNumber: "138-86-3",
      maxConcentration: "0.0200",
      ownerId: OWNER,
    },
    {
      name: "Linalool",
      casNumber: "78-70-6",
      maxConcentration: "0.0300",
      ownerId: OWNER,
    },
    {
      name: "Citral",
      casNumber: "5392-40-5",
      maxConcentration: "0.0040",
      ownerId: OWNER,
    },
    {
      name: "Citronellol",
      casNumber: "106-22-9",
      maxConcentration: "0.0180",
      ownerId: OWNER,
    },
    {
      name: "Eugenol",
      casNumber: "97-53-0",
      maxConcentration: "0.0100",
      ownerId: OWNER,
    },
    {
      name: "Geraniol",
      casNumber: "106-24-1",
      maxConcentration: "0.0200",
      ownerId: OWNER,
    },
    {
      name: "Coumarin",
      casNumber: "91-64-5",
      maxConcentration: "0.0010",
      ownerId: OWNER,
    },
    {
      name: "Benzyl alcohol",
      casNumber: "100-51-6",
      maxConcentration: "0.0100",
      ownerId: OWNER,
    },
    {
      name: "Benzyl benzoate",
      casNumber: "120-51-4",
      maxConcentration: "0.0250",
      ownerId: OWNER,
    },
    {
      name: "Hydroxycitronellal",
      casNumber: "107-75-5",
      maxConcentration: "0.0150",
      ownerId: OWNER,
    },
  ];

  const insertedIngredients = await db
    .insert(ingredients)
    .values(ingredientData)
    .returning();

  const insertedAllergens = await db
    .insert(allergens)
    .values(allergenData)
    .returning();

  // Build quick lookups by name
  const ingByName = new Map(insertedIngredients.map((i) => [i.name, i]));
  const allByName = new Map(insertedAllergens.map((a) => [a.name, a]));

  // --- Seed ingredient ↔ allergen links (example concentrations)
  await db.insert(ingredientAllergens).values([
    {
      ingredientId: ingByName.get("Bergamot")!.id,
      allergenId: allByName.get("Limonene")!.id,
      concentration: 0.25,
      ownerId: OWNER,
    },
    {
      ingredientId: ingByName.get("Bergamot")!.id,
      allergenId: allByName.get("Linalool")!.id,
      concentration: 0.05,
      ownerId: OWNER,
    },
    {
      ingredientId: ingByName.get("Orange Sweet")!.id,
      allergenId: allByName.get("Limonene")!.id,
      concentration: 0.3,
      ownerId: OWNER,
    },
    {
      ingredientId: ingByName.get("Lavender")!.id,
      allergenId: allByName.get("Linalool")!.id,
      concentration: 0.02,
      ownerId: OWNER,
    },
    {
      ingredientId: ingByName.get("Rose Absolute")!.id,
      allergenId: allByName.get("Citronellol")!.id,
      concentration: 0.015,
      ownerId: OWNER,
    },
    {
      ingredientId: ingByName.get("Ylang Ylang")!.id,
      allergenId: allByName.get("Benzyl benzoate")!.id,
      concentration: 0.01,
      ownerId: OWNER,
    },
    {
      ingredientId: ingByName.get("Jasmine Sambac")!.id,
      allergenId: allByName.get("Benzyl alcohol")!.id,
      concentration: 0.008,
      ownerId: OWNER,
    },
    {
      ingredientId: ingByName.get("Sandalwood")!.id,
      allergenId: allByName.get("Eugenol")!.id,
      concentration: 0.01,
      ownerId: OWNER,
    },
  ]);

  // --- Seed formulas
  const formulaRows = await db
    .insert(formulas)
    .values([
      { name: "Citrus Prelude", ownerId: OWNER },
      { name: "Rose Velvet", ownerId: OWNER },
      { name: "Woodland Whisper", ownerId: OWNER },
    ])
    .returning();

  const fByName = new Map(formulaRows.map((f) => [f.name, f]));

  // --- Seed formula compositions
  await db.insert(formulaIngredients).values([
    // Citrus Prelude
    {
      formulaId: fByName.get("Citrus Prelude")!.id,
      ingredientId: ingByName.get("Bergamot")!.id,
      parts: 40,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Citrus Prelude")!.id,
      ingredientId: ingByName.get("Orange Sweet")!.id,
      parts: 30,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Citrus Prelude")!.id,
      ingredientId: ingByName.get("Lavender")!.id,
      parts: 10,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Citrus Prelude")!.id,
      ingredientId: ingByName.get("Vanillin")!.id,
      parts: 5,
      ownerId: OWNER,
    },

    // Rose Velvet
    {
      formulaId: fByName.get("Rose Velvet")!.id,
      ingredientId: ingByName.get("Rose Absolute")!.id,
      parts: 35,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Rose Velvet")!.id,
      ingredientId: ingByName.get("Ylang Ylang")!.id,
      parts: 15,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Rose Velvet")!.id,
      ingredientId: ingByName.get("Sandalwood")!.id,
      parts: 10,
      ownerId: OWNER,
    },

    // Woodland Whisper
    {
      formulaId: fByName.get("Woodland Whisper")!.id,
      ingredientId: ingByName.get("Cedarwood Atlas")!.id,
      parts: 25,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Woodland Whisper")!.id,
      ingredientId: ingByName.get("Patchouli")!.id,
      parts: 20,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Woodland Whisper")!.id,
      ingredientId: ingByName.get("Jasmine Sambac")!.id,
      parts: 15,
      ownerId: OWNER,
    },
  ]);

  console.log("Seeded ingredients, allergens, formulas, and compositions ✔");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});