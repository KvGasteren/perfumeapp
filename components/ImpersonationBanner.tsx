import { getImpersonatedUserId, isAdmin } from "@/lib/owner";
import { ExitImpersonationButton } from "./ExitImpersonationButton";

export async function ImpersonationBanner() {
  const admin = await isAdmin();
  if (!admin) return null;

  const impersonating = await getImpersonatedUserId();
  if (!impersonating) return null;

  return (
    <div className="w-full bg-amber-100 border border-amber-300 rounded-lg px-4 py-2 flex items-center justify-between text-sm text-amber-900">
      <span>
        Viewing as <span className="font-mono font-medium">{impersonating}</span>
      </span>
      <ExitImpersonationButton />
    </div>
  );
}
