import { UserProfile } from "@clerk/nextjs";
import PageHeader from "@/components/PageHeader";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="My account" />
      <UserProfile />
    </div>
  );
}
