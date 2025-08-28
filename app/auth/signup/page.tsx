"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import GoogleButton from "@/components/auth/GoogleButton";

export default function SignupPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => supabaseBrowser(), []);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) return alert(error.message);
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Create account</h1>
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
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="my-4 text-center text-xs text-muted-foreground">or</div>
      <GoogleButton label="Sign up with Google" />

      <p className="mt-4 text-sm">
        Already have an account? <a className="underline" href="/auth/login">Log in</a>
      </p>
    </div>
  );
}
