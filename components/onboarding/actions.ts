"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function saveOnboarding(input: {
  full_name: string;
  email: string;
  avatar_url: string | null;
  phone_e164: string | null;
  city: string | null;
  country: string | null;
  graduation_year: number | null;
  degree: string | null;
  branch: string | null;
  employment_type: string | null;
  company: string | null;
  designation: string | null;
  linkedin: string | null;
  interests: string[];
  is_public: boolean;
  accepted_terms: boolean;
  accepted_privacy: boolean;
}) {
  const supabase = supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      branch: input.branch,
      employment_type: input.employment_type,
      company: input.company,
      designation: input.designation,
      linkedin: input.linkedin,
      interests: input.interests,
      is_public: input.is_public,
      onboarded: true,
      accepted_terms: !!input.accepted_terms,
      accepted_privacy: !!input.accepted_privacy,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  redirect("/dashboard");
}
