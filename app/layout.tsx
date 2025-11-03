// app/layout.tsx
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import { AppNav } from "@/components/AppNav";

export const metadata = {
  title: "Perfume App",
  description: "Rewritten on Next.js 16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900">
        <ToastProvider>
          <div className="mx-auto flex min-h-dvh max-w-6xl gap-6 p-6">
            <AppNav />
            <main className="flex-1">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
