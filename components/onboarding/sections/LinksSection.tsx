// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Rules you asked for:
 * 1) If onboarded => can access /dashboard.
 * 2) If verified by admin => can access /directory.
 * 3) /onboarding is always accessible to a logged-in user (to update profile).
 *
 * Also:
 * - Unauthed users get sent to /auth/login?next=<current>.
 * - Avoid throwing/logging for the common "Auth session missing" case.
 * - Avoid redirect loops.
 */

const PUBLIC_ROUTES = new Set<string>([
  "/",                     // your landing page
  "/favicon.ico",
]);

const AUTH_ROUTES = ["/auth/login", "/auth/signup"]; // pages that should be visible when logged out

// Helpers
function isAsset(req: NextRequest) {
  const { pathname } = new URL(req.url);
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".webp")
  );
}

function redirectWithNext(req: NextRequest, path: string) {
  const url = new URL(path, req.url);
  url.searchParams.set("next", new URL(req.url).pathname + new URL(req.url).search);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = new URL(req.url);
  const path = url.pathname;

  // Skip assets and public routes
  if (isAsset(req) || PUBLIC_ROUTES.has(path)) return res;

  // Allow AUTH routes unauthenticated; if already logged in we’ll shove them to dashboard
  const isAuthRoute = AUTH_ROUTES.some((p) => path.startsWith(p));

  // Build Supabase SSR client (Edge-safe)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          // Mirror cookie updates back to the response
          res.cookies.set(name, value, options);
        },
        remove: (name: string, options: CookieOptions) => {
          res.cookies.set(name, "", options);
        },
      },
    }
  );

  // ---- Auth: never throw on "missing session"
  let user = null as null | { id: string };
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) user = { id: data.user.id };
    // If error?.message === "Auth session missing" -> just treat as logged out (do not console.error)
  } catch {
    // Completely swallow unexpected throws here to avoid Digest pages from middleware
  }

  // If not logged in:
  if (!user) {
    if (isAuthRoute) return res;                  // can view /auth/*
    if (path.startsWith("/onboarding")) return redirectWithNext(req, "/auth/login"); // require login to edit profile
    // protected/approved routes require login
    return redirectWithNext(req, "/auth/login");
  }

  // Logged in: optionally fetch profile flags (onboarded / is_approved)
  let onboarded = false;
  let isApproved = false;

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("onboarded, is_approved")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && profile) {
      onboarded = !!profile.onboarded;
      isApproved = !!profile.is_approved;
    }
    // If there was a DB error, we don't throw from middleware; we just act conservatively (require onboarding)
  } catch {
    // same—never throw in middleware
  }

  // Redirect logged-in user away from /auth pages
  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // /onboarding: always allowed when logged in
  if (path.startsWith("/onboarding")) {
    return res;
  }

  // /dashboard: require onboarded
  if (path.startsWith("/dashboard")) {
    if (!onboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    return res;
  }

  // /directory: require is_approved (admin verified)
  if (path.startsWith("/directory")) {
    if (!onboarded) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    if (!isApproved) {
      // not approved yet → send to dashboard (or a “pending approval” page if you have one)
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return res;
  }

  // Default: allow
  return res;
}

// Match only application routes (avoid static files entirely)
export const config = {
  matcher: [
    "/((?!_next/|.*\\..*).*)",
  ],
};
