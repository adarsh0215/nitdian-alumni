// app/onboarding/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { saveOnboarding as saveObjectAction } from "@/components/onboarding/actions";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export const metadata = { title: "Onboarding • AlumniNet" };

/**
 * Server wrapper that matches <form action> signature:
 * must return void | Promise<void>. It adapts FormData -> object
 * and awaits the real action (which will redirect on success).
 */
async function saveOnboarding(formData: FormData): Promise<void> {
  "use server";

  const S = (v: FormDataEntryValue | null) => (v?.toString().trim() || null);
  const N = (v: FormDataEntryValue | null) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const B = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";

  await saveObjectAction({
    full_name: S(formData.get("full_name")) ?? "",
    email: S(formData.get("email")) ?? "",
    avatar_url: S(formData.get("avatar_url")),
    phone_e164: S(formData.get("phone_e164")),
    city: S(formData.get("city")),
    country: S(formData.get("country")),
    graduation_year: N(formData.get("graduation_year")),
    degree: S(formData.get("degree")),
    department: S(formData.get("department")), // ensure this matches your DB column
    employment_type: S(formData.get("employment_type")),
    company: S(formData.get("company")),
    designation: S(formData.get("designation")),
    linkedin: S(formData.get("linkedin")),
    interests: formData.getAll("interests").map(String),
    is_public: B(formData.get("is_public")),
  });
  // no return value -> satisfies <form action> typing
}

export default async function OnboardingPage() {
  const supabase = await supabaseServer();

  // Require auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/onboarding");

  // Prefill values
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name,email,avatar_url,phone_e164,city,country,graduation_year,degree,department,employment_type,company,designation,linkedin,interests,is_public"
    )
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Let’s get you set up</h1>
          <p className="text-sm text-muted-foreground">
            Fill in a few details so other alumni can find you.
          </p>
        </div>

        {/* Pass the server action + prefill into the client form. 
           The form tag lives inside OnboardingForm. */}
        <OnboardingForm action={saveOnboarding} defaultValues={profile ?? undefined} />
      </div>
    </div>
  );
}
