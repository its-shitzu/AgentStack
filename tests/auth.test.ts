import { describe, it, expect } from "vitest";
import { auth } from "@/lib/auth";

/**
 * These tests exercise the real Better Auth instance end-to-end (signup →
 * session → logout) and therefore need a real, disposable Postgres database
 * reachable via DATABASE_URL (e.g. a throwaway Neon branch). Run
 * `pnpm db:push` against that database before running `pnpm test`.
 */
describe("auth flow", () => {
  const email = `test-${Date.now()}@example.com`;
  const password = "correct-horse-battery-staple";

  it("signs up, creates a session, and signs out", async () => {
    const signUpResult = await auth.api.signUpEmail({
      body: { name: "Test User", email, password },
    });

    expect(signUpResult.user.email).toBe(email);
    expect(signUpResult.token).toBeTruthy();

    const headers = new Headers();
    headers.set("cookie", `better-auth.session_token=${signUpResult.token}`);

    const session = await auth.api.getSession({ headers });
    expect(session?.user.email).toBe(email);

    const signInResult = await auth.api.signInEmail({
      body: { email, password },
    });
    expect(signInResult.user.email).toBe(email);

    const signOutHeaders = new Headers();
    signOutHeaders.set("cookie", `better-auth.session_token=${signInResult.token}`);
    await auth.api.signOut({ headers: signOutHeaders });

    const sessionAfterSignOut = await auth.api.getSession({ headers: signOutHeaders });
    expect(sessionAfterSignOut).toBeNull();
  });

  it("rejects sign-in with the wrong password", async () => {
    await expect(
      auth.api.signInEmail({
        body: { email, password: "wrong-password" },
      }),
    ).rejects.toThrow();
  });
});
