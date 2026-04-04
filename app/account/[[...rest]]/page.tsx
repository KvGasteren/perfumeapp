import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <UserProfile
        path="/account"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none !shadow-none border border-neutral-200 rounded-lg w-full",
            cardBox: "shadow-none !shadow-none",
            navbar: "!bg-white border-r border-neutral-200",
            navbarButton: "text-sm",
            pageScrollBox: "p-6",
            userPreviewAvatarContainer: "hidden",
            userPreviewTextContainer: "hidden",
          },
        }}
      />
    </div>
  );
}
