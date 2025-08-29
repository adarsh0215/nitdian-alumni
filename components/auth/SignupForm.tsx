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
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import GoogleButton from "@/components/auth/GoogleButton";

const SignupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type SignupValues = z.infer<typeof SignupSchema>;

function getOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export default function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const supabase = React.useMemo(() => supabaseBrowser(), []);
  const [showPw, setShowPw] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const isSubmitting = form.formState.isSubmitting;
  const origin = getOrigin();

  function applySignupError(err: { message?: string; status?: number }) {
    const msg = err?.message || "Unable to sign up.";
    const lower = msg.toLowerCase();

    if (err.status === 429 || /rate|too many/i.test(lower)) {
      setFormError("Too many attempts. Please try again in a moment.");
      return;
    }
    if (/already|exists/i.test(lower)) {
      form.setError("email", { message: "That email is already registered. Try logging in." });
      setFormError(null);
      return;
    }
    if (/password|weak/i.test(lower)) {
      form.setError("password", { message: "Please choose a stronger password." });
      setFormError(null);
      return;
    }
    setFormError(msg);
  }

  async function onSubmit(values: SignupValues) {
    setFormError(null);
    const email = values.email.trim().toLowerCase();
    const password = values.password;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        applySignupError(error);
        return;
      }

      // Most setups: email confirmation -> no session yet
      if (!data.session) {
        toast.success("Check your email to confirm your account.");
        return;
      }

      // Auto-confirm (dev / custom SMTP)
      toast.success("Account created!");
      router.replace("/onboarding");
      router.refresh();
    } catch (e: any) {
      applySignupError({ message: e?.message || "Network error. Please try again." });
    }
  }

  return (
    <div>
      <CardHeader className="">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription className="text-sm mb-6">
          Join the NITDIAN alumni network.
        </CardDescription>
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

        {/* OAuth */}
        <div className={isSubmitting ? "pointer-events-none opacity-60" : ""}>
          <GoogleButton label="Continue with Google" next={next} />
        </div>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground ">
            or
          </span>
        </div>

        {/* Email form */}
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                      <Input
                        {...field}
                        type="email"
                        inputMode="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                        className="h-11 pl-10 focus-visible:focus-ring"
                      />
                    </div>
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                      <Input
                        {...field}
                        type={showPw ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        minLength={6}
                        disabled={isSubmitting}
                        className="h-11 pl-10 pr-9 focus-visible:focus-ring"
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
              className="h-11 w-full dur-2 ease-out-brand hover:-translate-y-[1px] focus-visible:focus-ring mt-4"
              aria-disabled={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </Button>

            
          </form>
        </Form>
      </CardContent>

      <CardFooter className="block">
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/auth/login?next=${encodeURIComponent(next)}`}
            className="underline underline-offset-2 focus-visible:focus-ring rounded"
          >
            Sign in
          </Link>
        </p>
        <p className="text-xs text-muted-foreground mt-6 ">
              By continuing, you acknowledge that you understand and agree to the{" "}
              <Link
                className="underline underline-offset-4 hover:text-foreground focus-visible:focus-ring rounded"
                href="/legal/terms"
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                className="underline underline-offset-4 hover:text-foreground focus-visible:focus-ring rounded"
                href="/legal/privacy"
              >
                Privacy Policy
              </Link>
              .
            </p>
      </CardFooter>
    </div>
  );
}
