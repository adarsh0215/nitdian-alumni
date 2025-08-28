"use client";

import * as React from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const siteUrl = () =>
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const supabase = React.useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = React.useState(false);

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl()}/auth/callback`, // ← server callback below
        // optional in dev to get refresh tokens:
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      setLoading(false);
      alert(error.message);
    }
  }

  return (
    <button
      type="button"
      onClick={signIn}
      disabled={loading}
      className="w-full rounded-md border px-3 py-2 text-sm font-medium"
    >
      {loading ? "Redirecting..." : label}
    </button>
  );
}
