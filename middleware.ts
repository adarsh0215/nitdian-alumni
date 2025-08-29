// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = new URL(req.url);
  const path = url.pathname;

  // Guarded groups (login required)
  const needsAuth =
    path.startsWith("/dashboard") ||
    path.startsWith("/directory") ||
    path.startsWith("/onboarding");

  // 1) Create Supabase server client with cookie bridge
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  );

  // 2) If route needs auth, ensure user exists
  if (needsAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // send to login and safely round-trip back
      const login = new URL("/auth/login", url.origin);
      login.searchParams.set("redirect", path);
      return NextResponse.redirect(login);
    }

    // 3) Fetch profile flags once
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded, is_approved")
      .eq("id", user.id)
      .maybeSingle();

    const onboarded = !!profile?.onboarded;
    const isApproved = !!profile?.is_approved;

    // 4) Route-specific gates
    if (path.startsWith("/dashboard")) {
      // Must be onboarded
      if (!onboarded) {
        const to = new URL("/onboarding", url.origin);
        to.searchParams.set("from", "/dashboard");
        return NextResponse.redirect(to);
      }
    }

    if (path.startsWith("/directory")) {
      // Must be onboarded and approved
      if (!onboarded) {
        const to = new URL("/onboarding", url.origin);
        to.searchParams.set("from", "/directory");
        return NextResponse.redirect(to);
      }
      if (!isApproved) {
        // Not yet approved → keep them in app but away from directory
        const to = new URL("/dashboard", url.origin);
        to.searchParams.set("notice", "not-approved");
        return NextResponse.redirect(to);
      }
    }

    if (path.startsWith("/onboarding")) {
      // Always allowed when logged in (to update profile anytime)
      // no extra checks
    }
  }

  // 5) Otherwise let the request through
  return res;
}

// Only run on these routes
export const config = {
  matcher: ["/dashboard/:path*", "/directory/:path*", "/onboarding/:path*"],
};
