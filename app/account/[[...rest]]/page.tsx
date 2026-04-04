import { UserProfile } from "@clerk/nextjs";
import PageHeader from "@/components/PageHeader";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="My account" />
      <UserProfile
        path="/account"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border border-neutral-200 rounded-lg w-full !shadow-none",
            cardBox: "shadow-none !shadow-none",
            navbar: "border-r border-neutral-200",
            navbarButton: "text-sm",
            pageScrollBox: "p-6",
          },
        }}
      />
    </div>
  );
}
