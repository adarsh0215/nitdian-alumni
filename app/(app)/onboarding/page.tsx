export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { saveOnboarding as saveObjectAction } from "@/components/onboarding/actions";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { assembleE164 } from "@/lib/validation/onboarding";

export const metadata = { title: "Onboarding • AlumniNet" };

// Server Action wrapper: adapts FormData -> object for the real action
async function saveOnboarding(formData: FormData): Promise<void> {
  "use server";

  const S = (v: FormDataEntryValue | null) => (v?.toString().trim() || null);
  const N = (v: FormDataEntryValue | null) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const B = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";

  // Build E.164 from separate inputs
  const phone_e164 =
    assembleE164(S(formData.get("phone_country")) ?? "", S(formData.get("phone_number")) ?? "") ??
    null;

  // The form uses "branch"; DB column is "department" -> map it here
  const branch = S(formData.get("branch"));

  await saveObjectAction({
    full_name: S(formData.get("full_name")) ?? "",
    email: S(formData.get("email")) ?? "",
    avatar_url: S(formData.get("avatar_url")),
    phone_e164,
    city: S(formData.get("city")),
    country: S(formData.get("country")),
    graduation_year: N(formData.get("graduation_year")),
    degree: S(formData.get("degree")),
    department: branch, // ✅ map branch -> department
    employment_type: S(formData.get("employment_type")),
    company: S(formData.get("company")),
    designation: S(formData.get("designation")),
    linkedin: S(formData.get("linkedin")),
    interests: formData.getAll("interests").map(String),

    // booleans
    is_public: B(formData.get("is_public")),
    accepted_terms: B(formData.get("accepted_terms")),
    accepted_privacy: B(formData.get("accepted_privacy")),
  });
}

export default async function OnboardingPage() {
  const supabase = await supabaseServer();

  // Require auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/onboarding");

  // Prefill (read department from DB)
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name,email,avatar_url,phone_e164,city,country,graduation_year,degree,department,employment_type,company,designation,linkedin,interests,is_public,accepted_terms,accepted_privacy"
    )
    .eq("id", user.id)
    .maybeSingle();

  // Fallback to auth email if row.email is null
  const authEmail =
    user.email ??
    (typeof (user as any)?.user_metadata?.email === "string"
      ? (user as any).user_metadata.email
      : "") ??
    "";

  // Pass branch to the form if the row only has department
  const defaults: any = {
    ...profile,
    email: profile?.email ?? authEmail,
    branch: (profile as any)?.branch ?? (profile as any)?.department ?? undefined,
    accepted_terms: profile?.accepted_terms ?? false,
    accepted_privacy: profile?.accepted_privacy ?? false,
  };

  return (
    <div className="px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Let’s get you set up</h1>
          <p className="text-sm text-muted-foreground">
            Fill in a few details so other alumni can find you.
          </p>
        </div>

        <OnboardingForm action={saveOnboarding} defaultValues={defaults} />
      </div>
    </div>
  );
}
