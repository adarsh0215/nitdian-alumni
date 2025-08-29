import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

function safePath(raw: string | null): string {
  if (!raw) return "/onboarding";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("//")) return "/onboarding";
  if (!raw.startsWith("/")) return "/onboarding";
  return raw;
}

// Ensure this route is treated as dynamic (no caching)
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safePath(url.searchParams.get("next"));

  // Prepare a response we can mutate cookies on
  const res = NextResponse.redirect(new URL(next, url.origin));

  // Create a Supabase server client that reads/writes Next.js cookies
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

  if (code) {
    // Exchange the OAuth code for a session (sets auth cookies via cookie adapter above)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // If the exchange fails, punt to login
      return NextResponse.redirect(new URL("/auth/login?error=oauth", url.origin));
    }
  }

  return res;
}
