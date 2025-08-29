// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  const url = new URL(req.url);
  const path = url.pathname;

  // Guard: envs must exist in Vercel (Production + Preview)
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If these are missing, don't hard-crash the whole app
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("[middleware] Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    return res; // allow the request to pass instead of 500
  }

  const needsAuth =
    path.startsWith("/dashboard") ||
    path.startsWith("/directory") ||
    path.startsWith("/onboarding");

  // Keep refreshed cookies when redirecting
  const redirectWithCookies = (to: string | URL) => {
    const r = NextResponse.redirect(typeof to === "string" ? new URL(to, url.origin) : to);
    // forward any cookies Supabase set on `res`
    for (const c of res.cookies.getAll()) {
      r.cookies.set(c.name, c.value, c); // ensure name/value/options are passed explicitly
    }
    return r;
  };

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set(name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set(name, "", options);
      },
    },
  });

  if (!needsAuth) return res;

  try {
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      console.error("[middleware] getUser error:", userErr.message);
      // If auth check fails, send to login (don’t 500)
      const login = new URL("/auth/login", url.origin);
      login.searchParams.set("redirect", path);
      return redirectWithCookies(login);
    }

    if (!user) {
      const login = new URL("/auth/login", url.origin);
      login.searchParams.set("redirect", path);
      return redirectWithCookies(login);
    }

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("onboarded, is_approved")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr) {
      console.error("[middleware] profiles select error:", profErr.message);
      // Fail open to avoid crashes
      return res;
    }

    const onboarded = !!profile?.onboarded;
    const isApproved = !!profile?.is_approved;

    // 1) Dashboard: must be onboarded
    if (path.startsWith("/dashboard") && !onboarded) {
      const to = new URL("/onboarding", url.origin);
      to.searchParams.set("from", "/dashboard");
      return redirectWithCookies(to);
    }

    // 2) Directory: must be onboarded + approved
    if (path.startsWith("/directory")) {
      if (!onboarded) {
        const to = new URL("/onboarding", url.origin);
        to.searchParams.set("from", "/directory");
        return redirectWithCookies(to);
      }
      if (!isApproved) {
        const to = new URL("/dashboard", url.origin);
        to.searchParams.set("notice", "not-approved");
        return redirectWithCookies(to);
      }
    }

    // 3) /onboarding is always allowed when logged in (to update profile)

    return res;
  } catch (e) {
    console.error("[middleware] Unhandled error:", (e as Error).message);
    // Don’t crash the edge function
    return res;
  }
}

// Only guard these; /auth/callback is intentionally NOT matched
export const config = {
  matcher: ["/dashboard/:path*", "/directory/:path*", "/onboarding/:path*"],
};
