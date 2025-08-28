// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const err  = url.searchParams.get("error") || url.searchParams.get("error_description");

  if (err) {
    return NextResponse.redirect(
      new URL(`/auth/login?oauth_error=${encodeURIComponent(err)}`, url.origin)
    );
  }

  if (code) {
    const supabase = await supabaseServer();

    // 1) Exchange code -> session cookies
    const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
    if (exErr) {
      return NextResponse.redirect(
        new URL(`/auth/login?oauth_error=${encodeURIComponent(exErr.message)}`, url.origin)
      );
    }

    // 2) Ensure a profiles row exists (insert-if-missing, don't overwrite)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const meta = (user.user_metadata ?? {}) as any;
      const fullName  = meta.full_name || meta.name || null;
      const avatarUrl = meta.avatar_url || meta.picture || null;

      await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? null,
            full_name: fullName,
            avatar_url: avatarUrl,
            last_active_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
            ignoreDuplicates: true, // DO NOTHING if row already exists
          }
        );
    }
  }

  // 3) Go to onboarding
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
