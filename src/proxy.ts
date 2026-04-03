import { auth } from "@/lib/auth";

/** Routes that require an authenticated session. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/notes",
  "/review",
  "/quizzes",
  "/analytics",
];

/** Routes that authenticated users should be redirected away from. */
const AUTH_ROUTES = ["/signin", "/signup"];

/**
 * Checks whether a pathname starts with any of the given prefixes.
 */
const matchesPrefix = ({
  pathname,
  prefixes,
}: {
  pathname: string;
  prefixes: string[];
}) => prefixes.some((prefix) => pathname.startsWith(prefix));

/**
 * Next.js 16 proxy (replaces middleware).
 *
 * - Redirects unauthenticated visitors away from protected routes to /signin.
 * - Redirects authenticated visitors away from /signin and /signup to /dashboard.
 */
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && matchesPrefix({ pathname, prefixes: PROTECTED_PREFIXES })) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }

  if (isLoggedIn && matchesPrefix({ pathname, prefixes: AUTH_ROUTES })) {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return undefined;
});

/**
 * Matcher config — skip API routes, static assets, and favicon.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
