"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
// If you prefer shadcn's Button, import it and swap the <button> below.

const siteUrl = () =>
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Minimal Google 'G' mark (official colors, no extra deps) */
function GoogleMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M17.64 9.204c0-.638-.057-1.252-.164-1.84H9v3.481h4.844a4.142 4.142 0 0 1-1.797 2.717v2.257h2.91c1.704-1.57 2.683-3.884 2.683-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.957-2.18l-2.91-2.257c-.807.54-1.84.86-3.047.86-2.343 0-4.327-1.58-5.034-3.705H.957v2.33A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.966 10.718A5.394 5.394 0 0 1 3.687 9c0-.597.103-1.175.279-1.718V4.952H.957A8.999 8.999 0 0 0 0 9c0 1.464.35 2.845.957 4.048l3.009-2.33z" />
      <path fill="#EA4335" d="M9 3.583c1.322 0 2.511.455 3.446 1.35l2.584-2.584C13.463.9 11.425 0 9 0A8.997 8.997 0 0 0 .957 4.952l3.009 2.33C4.673 5.156 6.657 3.583 9 3.583z" />
    </svg>
  );
}

export default function GoogleButton({
  label = "Continue with Google",
  next,
  className,
}: {
  label?: string;
  /** Optional path like "/dashboard" or "/onboarding" to round-trip through the callback */
  next?: string | null;
  className?: string;
}) {
  const supabase = React.useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = React.useState(false);

  async function signIn() {
    try {
      setLoading(true);
      const redirectTo = `${siteUrl()}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          // optional in dev to ensure refresh tokens:
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
      // browser will redirect
    } catch (err: any) {
      setLoading(false);
      alert(err?.message || "Google sign-in failed.");
    }
  }

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={loading}
      aria-busy={loading}
      className={`w-full h-11 rounded-md border px-3 text-sm font-medium inline-flex items-center justify-center gap-2 focus-visible:focus-ring  ease-out-brand hover:-translate-y-[1px] hover:bg- ${className ?? ""}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <GoogleMark className="-ml-1" />
      )}
      <span>{loading ? "Redirecting…" : label}</span>
    </button>
  );
}
