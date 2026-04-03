import { cookies } from "next/headers";
import { isAdmin } from "@/lib/owner";
import { IMPERSONATION_COOKIE } from "@/lib/owner";
import { z } from "zod";

const bodySchema = z.object({ userId: z.string().min(1) });

// POST /api/admin/impersonate — start impersonating a user
export async function POST(req: Request) {
  if (!(await isAdmin())) return new Response("Forbidden", { status: 403 });

  const { userId } = bodySchema.parse(await req.json());

  const jar = await cookies();
  jar.set(IMPERSONATION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // No maxAge — session cookie, cleared on browser close or explicit exit
  });

  return new Response(null, { status: 204 });
}

// DELETE /api/admin/impersonate — stop impersonating
export async function DELETE() {
  if (!(await isAdmin())) return new Response("Forbidden", { status: 403 });

  const jar = await cookies();
  jar.delete(IMPERSONATION_COOKIE);

  return new Response(null, { status: 204 });
}
