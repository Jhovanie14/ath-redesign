import { cookies } from "next/headers";

export type Role = "admin" | "trainer" | "student";
const VALID_ROLES: Role[] = ["admin", "trainer", "student"];

export interface Session {
  role: Role;
  name: string;
  email: string;
}

interface DemoAccount extends Session {
  password: string;
}

// Demo-only credentials for the mock auth gate below — there is no real
// identity provider yet. This is the same kind of seam as getRepository()
// in ./repository.ts: swap findDemoAccount()/getSession() for a real
// provider (e.g. Supabase Auth) without touching the routes that call them.
const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "admin",
    name: "Priya Shah",
    email: "admin@ath.demo",
    password: "admin123",
  },
  {
    role: "trainer",
    name: "Amara Okafor",
    email: "trainer@ath.demo",
    password: "trainer123",
  },
];

export const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  admin: { email: "admin@ath.demo", password: "admin123" },
  trainer: { email: "trainer@ath.demo", password: "trainer123" },
  student: { email: "student@ath.demo", password: "student123" },
};

export const SESSION_COOKIE = "ath_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 1 week

export function findDemoAccount(
  role: Role,
  email: string,
  password: string,
): Session | null {
  const match = DEMO_ACCOUNTS.find(
    (a) =>
      a.role === role &&
      a.email.toLowerCase() === email.trim().toLowerCase() &&
      a.password === password,
  );
  return match ? { role: match.role, name: match.name, email: match.email } : null;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (!VALID_ROLES.includes(parsed.role)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setSession(session: Session) {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Guards against open redirects — only same-origin, absolute-path
 * targets (e.g. "/trainer/dr-amara-okafor") are allowed. Rejects
 * protocol-relative paths ("//evil.com"), backslashes, and C0 control
 * characters (tab/CR/LF/etc.) that browsers strip during URL parsing
 * and could otherwise be used to smuggle a "//evil.com" bypass past
 * the leading-slash check, and anything that isn't a plain string
 * (FormData entries can also be File). */
export function isSafeRedirect(path: unknown): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("\\") &&
    !/[\x00-\x1f]/.test(path)
  );
}
