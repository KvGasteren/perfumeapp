// app/page.tsx
import Link from "next/link";
import Image from "next/image";

const sections = [
  {
    title: "Formulas",
    description: "View and edit perfume formulas.",
    href: "/formulas",
  },
  {
    title: "Ingredients",
    description: "Manage ingredients and their allergens.",
    href: "/ingredients",
  },
  {
    title: "Allergens",
    description: "Maintain allergen catalogue.",
    href: "/allergens",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-dvh bg-neutral-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 md:py-16">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:gap-8 md:text-left">
          <div className="mx-auto h-28 w-28 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 md:mx-0 md:h-32 md:w-32">
            {/* swap the src below with your actual illustration from the image library */}
            <Image
              src="/images/perfume-bottle.png"
              alt="Perfume bottle"
              width={128}
              height={128}
              className="h-full w-full object-contain p-3"
              priority
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Perfume app
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
              Dashboard
            </h1>
            <p className="max-w-2xl text-sm text-neutral-500">
              Quick access to your formulas, ingredients, and allergens. Built to match the rest of
              the app.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-medium text-neutral-900">
                  {section.title}
                </h2>
                <span className="text-neutral-300 group-hover:text-neutral-400" aria-hidden>
                  →
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-500">{section.description}</p>
              <p className="mt-4 text-xs font-medium text-neutral-400">Open {section.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
