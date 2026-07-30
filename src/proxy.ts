import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proxy (the Next 16 rename of middleware.ts) is meant to stand alone rather
// than import shared app modules, so the cookie name and shape are
// duplicated here from src/lib/auth.ts — keep the two in sync if either
// changes.
const SESSION_COOKIE = "ath_session";

function sessionRole(
  request: NextRequest,
): "admin" | "trainer" | "student" | null {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { role?: string };
    return parsed.role === "admin" ||
      parsed.role === "trainer" ||
      parsed.role === "student"
      ? parsed.role
      : null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = sessionRole(request);

  if (pathname === "/admin" && role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (pathname === "/trainer" && role !== "trainer") {
    return NextResponse.redirect(new URL("/trainer/login", request.url));
  }

  if (pathname === "/student" && role !== "student") {
    return NextResponse.redirect(new URL("/student/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/trainer", "/student"],
};
