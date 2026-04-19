import { currentUser } from "@clerk/nextjs/server";
import type { AuthUser } from "./user";

/**
 * requireUser — call in API routes and server components.
 * Returns the authenticated user or throws a 401 Response.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await currentUser();
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

/**
 * requireCron — validates the CRON_SECRET header for cron route handlers.
 */
export function requireCron(request: Request): void {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    throw new Response("Forbidden", { status: 403 });
  }
}
