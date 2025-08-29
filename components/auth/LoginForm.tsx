"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";

import { ProCard } from "@/components/ui/pro-card";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import GoogleButton from "@/components/auth/GoogleButton";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const supabase = React.useMemo(() => supabaseBrowser(), []);
  const [showPw, setShowPw] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const isSubmitting = form.formState.isSubmitting;

  function applyAuthError(err: { message?: string; status?: number }) {
    const msg = err?.message ?? "Unable to sign in. Please try again.";
    const lower = msg.toLowerCase();

    // Rate limit
    if (err.status === 429 || /rate|too many/i.test(lower)) {
      setFormError("Too many attempts. Please try again in a moment.");
      return;
    }

    // Unconfirmed email
    if (/confirm|verified|not.*confirm/i.test(lower)) {
      form.setError("email", { message: "Please confirm your email, then try again." });
      setFormError("We sent a confirmation link to your inbox.");
      return;
    }

    // Invalid credentials
    if (/invalid|credentials|wrong/i.test(lower) || err.status === 400) {
      form.setError("email", { message: " " }); // keep space to reserve message line
      form.setError("password", { message: "Invalid email or password." });
      setFormError(null);
      return;
    }

    // Fallback
    setFormError(msg);
  }

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    const email = values.email.trim().toLowerCase();
    const password = values.password;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        applyAuthError(error);
        return;
      }

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) {
        setFormError("Signed in, but couldn’t load your session.");
        return;
      }

      // Check onboarding flag
      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", userRes.user.id)
        .maybeSingle();

      if (profErr) {
        // Non-fatal: continue to dashboard
        toast.message("Signed in", { description: "A minor error occurred; continuing." });
        router.replace("/dashboard");
        return;
      }

      toast.success("Welcome back!");
      router.replace(profile?.onboarded ? next : "/onboarding");
    } catch (e: any) {
      applyAuthError({ message: e?.message || "Network error. Please try again." });
    }
  }

  return (
    <div>
      <CardHeader className="mb-8">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription className="text-sm">Sign in to your NITDIAN account.</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Top-level non-field error */}
        {formError && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
            aria-busy={isSubmitting}
          >
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div>

                  </div>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      inputMode="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={isSubmitting}
                      className="focus-visible:focus-ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between ">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/auth/reset"
                      className="px-1 -mx-1 text-xs underline underline-offset-2 text-muted-foreground hover:text-foreground focus-visible:focus-ring rounded"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        className="pr-10 focus-visible:focus-ring"
                        minLength={6}
                      />
                      <button
                        type="button"
                        aria-label={showPw ? "Hide password" : "Show password"}
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground focus-visible:focus-ring"
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-4 h-11 w-full dur-2 ease-out-brand hover:-translate-y-[1px] focus-visible:focus-ring "
              aria-disabled={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="block">
        <div className="my-6">
          <div className="relative text-center">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>
        </div>

        {/* Google OAuth (disabled visually while submitting) */}
        <div className={isSubmitting ? "pointer-events-none opacity-60 " : ""}>
          <GoogleButton label="Continue with Google" next={next} />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={`/auth/signup?next=${encodeURIComponent(next)}`}
            className="underline underline-offset-2 focus-visible:focus-ring rounded"
          >
            Create one
          </Link>
        </p>
      </CardFooter>
    </div>
  );
}
