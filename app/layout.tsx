// app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import { AppNav } from "@/components/AppNav";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

export const metadata = {
  title: "Perfume for Frank Bloem",
  description: "Written with love by Koen van Gasterten for Frank Bloem",
};

const clerkAppearance = {
  variables: {
    colorPrimary: "#0f172a",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    colorText: "#0f172a",
    colorTextSecondary: "#6b7280",
    borderRadius: "0.5rem",
    fontFamily: "inherit",
  },
  elements: {
    card: "shadow-none border border-neutral-200",
    headerTitle: "text-xl font-semibold tracking-tight",
    headerSubtitle: "text-sm text-neutral-500",
    formButtonPrimary:
      "bg-slate-950 hover:bg-slate-800 text-sm font-medium rounded-md",
    footerActionLink: "text-slate-900 font-medium hover:text-slate-700",
    formFieldInput:
      "rounded-md border border-neutral-300 bg-white text-sm focus:border-neutral-400",
    identityPreviewText: "text-sm text-neutral-700",
    identityPreviewEditButton: "text-slate-900 hover:text-slate-700",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en">
        <body className="min-h-dvh bg-neutral-50 text-neutral-900">
          <ToastProvider>
            <div className="mx-auto flex min-h-dvh max-w-6xl gap-6 p-4 md:p-6 flex-col lg:flex-row">
              <AppNav />
              <div className="flex-1 flex flex-col gap-4">
                <ImpersonationBanner />
                <main className="flex-1">{children}</main>
              </div>
            </div>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
