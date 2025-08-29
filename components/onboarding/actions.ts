// components/onboarding/actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export async function saveOnboarding(input: {
  full_name: string; email: string; avatar_url: string | null;
  phone_e164: string | null; city: string | null; country: string | null;
  graduation_year: number | null; degree: string | null; department: string | null;
  employment_type: string | null; company: string | null; designation: string | null;
  linkedin: string | null; interests: string[]; is_public: boolean; accepted_terms: boolean; accepted_privacy: boolean;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✅ Required shape for this @supabase/ssr version
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/onboarding");

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name,
      email: input.email,
      avatar_url: input.avatar_url,
      phone_e164: input.phone_e164,
      city: input.city,
      country: input.country,
      graduation_year: input.graduation_year,
      degree: input.degree,
      department: input.department,        // make sure this matches your DB column
      employment_type: input.employment_type,
      company: input.company,
      designation: input.designation,
      linkedin: input.linkedin,
      interests: input.interests,
      is_public: input.is_public,
      onboarded: true,                      // flip the flag here
      accepted_terms: !!input.accepted_terms,
      accepted_privacy: !!input.accepted_privacy,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  redirect("/dashboard");
}
