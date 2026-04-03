import { auth, currentUser } from "@clerk/nextjs/server";

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
 * Returns the ownerId to use as a query filter.
 * Admins get null (= no owner restriction), regular users get their own ID.
 */
export async function getOwnerFilter(): Promise<string | null> {
  const [ownerId, admin] = await Promise.all([getOwnerId(), isAdmin()]);
  return admin ? null : ownerId;
}
