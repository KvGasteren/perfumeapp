/**
 * One-off script: reassign all 'public' ownerId rows to a real Clerk user ID.
 *
 * Usage:
 *   pnpm tsx db/migrate-owner.ts <clerk-user-id>
 *
 * Example:
 *   pnpm tsx db/migrate-owner.ts user_2abc123xyz
 *
 * Find your Clerk user ID in the Clerk dashboard under Users.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import {
  ingredients,
  allergens,
  ingredientAllergens,
  formulas,
  formulaIngredients,
} from "./schema";

const newOwnerId = process.argv[2];

if (!newOwnerId) {
  console.error("Usage: pnpm tsx db/migrate-owner.ts <clerk-user-id>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const db = drizzle({ client: neon(process.env.DATABASE_URL) });
const OLD = "public";

async function run() {
  console.log(`Migrating ownerId "${OLD}" → "${newOwnerId}"...`);

  const tables = [
    { name: "ingredient", table: ingredients },
    { name: "allergen", table: allergens },
    { name: "ingredient_allergen", table: ingredientAllergens },
    { name: "formula", table: formulas },
    { name: "formula_ingredient", table: formulaIngredients },
  ] as const;

  for (const { name, table } of tables) {
    const result = await db
      .update(table)
      .set({ ownerId: newOwnerId })
      .where(eq(table.ownerId, OLD))
      .returning();
    console.log(`  ${name}: ${result.length} row(s) updated`);
  }

  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
