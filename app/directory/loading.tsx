import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <Section>
      <Container>
        <PageHeader title="Directory" subtitle="Loading members…" />
        <div className="flex h-40 items-center justify-center rounded-xl border bg-card text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Fetching members…
        </div>
      </Container>
    </Section>
  );
}
