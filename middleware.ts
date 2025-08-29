// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next(); // make it "let" so we can reassign
  const url = new URL(req.url);
  const path = url.pathname;

  const needsAuth =
    path.startsWith("/dashboard") ||
    path.startsWith("/directory") ||
    path.startsWith("/onboarding");

  // small helper to keep refreshed cookies when redirecting
  const redirectWithCookies = (to: string | URL) => {
    const r = NextResponse.redirect(typeof to === "string" ? new URL(to, url.origin) : to);
    // forward any cookies Supabase set on `res`
    for (const c of res.cookies.getAll()) {
      r.cookies.set(c); // { name, value }
    }
    return r;
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { res.cookies.set(name, value, options); },
        remove(name: string, options: CookieOptions) { res.cookies.set(name, "", options); },
      },
    }
  );

  if (needsAuth) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const login = new URL("/auth/login", url.origin);
      login.searchParams.set("redirect", path);
      return redirectWithCookies(login);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded, is_approved")
      .eq("id", user.id)
      .maybeSingle();

    const onboarded = !!profile?.onboarded;
    const isApproved = !!profile?.is_approved;

    if (path.startsWith("/dashboard")) {
      if (!onboarded) {
        const to = new URL("/onboarding", url.origin);
        to.searchParams.set("from", "/dashboard");
        return redirectWithCookies(to);
      }
    }

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

    // /onboarding always allowed when logged in
  }

  return res;
}

// Only guard these; /auth/callback is intentionally NOT matched
export const config = {
  matcher: ["/dashboard/:path*", "/directory/:path*", "/onboarding/:path*"],
};
