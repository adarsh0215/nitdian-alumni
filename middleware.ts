import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = new URL(req.url);

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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const login = new URL("/auth/login", url.origin);
    login.searchParams.set("redirect", "/dashboard");
    return NextResponse.redirect(login);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarded) return NextResponse.redirect(new URL("/onboarding", url.origin));
  return res;
}

export const config = { matcher: ["/dashboard/:path*"] };
