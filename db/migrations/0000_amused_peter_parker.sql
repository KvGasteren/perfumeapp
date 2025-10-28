CREATE TABLE "allergen" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" text DEFAULT 'public' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formula_ingredient" (
	"id" serial PRIMARY KEY NOT NULL,
	"formula_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"parts" real NOT NULL,
	"owner_id" text DEFAULT 'public' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formula" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"owner_id" text DEFAULT 'public' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredient_allergen" (
	"ingredient_id" integer NOT NULL,
	"allergen_id" integer NOT NULL,
	"concentration" real NOT NULL,
	"owner_id" text DEFAULT 'public' NOT NULL,
	CONSTRAINT "ingredient_allergen_ingredient_id_allergen_id_pk" PRIMARY KEY("ingredient_id","allergen_id")
);
--> statement-breakpoint
CREATE TABLE "ingredient" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" text DEFAULT 'public' NOT NULL
);
