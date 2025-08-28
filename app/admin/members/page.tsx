import { supabaseServer } from "@/lib/supabase/server";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { CardGrid } from "@/components/layout/CardGrid";
import { EmptyState } from "@/components/patterns/EmptyState";
import ReviewCard from "./ReviewCard";

export default async function AdminMembersPage() {
  const supabase = await supabaseServer();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, degree, branch, graduation_year, company, role, location, linkedin, bio")
    .eq("moderation", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error.message);
    return (
      <Section>
        <Container>
          <PageHeader title="Members Review" subtitle="Approve or reject new members." />
          <EmptyState title="Error loading members" description={error.message} />
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <PageHeader
          title="Members Review"
          subtitle="Approve or reject new alumni before they appear in the directory."
        />

        {profiles?.length === 0 ? (
          <EmptyState
            title="No pending members"
            description="When new alumni sign up, they’ll appear here for review."
          />
        ) : (
          <CardGrid>
            {profiles?.map((p) => (
              <ReviewCard key={p.id} profile={p} />
            ))}
          </CardGrid>
        )}
      </Container>
    </Section>
  );
}
