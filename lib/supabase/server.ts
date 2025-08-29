// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function supabaseServer() {
  // if TS thinks cookies() returns a Promise, just await it explicitly
  const cookieStore = (cookies() as any); // fallback escape hatch

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(_name: string, _value: string, _options: CookieOptions) {
          // no-op
        },
        remove(_name: string, _options: CookieOptions) {
          // no-op
        },
      },
    }
  );
}
