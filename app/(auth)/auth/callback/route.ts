// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function safePath(raw: string | null): string {
  // Only allow same-origin, absolute paths inside this app
  if (!raw) return "/onboarding";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("//")) return "/onboarding";
  if (!raw.startsWith("/")) return "/onboarding";
  // Avoid looping back to callback
  if (raw.startsWith("/auth/callback")) return "/onboarding";
  return raw;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // Accept both ?next= and ?redirect= (we normalize to next)
  const nextParam = url.searchParams.get("next") ?? url.searchParams.get("redirect");
  const next = safePath(nextParam);

  // Pre-create the redirect response so Supabase can set cookies on it
  const redirectUrl = new URL(next, url.origin);
  const res = NextResponse.redirect(redirectUrl);

  // Cookie bridge wired to the SAME response we'll return
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // NextResponse cookies API accepts an object with name/value/options
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // If provider returned an error (e.g., user cancelled)
  const providerError = url.searchParams.get("error");
  if (providerError) {
    return NextResponse.redirect(
      new URL("/auth/login?error=" + encodeURIComponent(providerError), url.origin)
    );
  }

  // --- 1) OAuth code exchange ---
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/auth/login?error=oauth_exchange_failed", url.origin));
    }
    return res; // success → go to `next`
  }

  // --- 2) Email link / magic link / recovery flows (token_hash) ---
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as
    | "signup"
    | "magiclink"
    | "recovery"
    | "invite"
    | "email_change"
    | null;

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      return NextResponse.redirect(new URL("/auth/login?error=verify_otp_failed", url.origin));
    }
    return res;
  }

  // No recognizable params → just go to next safely
  // in app/auth/callback/route.ts after you have a session:
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  await supabase.from("profiles").upsert(
    { id: user.id, email: user.email ?? "", onboarded: false, is_public: false, is_approved: false },
    { onConflict: "id" }
  );
}

  return res;
}
