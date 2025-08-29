// app/directory/page.tsx
import Directory, { type SearchParams } from "@/components/directory/Directory";

export default function DirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="px-4 py-8">
      <Directory searchParams={searchParams} />
    </main>
  );
}
