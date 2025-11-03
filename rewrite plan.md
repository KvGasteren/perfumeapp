# Phase 0 — Project scaffolding

* Create a single **Next.js 16 (App Router)** repo (monorepo not needed).
* Tech baseline: TypeScript, Tailwind, ESLint/Prettier, Zod, Drizzle, NextAuth (optional), Playwright/Vitest.
* Structure:

  ```
  /app
    /(routes)
    /api
  /db
    /schema  (drizzle)
    /migrations
    /seed
  /lib  (zod, utils)
  /components
  ```
* Env shape: `DATABASE_URL` (Neon), `NEXTAUTH_*` (if used), `SENTRY_DSN` (optional).

# Phase 1 — Audit & parity checklist

* Map current features & screens from the provided app:

  * Entities: **Ingredient**, **Allergen**, **IngredientAllergen** (with concentration), **Formula**, **FormulaIngredient** (with parts).
  * Frontend screens: list/detail for Ingredients & Formulas; edit flows; allergen summaries.
  * Backend rules:

    * Deleting an **Ingredient** is blocked if used in a Formula.
    * Deleting an Ingredient removes its **IngredientAllergens**.
* Produce a parity checklist (routes, components, API endpoints, validation, edge cases).

# Phase 2 — Database: Neon + Drizzle

* Create Neon Postgres (EU region), enable **HTTP pooled** connection string for Vercel.
* Define Drizzle schema (typed):

  * `ingredient (id, name)`
  * `allergen (id, name)`
  * `ingredient_allergen (ingredient_id, allergen_id, concentration)`
  * `formula (id, name, created_at, updated_at)`
  * `formula_ingredient (id, formula_id, ingredient_id, parts)`
  * Constraints:

    * `ingredient_allergen` PK (`ingredient_id`, `allergen_id`)
    * `formula_ingredient` FKs; delete restrict on `ingredient_id`
    * cascade delete for `ingredient_allergen` on ingredient removal
* Generate migrations, run via `drizzle-kit`.
* Convert existing `data.sql` into **seed script** (TypeScript) to match new schema.

# Phase 3 — Backend in Next.js Route Handlers

* Implement RESTful endpoints under **/app/api** with Zod validation:

  * `GET/POST /api/ingredients`
  * `GET/PATCH/DELETE /api/ingredients/[id]`
  * `GET/POST /api/allergens`
  * `GET/PATCH/DELETE /api/allergens/[id]`
  * `GET/POST /api/formulas`
  * `GET/PATCH/DELETE /api/formulas/[id]`
  * `GET/POST/DELETE /api/ingredients/[id]/allergens` (manage ingredient-allergen links)
  * `GET/POST/DELETE /api/formulas/[id]/ingredients` (manage formula composition)
* Business rules:

  * **Guard delete Ingredient** if referenced by `formula_ingredient` (409/422 with helpful message).
  * **Cascade**: removing Ingredient ⇒ delete rows in `ingredient_allergen`.
* Performance/hosting fit (Vercel Hobby):

  * Prefer **Node runtime + pooled HTTP** for DB calls.
  * Keep handlers small & stateless; avoid long-running tasks.

# Phase 4 — Frontend rewrite (pixel parity)

* Migrate to **App Router** while keeping the UI identical:

  * Routes:

    * `/ingredients`, `/ingredients/[id]`
    * `/formulas`, `/formulas/[id]`
  * Port components & styles; keep Tailwind tokens matching the original CSS.
* State & data fetching:

  * Keep your chosen UX: **edit locally, send one request at end of editing**.
  * Use **Server Components for lists**; **Client Components for forms**.
  * Fetch via **server actions** or client fetch to `/api/*` (we’ll choose based on complexity per screen).
* Calculations:

  * Preserve client-side allergen summaries and totals exactly.

# Phase 5 — Validation, errors, UX polish

* **Zod** schemas shared (request/response) for type safety front ↔ back.
* Toasts/messages for:

  * validation errors,
  * “cannot delete ingredient used in a formula,”
  * success states.
* Accessibility pass (labels, roles, keyboard flows).

# Phase 6 — Tests

* **Unit**: Drizzle repos/helpers, Zod schemas.
* **API integration**: route handlers with mocked Neon (or test DB).
* **E2E**: Playwright flows (CRUD Ingredient, CRUD Formula, allergen linking, guarded deletes).

# Phase 7 — CI/CD & Observability

* GitHub → Vercel auto-deploy (Preview/Prod).
* `drizzle-kit` migration step in deploy (protected).
* (Optional) **Sentry** for API + frontend error tracking.

# Phase 8 — Data migration (if existing data)

* If there’s live data, write a one-off **import script** (reads old schema/SQL and inserts via Drizzle with mapping).
* Dry-run locally, then run against Neon with backups enabled.

# Phase 9 — Cutover & smoke test

* Deploy to Vercel Hobby with envs.
* Run migrations & seed on Neon.
* Smoke test core flows; compare UI 1:1 against the original.
* Close the parity checklist; log any deltas as follow-ups.

---

## Deliverables per phase

* **0–1:** Repo scaffold + Parity checklist doc.
* **2:** Drizzle schema, migrations, seed script; Neon database ready.
* **3:** Full API under `/app/api/*` with tests.
* **4:** All pages/components migrated; pixel parity verified.
* **5–6:** Validation + tests passing; UX messages polished.
* **7–9:** CI/CD, Sentry (opt), deploy + smoke test, handover notes.

## Immediate next steps (I’ll start now)

1. Initialize the Next.js 16 app with Tailwind + TypeScript and set up base folders.
2. Add Drizzle config, write schema for the 5 tables above, generate first migration.
3. Stand up Neon, set `DATABASE_URL`, run migration, and add a seed script mirroring your current sample data.
4. Scaffold API routes with Zod; implement **Ingredients** end-to-end first (list/detail/edit/delete with the guarded delete).
5. Port `/ingredients` UI to App Router and wire it to the new API, preserving the existing look & “single submit” edit flow.

If you want, I can also drop in the initial **Drizzle schema** and **API route stubs** right away so you can paste them into a fresh repo.
