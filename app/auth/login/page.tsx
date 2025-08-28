"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect");
  const supabase = React.useMemo(() => supabaseBrowser(), []);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return alert(error.message);
    router.push(redirect || "/onboarding");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input className="w-full rounded border px-3 py-2 text-sm"
                 type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm">Password</label>
          <input className="w-full rounded border px-3 py-2 text-sm"
                 type="password" required minLength={6}
                 value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button className="w-full rounded border px-3 py-2 text-sm font-medium" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="my-4 text-center text-xs text-muted-foreground">or</div>
      <GoogleButton label="Continue with Google" />

      <p className="mt-4 text-sm">
        No account? <a className="underline" href="/auth/signup">Create one</a>
      </p>
    </div>
  );
}
