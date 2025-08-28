"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("next") || "/dashboard";

  const supabase = React.useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    if (data.user) {
      toast.success("Welcome back!");
      router.replace(redirect);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
      <h1 className="text-xl font-semibold">Sign in</h1>

      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Password" required />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Log in"}
      </Button>

      <p className="text-sm text-muted-foreground">
        Don’t have an account? <a href={`/auth/signup?next=${redirect}`} className="text-primary">Sign up</a>
      </p>
    </form>
  );
}
