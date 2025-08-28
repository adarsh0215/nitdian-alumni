// app/auth/signup/SignupForm.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

function getOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/** Only allow same-origin, path-only redirects */
function safePath(raw: string | null): string {
  if (!raw) return "/onboarding";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("//")) return "/onboarding";
  if (!raw.startsWith("/")) return "/onboarding";
  return raw;
}

// Minimal Google "G" mark (no extra package)
function GoogleMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.5-1.58 4.4-5.27 4.4-3.17 0-5.76-2.63-5.76-5.86s2.59-5.86 5.76-5.86c1.81 0 3.03.77 3.73 1.43l2.54-2.47C17.4 4.54 15.57 3.7 13.44 3.7 8.76 3.7 5 7.48 5 12.12s3.76 8.42 8.44 8.42c4.87 0 8.1-3.42 8.1-8.25 0-.55-.06-1.09-.19-1.6z" />
    </svg>
  );
}

export default function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safePath(params.get("next"));

  const supabase = React.useMemo(() => supabaseBrowser(), []);
  const [loading, setLoading] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState<null | "google">(null);
  const [showPw, setShowPw] = React.useState(false);

  async function handleEmailSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    if (!email || !password) {
      toast.error("Please enter email and password.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getOrigin()}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!data.session) {
        toast.success("We’ve sent a confirmation link to your email. Verify to continue.");
        return;
      }

      // Auto-confirm case (if enabled). Profile creation can also be handled in /auth/callback.
      toast.success("Account created!");
      router.replace(redirect); // typically /onboarding
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      setOauthLoading("google");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${getOrigin()}/auth/callback?next=${encodeURIComponent(redirect)}`,
          queryParams: {
            // adjust if you want a silent login when possible
            prompt: "consent", // or "select_account"
          },
        },
      });
      if (error) toast.error(error.message);
      // Redirect happens automatically to Google's consent screen.
    } catch (err: any) {
      toast.error(err?.message ?? "Google sign-in failed.");
      setOauthLoading(null);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border bg-background/60 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Join the network in a minute.</p>
      </div>

      <div className="mt-5 space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full gap-2"
          onClick={handleGoogle}
          disabled={!!oauthLoading}
        >
          {oauthLoading === "google" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              <GoogleMark className="h-4 w-4" />
              Continue with Google
            </>
          )}
        </Button>

        <div className="relative py-2">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground">
            or
          </span>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading || !!oauthLoading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={loading || !!oauthLoading}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-2 inline-flex items-center rounded-md p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                aria-label={showPw ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="h-11 w-full" disabled={loading || !!oauthLoading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Sign up with Email"
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href="/legal/terms">
              Terms
            </a>{" "}
            and{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href="/legal/privacy">
              Privacy Policy
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
