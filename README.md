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
- Central allergen registry
- Automatic allergen summaries per formula
- Client-side calculations matching regulatory requirements

### Formulas
- Compose formulas from ingredients with parts/ratios
- View detailed breakdowns including allergen totals
- Edit locally and persist changes in a single save action

### Authentication
- Email/password sign-in via Clerk
- Per-user data isolation — each user only sees their own formulas and ingredients

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

It is intended as a realistic portfolio project: not a toy app, but a structured CRUD system with meaningful business logic.

---

## Tech Stack

**Frontend & Backend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Server Components & Route Handlers

**Database**
- PostgreSQL (Neon, EU region)
- Drizzle ORM & migrations

**Validation & Tooling**
- Zod (shared schemas)
- ESLint / Prettier
- Playwright & Vitest (planned / partially implemented)

**Hosting**
- Vercel (Hobby tier, serverless)
- Neon HTTP pooling for database access

---

## Architecture Overview

```text
/app
  /ingredients
  /allergens
  /formulas
  /api
/db
  /schema        # Drizzle schema
  /migrations
/lib             # shared utils & Zod schemas
/components
```

### Key architectural choices

- Single Next.js application (no monorepo, no separate backend)
- Route Handlers for REST-style APIs
- Strict database constraints instead of relying only on frontend logic
- Edit locally → save once UX to reduce unnecessary database writes

---

## Business Rules

- An ingredient **cannot be deleted** if it is used in a formula
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

---

## Testing (WIP)

- Unit tests for schemas and helpers
- API integration tests for core flows
- End-to-end tests for ingredient & formula CRUD

---

## Future Improvements

- Import/export of formulas
- Expanded test coverage

---

## Author

**Koen van Gasteren**  
Working on software, analysis, and systems that are meant to be understood and maintained.

- GitHub: https://github.com/KvGasteren
- LinkedIn: https://linkedin.com/in/koenvangasteren
- Portfolio: https://koenvangasteren.nl

---
