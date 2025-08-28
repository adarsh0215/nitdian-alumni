import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Header from "./_components/Header";
import ModerationNotice from "./_components/ModerationNotice";
import ProfileCompletionCard from "./_components/ProfileCompletionCard";
import QuickActionsCard from "./_components/QuickActionsCard";
import DetailsCard from "./_components/DetailsCard";
import { ensureModeration, missingFields, completionPercent } from "./_lib/helpers";
import type { Profile } from "./_lib/types";

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set() {}, // no-op in RSC
        remove() {}, // no-op in RSC
      },
    }
  );

  // Ensure session
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) redirect("/auth/login?next=/dashboard");
  const user = userRes.user;

  // Fetch profile
  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select(
      [
        "full_name",
        "email",
        "avatar_url",
        "phone",
        "degree",
        "branch",
        "graduation_year",
        "company",
        "role",
        "location",
        "linkedin",
        "bio",
        "onboarded",
        "moderation",
        "last_active_at",
      ].join(", ")
    )
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profErr || !profile || !profile.onboarded) redirect("/onboarding");

  // Admin check
  const { data: adminRow } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const isAdmin = !!adminRow;

  const name = profile.full_name || user.email || "Friend";
  const moderation = ensureModeration(profile.moderation);
  const { requiredMissing, optionalMissing } = missingFields(profile);
  const completion = completionPercent(profile);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 md:p-6">
      <Header
        name={name}
        email={profile.email || "" }
        avatarUrl={profile.avatar_url}
        isAdmin={isAdmin}
        moderation={moderation}
      />

      {moderation !== "approved" && <ModerationNotice />}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ProfileCompletionCard
          completion={completion}
          requiredMissing={requiredMissing}
          optionalMissing={optionalMissing}
        />
        <QuickActionsCard isAdmin={isAdmin} moderation={moderation} />
      </div>

      <DetailsCard profile={profile} />
    </div>
  );
}
