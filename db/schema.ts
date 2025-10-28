import {
  pgTable,
  serial,
  integer,
  real,
  text,
  timestamp,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const ingredients = pgTable("ingredient", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull().default("public"),
});

export const allergens = pgTable("allergen", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull().default("public"),
});

export const ingredientAllergens = pgTable(
  "ingredient_allergen",
  {
    ingredientId: integer("ingredient_id").notNull(),
    allergenId: integer("allergen_id").notNull(),
    concentration: real("concentration").notNull(),
    ownerId: text("owner_id").notNull().default("public"),
  },
  (t) => [primaryKey({ columns: [t.ingredientId, t.allergenId] })]
);

export const formulas = pgTable("formula", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  ownerId: text("owner_id").notNull().default("public"),
});

export const formulaIngredients = pgTable(
  "formula_ingredient",
  {
    id: serial("id").primaryKey(),
    formulaId: integer("formula_id").notNull().references(() => formulas.id, { onDelete: 'cascade', onUpdate: 'cascade'}),
    ingredientId: integer("ingredient_id").notNull().references(() => ingredients.id, { onDelete: 'restrict', onUpdate: 'cascade'}),
    parts: real("parts").notNull(),
    ownerId: text("owner_id").notNull().default("public"),
  },
  (t) => [
    // Ensure only one row per (formula, ingredient)
    uniqueIndex("uniq_formula_ingredient")
      .on(t.formulaId, t.ingredientId, t.ownerId),
  ]
);

// (Optional) relations for typed joins
export const ingredientRelations = relations(ingredients, ({ many }) => ({
  allergens: many(ingredientAllergens),
}));
