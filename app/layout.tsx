export const metadata = {
  title: "Perfume App",
  description: "Rewritten on Next.js 16",
};

import "./globals.css";
import { ToastProvider } from "@/components/ui/toast/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900">
        <ToastProvider>
          <main className="mx-auto max-w-6xl p-6">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
