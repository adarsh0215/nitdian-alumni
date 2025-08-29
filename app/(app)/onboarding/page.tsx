// app/onboarding/page.tsx
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = {
  title: "Onboarding • AlumniNet",
};

export default async function OnboardingPage() {
  const supabase = await supabaseServer();

  // 1) Require auth
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    redirect("/auth/login?redirect=/onboarding");
  }

  // 2) If already onboarded, go to dashboard
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  

  // 3) Render the form
  return (
    <div className="px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Let’s get you set up</h1>
          <p className="text-sm text-muted-foreground">
            Fill in a few details so other alumni can find you.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
