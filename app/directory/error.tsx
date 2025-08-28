"use client";

import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <Section>
      <Container>
        <PageHeader title="Directory" subtitle="Something went wrong while fetching members." />
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">
            Please try again. If the issue persists, contact the admin.
          </p>
          <div className="mt-4">
            <Button onClick={reset} variant="outline">Retry</Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
