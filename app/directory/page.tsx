import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { PageHeader } from "@/components/layout/PageHeader";
import { CardGrid } from "@/components/layout/CardGrid";
import { EmptyState } from "@/components/patterns/EmptyState";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import FiltersBar from "./FiltersBar";
import DirectoryCard from "./_components/DirectoryCard";
import PaginationBar from "./_components/PaginationBar";

import { readFilters } from "./_lib/params";
import { fetchDirectory } from "./_lib/query";
import type { SearchParams } from "./_lib/types";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = readFilters(searchParams);
  const { items, totalPages } = await fetchDirectory(filters);

  return (
    <Section>
      <Container>
        <PageHeader
          title="Directory"
          subtitle="Discover alumni by year, branch, company, and location."
          actions={
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          }
        />

        {/* Filters */}
        <div className="mb-6">
          <FiltersBar />
        </div>

        {/* Results */}
        {items.length === 0 ? (
          <EmptyState
            title="No members match your filters"
            description="Try adjusting filters or clearing your search."
            action={{ label: "Clear filters", href: "/directory" }}
            className="min-h-[280px]"
          />
        ) : (
          <>
            <CardGrid>
              {items.map((p) => (
                <DirectoryCard key={p.id} profile={p} />
              ))}
            </CardGrid>

            <PaginationBar
              page={filters.page}
              totalPages={totalPages}
              searchParams={searchParams}
              className="mt-8"
            />
          </>
        )}
      </Container>
    </Section>
  );
}
