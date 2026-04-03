import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export const IMPERSONATION_COOKIE = "admin_impersonate";

export async function getOwnerId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");
  return userId;
}

export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  return user?.publicMetadata?.role === "admin";
}

/**
 * Returns the ownerId to scope queries to:
 * - Admin impersonating a user → that user's ID
 * - Admin not impersonating → null (no restriction, sees all)
 * - Regular user → their own ID
 */
export async function getOwnerFilter(): Promise<string | null> {
  const admin = await isAdmin();
  if (!admin) return getOwnerId();

  const jar = await cookies();
  const impersonating = jar.get(IMPERSONATION_COOKIE)?.value;
  return impersonating ?? null;
}

export async function getImpersonatedUserId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(IMPERSONATION_COOKIE)?.value ?? null;
}
