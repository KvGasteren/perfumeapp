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

  // --- Seed base entities
  const ingredientData = [
    { name: "Bergamot", ownerId: OWNER },
    { name: "Rose Absolute", ownerId: OWNER },
    { name: "Sandalwood", ownerId: OWNER },
    { name: "Jasmine Sambac", ownerId: OWNER },
    { name: "Cedarwood Atlas", ownerId: OWNER },
    { name: "Vanillin", ownerId: OWNER },
  ];

  const allergenData = [
    { name: "Limonene", ownerId: OWNER },
    { name: "Linalool", ownerId: OWNER },
    { name: "Citral", ownerId: OWNER },
    { name: "Citronellol", ownerId: OWNER },
    { name: "Eugenol", ownerId: OWNER },
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
      ingredientId: ingByName.get("Rose Absolute")!.id,
      allergenId: allByName.get("Citronellol")!.id,
      concentration: 0.12,
      ownerId: OWNER,
    },
    {
      ingredientId: ingByName.get("Jasmine Sambac")!.id,
      allergenId: allByName.get("Linalool")!.id,
      concentration: 0.03,
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

  // --- Seed formula composition (parts add up to 100 for readability)
  await db.insert(formulaIngredients).values([
    // Citrus Prelude
    {
      formulaId: fByName.get("Citrus Prelude")!.id,
      ingredientId: ingByName.get("Bergamot")!.id,
      parts: 45,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Citrus Prelude")!.id,
      ingredientId: ingByName.get("Jasmine Sambac")!.id,
      parts: 10,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Citrus Prelude")!.id,
      ingredientId: ingByName.get("Sandalwood")!.id,
      parts: 15,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Citrus Prelude")!.id,
      ingredientId: ingByName.get("Vanillin")!.id,
      parts: 30,
      ownerId: OWNER,
    },

    // Rose Velvet
    {
      formulaId: fByName.get("Rose Velvet")!.id,
      ingredientId: ingByName.get("Rose Absolute")!.id,
      parts: 55,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Rose Velvet")!.id,
      ingredientId: ingByName.get("Sandalwood")!.id,
      parts: 20,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Rose Velvet")!.id,
      ingredientId: ingByName.get("Vanillin")!.id,
      parts: 25,
      ownerId: OWNER,
    },

    // Woodland Whisper
    {
      formulaId: fByName.get("Woodland Whisper")!.id,
      ingredientId: ingByName.get("Cedarwood Atlas")!.id,
      parts: 50,
      ownerId: OWNER,
    },
    {
      formulaId: fByName.get("Woodland Whisper")!.id,
      ingredientId: ingByName.get("Sandalwood")!.id,
      parts: 35,
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
