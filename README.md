# Perfume Formula Manager

A full-stack web application for managing perfume formulas, ingredients, and allergens.  
Built as a **production-ready rewrite** of an existing app, optimized for **serverless hosting on Vercel (Hobby tier)** while maintaining pixel-perfect UI parity.

**Live demo**: https://perfume.koenvangasteren.nl  
**Source code**: https://github.com/KvGasteren/perfumeapp

---

## Features

### Ingredients
- Create, edit, and delete ingredients
- Link allergens with precise concentrations
- Safe deletion: ingredients used in formulas cannot be removed

### Allergens
- Central allergen registry with CAS numbers and concentration limits
- Automatic allergen summaries per formula
- Client-side calculations matching regulatory requirements

### Formulas
- Compose formulas from ingredients with parts/ratios
- View detailed breakdowns including allergen totals
- Edit locally and persist changes in a single save action

### Authentication & Access Control
- Email/password sign-in via Clerk
- Per-user data isolation — each user only sees their own formulas and ingredients
- Admin role (set via Clerk `publicMetadata`) with full CRUD access across all users
- Admin user impersonation — view and edit the app exactly as any user would see it
- Impersonation banner shown at all times when viewing as another user

### UX & Reliability
- Clean, minimal interface
- Clear validation and error handling
- Business rules enforced at API and database level

---

## Why this project?

This project demonstrates:

- Migrating a legacy-style app to a **modern Next.js App Router architecture**
- Designing a **serverless-friendly backend** without a separate API server
- Applying **real-world domain rules** (guarded deletes, cascades, constraints)
- Building a maintainable full-stack application using **TypeScript end-to-end**
- Implementing **multi-user auth and admin oversight** with Clerk

It is intended as a realistic portfolio project: not a toy app, but a structured CRUD system with meaningful business logic.

---

## Tech Stack

**Frontend & Backend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Server Components & Route Handlers

**Auth**
- Clerk (email/password, role-based access, user impersonation)

**Database**
- PostgreSQL (Neon, EU region)
- Drizzle ORM & migrations

**Validation & Tooling**
- Zod (shared schemas)
- ESLint
- Playwright & Vitest (planned)

**Hosting**
- Vercel (Hobby tier, serverless)
- Neon HTTP pooling for database access

---

## Architecture Overview

```text
/app
  /(routes)
    /ingredients      # list + detail pages (server + client components)
    /allergens
    /formulas
    /admin            # admin user list + impersonation
  /api
    /ingredients      # REST-style route handlers
    /allergens
    /formulas
    /admin/impersonate
/db
  schema.ts           # Drizzle schema
  migrate-owner.ts    # one-off data migration script
  /migrations
/lib
  /data               # server-only data functions (one per entity)
    ingredients.ts
    allergens.ts
    formulas.ts
    errors.ts
  owner.ts            # getOwnerId / getOwnerFilter / isAdmin
  zodSchemas.ts       # shared Zod types
/services             # client-side API helpers (used by client components only)
/components           # shared UI components
```

### Key architectural choices

- **Data layer** (`lib/data/*`) — all DB logic lives here; API routes and server pages both call these directly
- **API routes** — thin wrappers: parse request → call data fn → return JSON
- **Server components** — call `lib/data/*` directly, no self-fetch via HTTP
- **Client components** — call `services/*` which fetch the API routes
- Single Next.js application (no monorepo, no separate backend)
- Strict database constraints instead of relying only on frontend logic
- Edit locally → save once UX to reduce unnecessary database writes

---

## Business Rules

- An ingredient **cannot be deleted** if it is used in a formula
- An allergen **cannot be deleted** if it is linked to an ingredient
- Deleting an ingredient **automatically removes** its allergen links
- Allergen totals are calculated deterministically on the client

These rules are enforced at both **API** and **database** level.

---

## Running Locally

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm dev
```

### Environment variables

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### Database commands

```bash
pnpm db:generate   # generate Drizzle migrations
pnpm db:migrate    # run migrations
pnpm db:studio     # open Drizzle Studio
```

### Data migration

To reassign data from `ownerId = 'public'` to a real user:

```bash
pnpm tsx db/migrate-owner.ts <clerk-user-id>
```

---

## Admin Setup

1. Create a user account in the app
2. In the Clerk dashboard, go to **Users → [your user] → Public Metadata** and set:
   ```json
   { "role": "admin" }
   ```
3. An **Admin** link will appear in the navigation
4. From `/admin`, use **View as** to impersonate any user

---

## Future Improvements

- Custom delete confirmation dialogs (replace browser `confirm()`)
- Numeric input UX overhaul (research best practice for decimal inputs)
- Percentage input convention (type `1` for 1%, not `0.01`)
- User account management page (change password, email, delete account)
- Formula sharing between users
- Expanded test coverage (Vitest + Playwright)
- Import/export of formulas

---

## Author

**Koen van Gasteren**  
Working on software, analysis, and systems that are meant to be understood and maintained.

- GitHub: https://github.com/KvGasteren
- LinkedIn: https://linkedin.com/in/koenvangasteren
- Portfolio: https://koenvangasteren.nl

---
