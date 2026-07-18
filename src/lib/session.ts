import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Get the current admin/employee session on the server. Returns null if not logged in. */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/** Throws a plain Error if there's no logged-in user -- catch this in API routes to return 401. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/** Throws if the current user isn't an ADMIN -- use for admin-only actions like managing employees. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
