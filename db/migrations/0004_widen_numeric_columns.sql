ALTER TABLE "allergen" ALTER COLUMN "max_concentration" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "formula_ingredient" ALTER COLUMN "parts" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "ingredient_allergen" ALTER COLUMN "concentration" SET DATA TYPE numeric;