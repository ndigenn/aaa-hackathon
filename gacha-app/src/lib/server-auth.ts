import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { bootstrapUserRecord } from "@/lib/user-bootstrap";

export async function requireAuthenticatedUser(returnToPath: string) {
  const session = await auth0.getSession();

  if (!session) {
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnToPath)}`);
  }

  await bootstrapUserRecord(session.user);

  return session.user;
}
